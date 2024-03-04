import express from "express";
import UserController from "../controller/User.Controller.js";

const router = express.Router();

router.post("/buyProduct", UserController.buyProduct);
router.get("/fillerProduct", UserController.fillerProduct);
router.patch("/purchaseOrder", UserController.purchaseOrder);
router.get("/CreateOrder", UserController.CreateOrder);

export default router;