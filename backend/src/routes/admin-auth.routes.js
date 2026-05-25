import { Router } from "express";
import { adminLogin } from "../controllers/admin-auth.controller.js";
import { validate } from "../middleware/validate.js";
import { adminLoginSchema } from "../utils/validators.js";

const router = Router();

router.post("/login", validate(adminLoginSchema), adminLogin);

export default router;
