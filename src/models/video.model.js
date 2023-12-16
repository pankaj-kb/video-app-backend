import mongoose, { Schema, SchemaType } from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String, //from cloud
            required: true,
        },
        thumbnail: {
            type: String, //from cloud
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        time: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId("User")
        },
    }, { timestamps: true })


export const Video = mongoose.model("Video", videoSchema)