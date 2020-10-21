import express from "express";
import { promises } from "fs"; //só importa um objeto (sem chaves importa a biblioteca inteira)
const router = express.Router();

const writeFile = promises.writeFile;
const readFile = promises.readFile;

router.post("/", async (req, res) => {
  let account = req.body;

  try {
    let data = await readFile("accounts.json", "utf-8"); //o "data" passa a ser retornada pela promise
    //data vem como string
    let json = JSON.parse(data);
    account = { id: json.netxId, ...account };
    json.netxId++;
    json.accounts.push(account); //insere no vetor accounts[]

    await writeFile("accounts.json", JSON.stringify(json));
    res.send({ message: "inserido com sucesso" });

    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (error) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /account - ${err.message}`);
  }
});

router.get("/", async (_, res) => {
  try {
    let data = await readFile("accounts.json", "utf8");
    let json = JSON.parse(data);
    delete json.netxId;
    res.send(json);

    logger.info("GET /account");
  } catch (error) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /account - ${err.message}`);
  }
});

router.get("/:id", async (req, res) => {
  //console.log(req.params.id);
  try {
    let data = await readFile("accounts.json", "utf8");
    let json = JSON.parse(data);
    const account = json.accounts.find(
      (account) => account.id == parseInt(req.params.id)
    );
    if (account) {
      res.send(account);
      logger.info(`GET /account ${JSON.stringify(account)}`);
    } else {
      res.end();
    }
  } catch (error) {
    res.status(400).send({ error: err.message });
    logger.error(`GET /account - ${err.message}`);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let data = await readFile("accounts.json", "utf8");
    let json = JSON.parse(data);
    let accounts = json.accounts.filter(
      (account) => account.id !== parseInt(req.params.id)
    ); //remove o que for diferente (que for falso)
    json.accounts = accounts;

    await writeFile("accounts.json", JSON.stringify(json));
    res.end();
    logger.info(`DELETE /account ${req.params.id}`);
  } catch (error) {
    res.status(400).send({ error: err.message });
    logger.error(`DELETE /account - ${err.message}`);
  }
});

router.put("/", async (req, res) => {
  let newAccount = req.body;

  try {
    let data = await readFile("accounts.json", "utf-8");
    let json = JSON.parse(data);
    let oldIndex = json.accounts.findIndex(
      (account) => account.id == newAccount.id
    );
    json.accounts[oldIndex] = newAccount;

    await writeFile("accounts.json", JSON.stringify(json));
    res.end();
    logger.info(`PUT /account ${JSON.stringify(newAccount)}`);
  } catch (error) {
    res.status(400).send({ error: err.message });
    logger.error(`PUT /account - ${err.message}`);
  }
});

router.post("/deposit", async (req, res) => {
  try {
    let newBalance = req.body;
    let data = await readFile("accounts.json", "utf-8");
    let json = JSON.parse(data);
    let index = json.accounts.findIndex(
      (account) => account.id == newBalance.id
    );
    json.accounts[index].balance += newBalance.value;

    await writeFile("accounts.json", JSON.stringify(json));
    res.end();
    logger.info(`DEPOSIT /account ${JSON.stringify(req.params)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /account/deposit - ${err.message}`);
  }
});

router.post("/transaction", async (req, res) => {
  try {
    let withdraw = req.body;
    let data = await readFile("accounts.json", "utf-8");
    let json = JSON.parse(data);
    let index = json.accounts.findIndex((account) => account.id == withdraw.id);

    if (withdraw.value > json.accounts[index].balance)
      throw new Error("Não há saldo suficiente!");
    json.accounts[index].balance -= withdraw.value;

    await writeFile("accounts.json", JSON.stringify(json));
    res.end();
    logger.info(`POST /account/transaction ${JSON.stringify(req.params)}`);
  } catch (err) {
    res.status(400).send({ error: err.message });
    logger.error(`POST /account/transaction - ${err.message}`);
  }
});

//module.exports = router;
export default router;
