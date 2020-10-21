import express from "express";
import winston from "winston";
import { promises } from "fs";
import accountsRouter from "./routes/accounts.js";

const app = express();

const writeFile = promises.writeFile;
const readFile = promises.readFile;

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
}); //2020-10-21T16:05:18.634Z [my-bank-api] info: API Started!

global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "my-bank-api.log" }),
  ],
  format: combine(label({ label: "my-bank-api" }), timestamp(), myFormat),
});

app.use(express.json());
app.use("/account", accountsRouter);

app.listen(3000, async () => {
  try {
    await readFile("accounts.json", "utf8");
    logger.info("API Started!");
  } catch (err) {
    const initialJson = {
      netxId: 1,
      accounts: [],
    };
    await writeFile("accounts.json", JSON.stringify(initialJson)).catch(
      (err) => {
        logger.error(err);
      }
    );
  }
});
