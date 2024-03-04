import express from "express";
import UserController from "../controller/Monitor.Controller.js";

const router = express.Router();

router.post("/createAccount", UserController.createAccount);

export default router;