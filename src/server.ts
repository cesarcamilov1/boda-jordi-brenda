import express, { Express } from "express";
import cors from "cors";
import compression from "compression";
import { serverConfig } from "./config/serverConfig";
import { connectDB } from "./config/dbConfig";
import { verifyMailConnection } from "./config/mailConfig";

import guestRoutes from "./routes/guestRoutes";

const initializeApp = async (): Promise<Express> => {
  await connectDB();
  await verifyMailConnection();

  const app = express();

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

  app.get("/", (request, response) => {
    response.send("API funcionando correctamente");
  });
  app.use("/api/invitados", guestRoutes);

  return app;
};

export default initializeApp();