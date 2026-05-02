import express from "express";
import {
  cancelAppointment,
  createAppointment,
  getAppointmentById,
  getAppointments,
  getAvailableTimeSlots,
  updateAppointment,
} from "../controllers/appointmentController.js";

const appointmentRouter = express.Router();

appointmentRouter.get("/", getAppointments);
appointmentRouter.get("/getAvailableTimeSlots", getAvailableTimeSlots);
appointmentRouter.get("/:id", getAppointmentById);
appointmentRouter.post("/", createAppointment);
appointmentRouter.put("/:id/cancel", cancelAppointment);
appointmentRouter.put("/:id", updateAppointment);

export default appointmentRouter;
