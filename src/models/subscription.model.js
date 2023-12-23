import mongoose from "mongoose";

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
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },

}, {
    timestamps: true
})

export const Subscription = mongoose.model
    ("Subscription",
        subscriptionSchema)