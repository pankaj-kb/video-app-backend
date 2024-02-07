import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
    getAllTweets,
    getTweet
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/post").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet).get(getTweet)
router.route("/").get(getAllTweets)

export default router