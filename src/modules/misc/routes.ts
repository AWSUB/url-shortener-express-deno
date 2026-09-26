import { Router } from "express";
import { health } from "./controller.ts";

const router = Router();

router.get("/v1/health", health);

export default router;