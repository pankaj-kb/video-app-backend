import { Router } from "express";
import { getWatchHistory, addView } from "../controllers/view.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route("/:videoId").post(addView)
router.route("/watch-history").get(getWatchHistory)

export default router;
