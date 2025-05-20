import dotenv from "dotenv";
dotenv.config();

export const serverConfig = {
  port: process.env.PORT || 2002,
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
};