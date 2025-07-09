import { Request, Response } from "express";
import Guest from "../models/Guest";
import { customAlphabet } from "nanoid";
import { transporter, emailConfig } from "../config/mailConfig";
import QRCode from "qrcode";

const generateReservationCode = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6
);

export const createGuest = async (req: Request, res: Response) => {
  try {
    const { nombre_invitado, max_acompanantes } = req.body;
    if (!nombre_invitado) {
      return res
        .status(400)
        .json({ message: "El nombre del invitado es requerido." });
    }
    const codigo_reserva = generateReservationCode();
    const newGuest = new Guest({
      nombre_invitado,
      max_acompanantes: max_acompanantes || 0,
      codigo_reserva,
    });
    await newGuest.save();
    res.status(201).json({
      message: "Invitado creado exitosamente.",
      guest: newGuest,
    });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error al crear el invitado.", error: error.message });
    } else {
      res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
  }
};

/**
 * @route   POST /api/invitados/confirmar
 * @desc    Confirmar la asistencia y enviar email con código QR
 */
export const confirmAttendance = async (req: Request, res: Response) => {
  try {
    const { codigo_reserva, email, acompanantes_confirmados } = req.body;

    if (!codigo_reserva || !email) {
      return res
        .status(400)
        .json({ message: "El código de reserva y el email son requeridos." });
    }
    const numAcompanantes = Number(acompanantes_confirmados) || 0;
    const guest = await Guest.findOne({ codigo_reserva });

    if (!guest) {
      return res
        .status(404)
        .json({ message: "Código de reserva no encontrado." });
    }
    if (guest.confirmado) {
      return res.status(400).json({
        message: `Tu asistencia ya ha sido confirmada. Los detalles de tu invitación fueron enviados a tu correo registrado`,
      });
    }
    if (numAcompanantes < 0 || numAcompanantes > guest.max_acompanantes) {
      return res.status(400).json({
        message: `El número de acompañantes (${numAcompanantes}) no es válido. El máximo permitido es ${guest.max_acompanantes}.`,
      });
    }
    guest.confirmado = true;
    guest.email_confirmacion = email;
    guest.acompanantes_confirmados = numAcompanantes;
    await guest.save();

    const baseUrl = process.env.FRONTEND_URL || "localhost:3000";
    const qrUrl = `${baseUrl}/invitacion/${guest.codigo_reserva}`;
    const qrCodeImage = await QRCode.toDataURL(qrUrl, {
      width: 250,
      margin: 1,
      color: {
        light: "#FFFFFF",
      },
    });

  const emailHtml = `
    <div style="background-color: #f9f9f9; font-family: Arial, sans-serif; padding: 20px; text-align: center;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        
        <div style="background-color: #f3f1eb; padding: 30px 40px;">
          <h2 style="font-family: 'Times New Roman', Times, serif; color: #6d4c41; text-align: center; font-size: 28px; font-weight: normal; margin: 0;">
            Confirmación de Asistencia
          </h2>
        </div>

        <div style="padding: 40px; text-align: left; color: #333; font-size: 16px; line-height: 1.6;">
          
          <p>
            Hola <strong>${guest.nombre_invitado}</strong>,
          </p>
          
          <p>
            Gracias por confirmar tu asistencia a nuestra boda!
          </p>

          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 30px 0;">

          <h3 style="font-family: 'Times New Roman', Times, serif; color: #6d4c41; font-size: 20px; font-weight: normal; margin-top: 0;">
            Resumen de tu confirmación
          </h3>
          <p style="margin-top: 10px; color: #333;">
            <strong>Invitados confirmados:</strong> ${numAcompanantes + 1}
          </p>
          <p style="margin-top: 20px; color: #333;">
            Este es tu código QR de confirmación, por favor muestra el siguiente código QR el día del evento:
            Te recomendamos <strong>guardar este correo</strong>.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <img src="cid:qrcode" alt="Código QR de confirmación" style="max-width: 180px; height: auto; border: 1px solid #6d4c41; padding: 5px;" />
          </div>

          <div style="background-color: #f3f1eb; padding: 20px; border-radius: 5px; text-align: center; margin-top: 30px; color: #6d4c41;">
              <p style="margin: 0; font-size: 14px; color: #6d4c41;">Detalles del evento:</p>
              <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: bold; color: #333;">
                  Sábado, 13 de Diciembre de 2025<br>
                  4:00 PM
              </p>
              <p style="margin: 10px 0 0 0; font-size: 15px; color: #333;">
                Jardín Magnolia Morelos
              </p>
          </div>

          <div style="text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 18px; color: #6d4c41; margin-top: 40px;">
            <p style="margin: 0;">Con cariño,</p>
            <p style="margin: 5px 0 0 0; font-weight: bold;">Brenda y Jordi</p>
          </div>

        </div>
      </div>
    </div>
  `;

    await transporter.sendMail({
      from: emailConfig.from,
      to: email,
      subject: "Confirmación de Asistencia",
      html: emailHtml,
      // 👇 Esta sección enlaza el 'cid:qrcode' con la imagen
      attachments: [
        {
          filename: "qrcode.png",
          path: qrCodeImage,
          cid: "qrcode", // <- El ID al que se hace referencia
        },
      ],
    });

    console.log(`Correo de confirmación enviado a ${email}`);

    res.status(200).json({
      message: `¡Gracias por confirmar, ${guest.nombre_invitado}! Se ha enviado un correo con tu código QR a ${email}.`,
      guest,
    });
  } catch (error) {
    console.error("Error en el proceso de confirmación:", error);
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error al confirmar la asistencia.",
        error: error.message,
      });
    } else {
      res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
  }
};

export const getAllGuests = async (req: Request, res: Response) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    res.status(200).json(guests);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error al obtener los invitados.",
        error: error.message,
      });
    } else {
      res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
  }
};

export const getConfirmedGuests = async (req: Request, res: Response) => {
  try {
    const confirmedGuests = await Guest.find({ confirmado: true }).sort({
      updatedAt: -1,
    });
    res.status(200).json(confirmedGuests);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error al obtener los invitados confirmados.",
        error: error.message,
      });
    } else {
      res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
  }
};

export const updateGuest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre_invitado, max_acompanantes } = req.body;
    const updatedGuest = await Guest.findByIdAndUpdate(
      id,
      { nombre_invitado, max_acompanantes },
      { new: true, runValidators: true }
    );
    if (!updatedGuest) {
      return res.status(404).json({ message: "Invitado no encontrado." });
    }
    res.status(200).json({
      message: "Invitado actualizado correctamente.",
      guest: updatedGuest,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error al actualizar el invitado.",
        error: error.message,
      });
    } else {
      res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
  }
};

export const deleteGuest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedGuest = await Guest.findByIdAndDelete(id);
    if (!deletedGuest) {
      return res.status(404).json({ message: "Invitado no encontrado." });
    }
    res.status(200).json({
      message: `El invitado '${deletedGuest.nombre_invitado}' ha sido eliminado.`,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error al eliminar el invitado.",
        error: error.message,
      });
    } else {
      res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
  }
};
/**
 * @route   GET /api/invitados/codigo/:code
 * @desc    Buscar un invitado por su código de reserva
 */
export const getGuestByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const guest = await Guest.findOne({ codigo_reserva: code });

    if (!guest) {
      return res.status(404).json({
        message: "No se encontró ningún invitado con ese código de reserva.",
      });
    }

    res.status(200).json(guest);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error al buscar el invitado.",
        error: error.message,
      });
    } else {
      res.status(500).json({ message: "Ocurrió un error desconocido." });
    }
  }
};
