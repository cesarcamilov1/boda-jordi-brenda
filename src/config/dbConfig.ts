import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "Url de MongoDB por defecto";

export const dbConfig = {
  url: MONGODB_URI,
  options: {
    autoIndex: true,
    maxPoolSize: 10, 
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
};

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(dbConfig.url, dbConfig.options);
    console.log("✅ Conexión establecida con la DB");
  } catch (error) {
    console.error("Error al conectar:", error);
    process.exit(1);
  }
};

// Manejo de eventos de conexión de MongoDB
mongoose.connection.on("error", (err) => {
  console.error("Error de conexión a MongoDB:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Desconectado de MongoDB");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🔌 Conexión a MongoDB cerrada por finalización de la aplicación");
  process.exit(0);
});
