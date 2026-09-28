import { Router } from "express";
import { auth } from "../../middleware/auth.ts";
import { create, get, list, redirect, remove } from "./controller.ts";

const router = Router();

// Public: redirect by short code
router.get("/v1/:code", redirect);

// Protected: manage user's URLs
router.post("/v1/urls", auth, create);
router.get("/v1/urls", auth, list);
router.get("/v1/urls/:id", auth, get);
router.delete("/v1/urls/:id", auth, remove);

export default router;