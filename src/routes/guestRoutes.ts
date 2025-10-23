import { Router } from "express";
import {
  createGuest,
  confirmAttendance,
  getAllGuests,
  getConfirmedGuests,
  updateGuest,
  deleteGuest,
  getGuestByCode,
  resendInvitation
} from "../controllers/guestController";

const router = Router();

router.post("/", createGuest);

router.post("/confirmar", confirmAttendance);

router.post("/reenviar-invitacion", resendInvitation);

router.get("/", getAllGuests);

router.get("/confirmados", getConfirmedGuests);

router.put("/:id", updateGuest);

router.delete("/:id", deleteGuest);

router.get("/codigo/:code", getGuestByCode);



export default router;