import { Router } from "express";
import { addView, getWatchHistory } from "../controllers/view.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route("/:videoId").post(addView)
router.route("/watch-history").get(getWatchHistory)

export default router;
