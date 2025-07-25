import { Router } from "express";
import {
  createGuest,
  confirmAttendance,
  getAllGuests,
  getConfirmedGuests,
  updateGuest,
  deleteGuest,
  getGuestByCode
} from "../controllers/guestController";

const router = Router();

router.post("/", createGuest);

router.post("/confirmar", confirmAttendance);

router.get("/", getAllGuests);

router.get("/confirmados", getConfirmedGuests);

router.put("/:id", updateGuest);

router.delete("/:id", deleteGuest);

router.get("/codigo/:code", getGuestByCode);



export default router;