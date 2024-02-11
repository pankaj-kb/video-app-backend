import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const viewSchema = new mongoose.Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: true,
    },
    viewer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true })

viewSchema.plugin(mongooseAggregatePaginate)

export const View = mongoose.model("View", viewSchema)