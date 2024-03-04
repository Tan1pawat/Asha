import express from "express";
import UserController from "../controller/Admin.Controller.js";

const router = express.Router();

router.post("/createCatalog", UserController.createCatalog);
router.post("/createProduct", UserController.createProduct);
router.post("/addProdductDetails", UserController.AddProdductDetails);

export default router;