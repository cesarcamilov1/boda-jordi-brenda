import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
  EMAIL_FROM,
  EMAIL_SECURE,
  NODE_ENV
} = process.env;

const mailConfig = {
  host: EMAIL_HOST || "smtp.gmail.com",
  port: Number(EMAIL_PORT) || 465,
  secure: EMAIL_SECURE === "true",
  auth: {
    user: EMAIL_USER || "",
    pass: EMAIL_PASSWORD || ""
  },
  tls: {
    rejectUnauthorized: NODE_ENV === "production" 
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
};

const transporter = nodemailer.createTransport(mailConfig);

export const verifyMailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log("Nodemailer al toque para enviar correos");
  } catch (error) {
    console.error("Error al conectar con el servidor:", error);
    console.warn("La funciones no estan disponibles");
  }
};

export { transporter };
export const emailConfig = {
  from: EMAIL_FROM || `Nuestra Boda <${EMAIL_USER}>`,
};