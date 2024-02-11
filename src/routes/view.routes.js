import { Router } from "express";
import { } from "../controllers/view.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route("/:videoId").post()
router.route("/watch-history").get()

export default router;
