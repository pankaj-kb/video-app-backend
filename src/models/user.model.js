import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, //stored on cloud
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Video"
                }
            ]
        },
        password: {
            type: String,
            required: true
        },
    }, { timestamps: true })


export const User = mongoose.model("User", userSchema)