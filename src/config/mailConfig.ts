import { SESClient } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
dotenv.config();

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  EMAIL_FROM,
} = process.env;

// Configurar el cliente de AWS SES
export const sesClient = new SESClient({
  region: AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || "",
    secretAccessKey: AWS_SECRET_ACCESS_KEY || "",
  },
});

export const verifyMailConnection = async (): Promise<void> => {
  try {
    // AWS SES no requiere verificación de conexión como Nodemailer
    // La verificación se hace al enviar el primer correo
    console.log("AWS SES configurado y listo para enviar correos");
  } catch (error) {
    console.error("Error al configurar AWS SES:", error);
    console.warn("Las funciones de email no están disponibles");
  }
};

export const emailConfig = {
  from: EMAIL_FROM || "noreply@example.com",
};