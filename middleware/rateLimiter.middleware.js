import rateLimit from "express-rate-limit";

const rateLimitErrorHandler = (req, res, next, options) => {
    const err = new Error(options.message || "Too many requests");
    err.statusCode = options.statusCode || 429;
    next(err);
};

export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "Too many requests. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitErrorHandler,
});

export const authRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: "Too many attempts. Try again in 5 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitErrorHandler,
});
