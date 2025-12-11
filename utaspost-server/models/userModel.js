import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        userName: { type: String, required: true },
        userGender: { type: String, required: true, default: "M" },
        userDoB: { type: Date, required: true },
        userDept: { type: String, required: true },
        userEmail: { type: String, required: true },
        userPassword: { type: String, required: true },
        userProfilePic: { type: String, required: false, default : "https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png" }
    },
    {
        versionKey: false
    }
)

const userModel = new mongoose.model("utas-post-users", userSchema)

export default userModel