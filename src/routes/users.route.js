import { Router } from "express";

const router = Router();

import userController from "../controllers/users.controller.js";
import { authentication, authorization } from "../middlewares/auth.middleware.js";
import UserRole from "../enums/user-role.enum.js";

router.get("/", authentication, userController.getUsers);

router.get("/me", authentication, userController.getMe);

router.get("/:id", authentication, userController.getUserById);

router.post("/create", authentication, userController.createUser);

router.put("/update/:id", authentication, userController.updateUser);

router.delete("/delete/:id", authentication, userController.deleteUser);

export default router;
