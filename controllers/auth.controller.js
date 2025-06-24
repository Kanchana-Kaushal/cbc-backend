import axios from "axios";
import User from "../models/user.model.js";
import { generateHash, verifyHash } from "../utils/argon2.util.js";
import { genToken } from "../utils/jwt.util.js";

export const signUp = async (req, res, next) => {
    const { username, avatar, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            const err = new Error("User for this email is already exists");
            err.statusCode = 409;
            throw err;
        }

        const hashedPassword = await generateHash(password);

        const user = new User({
            username,
            avatar,
            email,
            password: hashedPassword,
        });

        const newUser = await user.save();

        const payload = {
            userId: newUser._id,
            email: newUser.email,
            role: newUser.role,
        };

        const token = genToken(payload);

        res.status(200).json({
            success: true,
            message: "User signed up successfully",
            data: {
                user: {
                    userId: newUser._id,
                    username: newUser.username,
                    avatar: newUser.avatar,
                    email: newUser.email,
                    role: newUser.role,
                },
                token,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            const err = new Error("User for this email does not exists");
            err.statusCode = 404;
            throw err;
        }

        if (user.banned) {
            const err = new Error(
                "User for this email is banned from this platform"
            );
            err.statusCode = 401;
            throw err;
        }

        const isPasswordValid = await verifyHash(user.password, password);

        if (!isPasswordValid) {
            const err = new Error("Password does not match");
            err.statusCode = 400;
            throw err;
        }

        const payload = {
            userId: user._id,
            email: user.email,
            role: user.role,
        };

        const token = genToken(payload);

        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                user: {
                    userId: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    email: user.email,
                    role: user.role,
                },
                token,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const createAdmin = async (req, res, next) => {
    const { username, avatar, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            const err = new Error("User for this email is already exists");
            err.statusCode = 409;
            throw err;
        }

        const hashedPassword = await generateHash(password);

        const user = new User({
            username,
            avatar,
            email,
            password: hashedPassword,
            role: "admin",
        });

        const newUser = await user.save();

        res.status(200).json({
            success: true,
            message: "User signed up successfully",
            data: {
                user: {
                    userId: newUser._id,
                    username: newUser.username,
                    avatar: newUser.avatar,
                    email: newUser.email,
                    role: newUser.role,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

export const googleLogin = async (req, res, next) => {
    try {
        const accessToken = req.body.accessToken;

        if (!accessToken) {
            const err = new Error("Access token is required");
            err.statusCode = 404;
            throw err;
        }

        const response = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: "Bearer " + accessToken,
                },
            }
        );

        const existingUser = await User.findOne({ email: response.data.email });

        if (!existingUser) {
            const user = new User({
                username: response.data.name,
                avatar: response.data.picture || null,
                email: response.data.email,
                password: "ThisIsAManualMadePasswordForGoogleLoginUsers",
            });

            const newUser = await user.save();

            const payload = {
                userId: newUser._id,
                email: newUser.email,
                role: newUser.role,
            };

            const token = genToken(payload);

            res.status(200).json({
                success: true,
                message: "User signed up successfully",
                data: {
                    user: {
                        userId: newUser._id,
                        username: newUser.username,
                        avatar: newUser.avatar,
                        email: newUser.email,
                        role: newUser.role,
                    },
                    token,
                },
            });

            return;
        }

        if (existingUser.banned) {
            const err = new Error(
                "User for this email is banned from this platform"
            );
            err.statusCode = 401;
            throw err;
        }

        const isPasswordValid =
            existingUser.password ===
            "ThisIsAManualMadePasswordForGoogleLoginPeople";

        if (!isPasswordValid) {
            const err = new Error("Password does not match");
            err.statusCode = 400;
            throw err;
        }

        const payload = {
            userId: existingUser._id,
            email: existingUser.email,
            role: existingUser.role,
        };

        const token = genToken(payload);

        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                user: {
                    userId: existingUser._id,
                    username: existingUser.username,
                    avatar: existingUser.avatar,
                    email: existingUser.email,
                    role: existingUser.role,
                },
                token,
            },
        });
    } catch (err) {
        next(err);
    }
};
