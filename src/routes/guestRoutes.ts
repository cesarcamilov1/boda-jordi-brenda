import { Router } from "express";
import {
  createGuest,
  confirmAttendance,
  getAllGuests,
  getConfirmedGuests,
  updateGuest,
  deleteGuest
} from "../controllers/guestController";

const router = Router();

router.post("/", createGuest);

router.post("/confirmar", confirmAttendance);

router.get("/", getAllGuests);

router.get("/confirmados", getConfirmedGuests);

router.put("/:id", updateGuest);

router.delete("/:id", deleteGuest);


export default router;