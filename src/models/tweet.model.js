import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    }
},{timestamps: true})

export const Tweet = mongoose.model("Tweet", tweetSchema)