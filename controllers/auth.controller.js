import axios from "axios";
import User from "../models/user.model.js";
import { generateHash, verifyHash } from "../utils/argon2.util.js";
import { genToken } from "../utils/jwt.util.js";
import VerificationCode from "../models/verificationCode.model.js";
import nodemailer from "nodemailer";
import { appPassword, myEmail } from "../config/env.js";

export const signUp = async (req, res, next) => {
    const { username, avatar, email, password } = req.body.data;

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

export const sendVerificationCode = async (req, res, next) => {
    const email = req.body.email;
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: myEmail,
            pass: appPassword,
        },
    });

    try {
        if (!email) {
            const err = new Error("Email is required");
            err.statusCode = 404;
            throw err;
        }

        await VerificationCode.deleteMany({ email });

        const hashedCode = await generateHash(randomNumber.toString());

        const verificationCode = new VerificationCode({
            email,
            code: hashedCode,
        });

        const code = await verificationCode.save();

        const mailOptions = {
            from: "Crystal Beauty Clear",
            to: code.email,
            subject: "Your Verification Code",
            text: `Your verification code is: ${randomNumber}`,
            html: `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Verification Code</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            min-height: 100vh;
                            padding: 20px;
                        }
                        
                        .email-container {
                            max-width: 600px;
                            margin: 40px auto;
                            background: #ffffff;
                            border-radius: 20px;
                            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                            position: relative;
                        }
                        
                        .email-container::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            height: 4px;
                            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
                        }
                        
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                            padding: 40px 30px;
                            position: relative;
                        }
                        
                        .header::after {
                            content: '';
                            position: absolute;
                            bottom: -10px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 0;
                            height: 0;
                            border-left: 15px solid transparent;
                            border-right: 15px solid transparent;
                            border-top: 10px solid #764ba2;
                        }
                        
                        .header h1 {
                            font-size: 28px;
                            font-weight: 600;
                            margin-bottom: 8px;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                        }
                        
                        .header p {
                            font-size: 16px;
                            opacity: 0.9;
                            font-weight: 300;
                        }
                        
                        .content {
                            padding: 50px 40px;
                            text-align: center;
                        }
                        
                        .greeting {
                            font-size: 18px;
                            color: #555;
                            margin-bottom: 30px;
                            line-height: 1.5;
                        }
                        
                        .code-section {
                            background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
                            border: 2px dashed #667eea;
                            border-radius: 15px;
                            padding: 30px;
                            margin: 30px 0;
                            position: relative;
                        }
                        
                        .code-label {
                            font-size: 14px;
                            color: #667eea;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 15px;
                        }
                        
                        .verification-code {
                            font-size: 36px;
                            font-weight: 700;
                            color: #333;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                            background: linear-gradient(135deg, #667eea, #764ba2);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            background-clip: text;
                            margin: 10px 0;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
                        
                        .code-note {
                            font-size: 14px;
                            color: #888;
                            margin-top: 15px;
                            font-style: italic;
                        }
                        
                        .instructions {
                            font-size: 16px;
                            color: #666;
                            line-height: 1.6;
                            margin: 30px 0;
                            text-align: left;
                            background: #f8f9fa;
                            padding: 25px;
                            border-radius: 12px;
                            border-left: 4px solid #667eea;
                        }
                        
                        .instructions h3 {
                            color: #333;
                            margin-bottom: 15px;
                            font-size: 18px;
                        }
                        
                        .instructions ul {
                            margin-left: 20px;
                        }
                        
                        .instructions li {
                            margin-bottom: 8px;
                        }
                        
                        .security-notice {
                            background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
                            border: 1px solid #fc8181;
                            border-radius: 12px;
                            padding: 20px;
                            margin: 30px 0;
                            color: #742a2a;
                        }
                        
                        .security-notice .icon {
                            font-size: 20px;
                            margin-right: 10px;
                        }
                        
                        .footer {
                            background: #f8f9fa;
                            padding: 30px 40px;
                            text-align: center;
                            border-top: 1px solid #e9ecef;
                        }
                        
                        .footer p {
                            font-size: 14px;
                            color: #888;
                            margin-bottom: 10px;
                        }
                        
                        .footer .company {
                            font-weight: 600;
                            color: #667eea;
                        }
                        
                        @media (max-width: 640px) {
                            .email-container {
                                margin: 20px auto;
                                border-radius: 15px;
                            }
                            
                            .content,
                            .footer {
                                padding: 30px 25px;
                            }
                            
                            .header {
                                padding: 30px 25px;
                            }
                            
                            .verification-code {
                                font-size: 28px;
                                letter-spacing: 4px;
                            }
                            
                            .instructions {
                                padding: 20px;
                            }
                        }
                        
                        .fade-in {
                            animation: fadeIn 0.8s ease-in;
                        }
                        
                        @keyframes fadeIn {
                            from {
                                opacity: 0;
                                transform: translateY(20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container fade-in">
                        <div class="header">
                            <h1>🔐 Verification Required</h1>
                            <p>Almost there! Just one more step to secure your account</p>
                        </div>
                        
                        <div class="content">
                            <div class="greeting">
                                Hi there! 👋<br>
                                We've received a request to verify your account. Please use the verification code below to complete the process.
                            </div>
                            
                            <div class="code-section">
                                <div class="code-label">Your Verification Code</div>
                                <div class="verification-code" id="verificationCode">${randomNumber}</div>
                                <div class="code-note">This code expires in 10 minutes</div>
                            </div>
                            
                            <div class="instructions">
                                <h3>📋 How to use this code:</h3>
                                <ul>
                                    <li>Return to the verification page where you requested this code</li>
                                    <li>Enter the 4-digit code exactly as shown above</li>
                                    <li>Click "Verify" to complete the process</li>
                                </ul>
                            </div>
                            
                            <div class="security-notice">
                                <span class="icon">⚠️</span>
                                <strong>Security Notice:</strong> If you didn't request this verification code, please ignore this email and ensure your account is secure. Never share this code with anyone.
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>This is an automated message from <span class="company">Crystal Beauty Clear</span></p>
                            <p>If you have any questions, please contact our support team.</p>
                            <p style="margin-top: 20px; font-size: 12px; color: #aaa;">
                                © 2025 Crystal Beauty Clear. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                   </html>`,
        };

        await transporter.sendMail(mailOptions);

        res.status(250).json({
            success: true,
            message: "Verification code sent successfully",
        });
    } catch (err) {
        next(err);
    }
};

export const checkAdmin = async (req, res, next) => {
    try {
        if (req.user) {
            const role = req.user.role;
            if (role === "admin") {
                res.status(200).json({
                    success: true,
                    message: "Authorized access",
                });
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
