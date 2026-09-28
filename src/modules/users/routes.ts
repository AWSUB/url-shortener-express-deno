import { Router } from "express";
import { login, register, verify } from "./controller.ts";

const router = Router();

router.post("/v1/users/register", register);
router.post("/v1/users/verify", verify);
router.post("/v1/users/login", login);

export default router;
