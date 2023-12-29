import mongoose, { Schema } from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    videos: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        required: [true, "Videos needed in playlist"]
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })

export const Playlist = mongoose.model("Playlist", playlistSchema)