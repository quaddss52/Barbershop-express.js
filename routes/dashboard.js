import express from "express";
import { getdasboardData } from "../controllers/dashboardController.js";

const dasboardRouter = express.Router();

dasboardRouter.get("/", getdasboardData);

export default dasboardRouter;
