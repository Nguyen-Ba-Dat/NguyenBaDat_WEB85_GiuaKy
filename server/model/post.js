import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId : String,
    content : String
}, {timestamps : true})

const postModel = mongoose.model("post", postSchema)

export default postModel