import argon2 from "argon2";
import { pepper } from "../config/env.js";

export const generateHash = async (password) => {
    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        secret: Buffer.from(pepper),
    });

    return hash;
};

export const verifyHash = async (hash, password) => {
    return argon2.verify(hash, password, { secret: Buffer.from(pepper) });
};
