import { Request, Response } from "express";
import Guest from "../models/Guest";
import { customAlphabet } from "nanoid";
import { transporter, emailConfig } from "../config/mailConfig";
import QRCode from "qrcode";

const generateReservationCode = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

export const createGuest = async (req: Request, res: Response) => {
    try {
        const { nombre_invitado, max_acompanantes } = req.body;
        if (!nombre_invitado) {
            return res.status(400).json({ message: "El nombre del invitado es requerido." });
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
            res.status(500).json({ message: "Error al crear el invitado.", error: error.message });
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
            return res.status(400).json({ message: "El código de reserva y el email son requeridos." });
        }
        const numAcompanantes = Number(acompanantes_confirmados) || 0;
        const guest = await Guest.findOne({ codigo_reserva });

        if (!guest) {
            return res.status(404).json({ message: "Código de reserva no encontrado." });
        }
        if (guest.confirmado) {
            return res.status(400).json({ message: "Esta asistencia ya ha sido confirmada previamente." });
        }
        if (numAcompanantes < 0 || numAcompanantes > guest.max_acompanantes) {
            return res.status(400).json({
                message: `El número de acompañantes (${numAcompanantes}) no es válido. El máximo permitido es ${guest.max_acompanantes}.`
            });
        }

        guest.confirmado = true;
        guest.email_confirmacion = email;
        guest.acompanantes_confirmados = numAcompanantes;
        await guest.save();

        const qrData = JSON.stringify({
            codigo_reserva: guest.codigo_reserva,
            nombre: guest.nombre_invitado,
            total_personas: numAcompanantes + 1,
        });

        const qrCodeImage = await QRCode.toDataURL(qrData);

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Confirmación de Asistencia</h2>
                <p>Hola, <strong>${guest.nombre_invitado}</strong>,</p>
                <p>Gracias por confirmar tu asistencia a nuestra boda.</p>
                <p><strong>Número de personas confirmadas:</strong> ${numAcompanantes + 1} (Tú y ${numAcompanantes} acompañante(s))</p>
                <hr>
                <h3>Este es tu código QR de confirmación</h3>
                <p>Por favor, muéstralo el día del evento:</p>
                <img src="${qrCodeImage}" alt="Código QR de confirmación" />
                <p>¡Te esperamos!</p>
            </div>
        `;

        await transporter.sendMail({
            from: emailConfig.from,
            to: email,
            subject: "Confirmación de Asistencia",
            html: emailHtml,
            attachments: [{
                filename: 'qrcode.png',
                path: qrCodeImage,
                cid: 'qrcode'
            }]
        });

        console.log(`Correo de confirmación enviado a ${email}`);

        res.status(200).json({
            message: `¡Gracias por confirmar, ${guest.nombre_invitado}! Se ha enviado un correo con tu código QR a ${email}.`,
            guest,
        });

    } catch (error) {
        console.error("Error en el proceso de confirmación:", error);
        if (error instanceof Error) {
            res.status(500).json({ message: "Error al confirmar la asistencia.", error: error.message });
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
            res.status(500).json({ message: "Error al obtener los invitados.", error: error.message });
        } else {
            res.status(500).json({ message: "Ocurrió un error desconocido." });
        }
    }
};

export const getConfirmedGuests = async (req: Request, res: Response) => {
    try {
        const confirmedGuests = await Guest.find({ confirmado: true }).sort({ updatedAt: -1 });
        res.status(200).json(confirmedGuests);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error al obtener los invitados confirmados.", error: error.message });
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
        res.status(200).json({ message: "Invitado actualizado correctamente.", guest: updatedGuest });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error al actualizar el invitado.", error: error.message });
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
        res.status(200).json({ message: `El invitado '${deletedGuest.nombre_invitado}' ha sido eliminado.` });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error al eliminar el invitado.", error: error.message });
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
            return res.status(404).json({ message: "No se encontró ningún invitado con ese código de reserva." });
        }

        res.status(200).json(guest);

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: "Error al buscar el invitado.", error: error.message });
        } else {
            res.status(500).json({ message: "Ocurrió un error desconocido." });
        }
    }
};