import express from "express";
import {
  createShopHoursConfig,
  getShopHoursConfig,
  getShopHoursConfigByDay,
  updateShopHoursConfig,
} from "../controllers/shopHoursController.js";

const shopHoursRouter = express.Router();

shopHoursRouter.get("/", getShopHoursConfig);
shopHoursRouter.get("/:day", getShopHoursConfigByDay);

shopHoursRouter.post("/", createShopHoursConfig);

shopHoursRouter.put("/", updateShopHoursConfig);

export default shopHoursRouter;
