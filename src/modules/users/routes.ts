import { Router } from "express";
import { register, verify } from "./controller.ts";

const router = Router();

router.post("/v1/users/register", register);
router.post("/v1/users/verify", verify);

export default router;
