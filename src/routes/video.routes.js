import { Router } from 'express';
import {
    deleteVideo,
    getAllVideosWithQuery,
    getAllVideosByUser,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/search").get(getAllVideosWithQuery)

// test working status
// router.route("/").get((req,res) => {
//     res.send("Video Route Working")
// })

router.route("/user-videos").get(getAllVideosByUser)

router.route("/publish").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnailFile",
            maxCount: 1,
        },
    ]),
    publishAVideo
);

router.route("/:videoId").get(getVideoById).delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router