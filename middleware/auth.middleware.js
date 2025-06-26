import jwt from "jsonwebtoken";
import { jwtSecretKey } from "../config/env.js";
import VerificationCode from "../models/verificationCode.model.js";
import { verifyHash } from "../utils/argon2.util.js";

//This is basic jwt verification
export const authMiddleware = (req, res, next) => {
    const tokenString = req.header("Authorization");

    if (tokenString) {
        const token = tokenString.split(" ")[1];
        try {
            const decoded = jwt.verify(token, jwtSecretKey);
            req.user = decoded;
            next();
        } catch {
            next();
        }
    } else next();
};

//This midddleware is used to authorize all users
export const verifyUser = (req, res, next) => {
    try {
        if (req.user) {
            next();
        } else {
            const err = new Error("User unauthorized");
            err.statusCode = 401;
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

//This middleware is used to authorize admin only tasks
export const verifyAdmin = (req, res, next) => {
    try {
        if (req.user) {
            const role = req.user.role;
            if (role === "admin") {
                next();
            } else {
                const err = new Error("This operation is admin only");
                err.statusCode = 401;
                throw err;
            }
        } else {
            const err = new Error("User unauthorized");
            err.statusCode = 401;
            throw err;
        }
    } catch (err) {
        next(err);
    }
};

//This middleware is used to verify OTP codes
export const verifyCode = async (req, res, next) => {
    const code = req.body.code;

    const email = req.body.data.email;

    try {
        const verifyInfo = await VerificationCode.findOne({ email: email });

        if (!verifyInfo) {
            const err = new Error(
                "Your Code is Expired! Try resending the code."
            );
            err.statusCode = 410;
            throw err;
        }

        const isCodeValid = await verifyHash(verifyInfo.code, code.toString());

        if (!isCodeValid) {
            const err = new Error("Verification code does not match");
            err.statusCode = 400;
            throw err;
        }

        await VerificationCode.deleteMany({ email });
        next();
    } catch (err) {
        next(err);
    }
};
