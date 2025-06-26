import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email address is not valid"],
        unique: false,
        trim: true,
        lowercase: true,
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,
    },
});

const VerificationCode = mongoose.model(
    "VerificationCode",
    verificationCodeSchema
);

export default VerificationCode;
