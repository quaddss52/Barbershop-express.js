import express from "express";
import {
  createCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../controllers/customersContoller.js";

const customerRouter = express.Router();

customerRouter.get("/", getCustomers);

customerRouter.get("/:id", getCustomerById);

customerRouter.post("/", createCustomer);

customerRouter.put("/:id", updateCustomer);

export default customerRouter;
