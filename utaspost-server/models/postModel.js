import mongoose from "mongoose";


const postSchema = new mongoose.Schema(
    {
        postUserEmail: { type: String, required: true },
        postMessageTitle: { type: String, required: true},
        postMessage: { type: String, required: true },
        lat: { type: Number, required: false, default: null },
        lon: { type: Number, required: false, default: null },
        postLikes: { type: Number, default: 0 },
        postLikesBy: { type: [String], default: [] }
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: true
        },
        versionKey: false
    }
)

const postModel = new mongoose.model("utas-post-posts", postSchema)

export default postModel