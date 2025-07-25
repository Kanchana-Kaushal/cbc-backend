import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            minLength: 2,
            maxLength: 50,
            required: [true, "Username is required"],
        },

        avatar: {
            type: String,
            required: true,
            trim: true,
            default:
                "https://images.icon-icons.com/1378/PNG/512/avatardefault_92824.png",
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email address is not valid"],
            unique: [true, "There is already a user for this email"],
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: 6,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
            required: true,
            immutable: true,
        },

        banned: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { timeStamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
