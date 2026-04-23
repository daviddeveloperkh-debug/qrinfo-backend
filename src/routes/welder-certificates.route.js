import { Router } from "express";
import welderCertificatesController from "../controllers/welder-certificates.controller.js";
import { authentication, authorization } from "../middlewares/auth.middleware.js";
import userRole from "../enums/user-role.enum.js";

const router = Router();

router.get("/", authentication, welderCertificatesController.getAll);
router.get("/static-list", authorization([userRole.ADMIN, userRole.SUPER_ADMIN]), welderCertificatesController.getStaticList);
router.get("/:id", authentication, welderCertificatesController.getById);
router.post("/create", authentication, welderCertificatesController.create);
router.put("/update/:id", authorization([userRole.ADMIN, userRole.SUPER_ADMIN]), welderCertificatesController.update);
router.delete("/delete/:id", authentication, welderCertificatesController.remove);

export default router;
