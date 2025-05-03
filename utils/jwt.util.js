import jwt from "jsonwebtoken";
import { jwtSecretKey } from "../config/env.js";

export const genToken = (payload) => {
    return jwt.sign(payload, jwtSecretKey, { expiresIn: "24h" });
};
