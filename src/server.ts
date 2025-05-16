import express, { Express } from "express";
import cors from "cors";
import { createServer } from "http";
import { serverConfig } from "./config/serverConfig";

const app = express();

const routes = (app: Express) => {
  app.get("/", (request, response) => {
    response.send("Que vivan los novios xdxd .API");
  });
};

const server = (app: Express) => {
  const httpServer = createServer(app);
  const PORT = serverConfig.port || 4202;
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

const start = async () => {
  app.use(cors());
  app.use(express.json());
  routes(app);
  server(app);
};

start();