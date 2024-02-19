import { Router } from 'express';
import {
    getVideoComments,
    getTweetComments,
    getCommentReplies,
    addCommentToVideo,
    addCommentToTweet,
    addCommentToComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/v/:videoId").get(getVideoComments).post(addCommentToVideo);
router.route("/t/:tweetId").get(getTweetComments).post(addCommentToTweet);
router.route("/r/:commentId").get(getCommentReplies).post(addCommentToComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router