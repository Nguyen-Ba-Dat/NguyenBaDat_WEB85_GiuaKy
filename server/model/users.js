import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    userName : String,
    email : String,
    password : String,
    apikey : String
})

const userModel = mongoose.model("user", userSchema)

export default userModel