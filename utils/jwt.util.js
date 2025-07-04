import jwt from "jsonwebtoken";
import { jwtSecretKey } from "../config/env.js";

export const genToken = (payload, time) => {
    return jwt.sign(payload, jwtSecretKey, { expiresIn: time });
};
