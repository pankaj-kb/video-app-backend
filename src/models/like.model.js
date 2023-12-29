import mongoose, { Schema } from "mongoose";

const likeSchema = new mongoose.Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    // on thinking that  it will be an array storing the refference of users who liked.
    // likedBy: {
    //     type: [
    //         {
    //             type: Schema.Types.ObjectId,
    //             ref: "User"
    //         }
    //     ]
    // }

    // another approach which concerns that each like will be different document.

    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
})

export const Like = mongoose.model("Like", likeSchema)