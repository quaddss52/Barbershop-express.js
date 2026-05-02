import express from "express";
import {
  createService,
  getServiceById,
  getServices,
  updateService,
  updateServiceStatus,
} from "../controllers/serviceController.js";

const servicesRouter = express.Router();

servicesRouter.get("/", getServices);

servicesRouter.get("/:id", getServiceById);

servicesRouter.post("/", createService);

servicesRouter.put("/:id", updateService);

servicesRouter.put("/:id/toggle", updateServiceStatus);

export default servicesRouter;
