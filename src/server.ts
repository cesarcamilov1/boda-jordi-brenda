import express, { Express } from "express";
import cors from "cors";
import compression from "compression";
import { createServer } from "http";
import { serverConfig } from "./config/serverConfig";
import { connectDB } from "./config/dbConfig";
import { verifyMailConnection } from "./config/mailConfig";

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

const middlewares = (app: Express) => {
  
  app.use(cors());

  app.use(compression());

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  if (!serverConfig.isProduction) {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url}`);
      next();
    });
  }
};

const start = async () => {
  try {
    await connectDB();
    await verifyMailConnection();
    middlewares(app);
    routes(app);
    server(app);
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1);
  }
};

start();
