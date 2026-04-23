import { Router } from "express";
import testController from "../controllers/test.controller.js";

const router = Router();

router.post("/", testController.createTest);
router.get("/", testController.getAllTest);
router.get("/:id", testController.getByIdTest);
export default router;