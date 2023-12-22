import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({

    subscriber: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    channel: {
        tyep: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },

}, {
    timestamps: true
})

export const Subscription = mongoose.model("Subscription",
    subscriptionSchema)