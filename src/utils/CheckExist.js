import { Comment } from "../models/comment.model.js"
import { Like } from "../models/like.model.js"
import { Playlist } from "../models/playlist.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"
import mongoose from "mongoose"

class CheckExist {
    constructor(model, id) {
        this.model = model;
        this.id = id;
        this.document = this.findDoc();
    }

    async findDoc() {
        try {
            const response = await this.model.findOne({ _id: this.id });
            return response;
        } catch (error) {
            throw new Error(`Error finding document: ${error.message}`);
        }
    }
}

export { CheckExist };