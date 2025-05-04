import User from "../models/user.model.js";

export const getAllUsers = async (req, res, next) => {
    const page = req.params.page;
    const limit = 10;
    const skip = limit * (page - 1);

    try {
        const users = await User.find()
            .limit(limit)
            .skip(skip)
            .select("-__v -password");
        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: {
                total,
                users,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    const { userId, role } = req.user;
    const id = req.params.id;

    try {
        if (role === "admin") {
            const user = await User.findById(id).select("-__V -password");

            if (!user) {
                const err = new Error("Invalid ID or user not found");
                err.statusCode = 404;
                throw err;
            }

            res.status(200).json({
                success: true,
                message: "User fetched successfully",
                data: {
                    user,
                },
            });
            return;
        }

        if (userId !== id) {
            const err = new Error("User unauthorized");
            err.statusCode = 401;
            throw err;
        }

        const user = await User.findById(id).select("-__V -password");

        if (!user) {
            const err = new Error("Invalid ID or user not found");
            err.statusCode = 404;
            throw err;
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: {
                user,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    const { userId } = req.user;
    const id = req.params.id;
    const avatar = req.body.avatar;
    const username = req.body.userName;

    try {
        if (userId !== id) {
            const err = new Error("User unauthorized");
            err.statusCode = 401;
            throw err;
        }

        const existingUser = await User.findById(id);

        if (!existingUser) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        const updatefields = { username, avatar };

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updatefields },
            { new: true, runValidators: true }
        ).select("-__V -password");

        res.status(200).json({
            success: true,
            message: "User Updated updated successfully",
            data: user,
        });
    } catch (err) {
        next(err);
    }
};

export const banUser = async (req, res, next) => {
    const { userId, banned } = req.body;

    try {
        const existngUser = await User.findById(userId);

        if (!existngUser) {
            const err = new Error("User not found");
            err.statusCode = 404;
            throw err;
        }

        const user = await User.findByIdAndUpdate(
            { _id: userId },
            { $set: { banned: banned } },
            { new: true, runValidators: true }
        ).select("-__V -password");

        res.status(200).json({
            success: true,
            message: "User Banned Successfully",
            data: {
                user,
            },
        });
    } catch (err) {
        next(err);
    }
};
