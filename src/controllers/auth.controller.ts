import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware'; // Akan kita buat selanjutnya

const isValiEmail = (email: string): string | null => {
    if (typeof email !== "string") {
        return "Invalid email format";
    }

    const atIndex = email.indexOf("@");
    const lastDotIndex = email.lastIndexOf(".");

    // Check Principles:
    // 1. Must contain '@' and it shouldn't be the first character.
    // 2. Must contain '.' after the '@'.
    // 3. The last '.' must be at least one character after '@'.
    // 4. The last '.' must not be the last character of the email.

    let hasAtSgn = false;
    let validCharsBeforeAt = false;
    let hasDot = false; 
    let validCharsBetweenAtAndDot = false;
    let validCharactersAfterDot = false;

    if (atIndex >= 0) {
        hasAtSgn = true;
    }
    if (atIndex > 0) {
        validCharsBeforeAt = true;
    }
    if (lastDotIndex >= 0 && lastDotIndex > atIndex) {
        hasDot = true;
    }
    if (lastDotIndex > atIndex + 1) {
        validCharsBetweenAtAndDot = true;
    }
    if (lastDotIndex < email.length - 1) {
        validCharactersAfterDot = true;
    }

    if (!hasAtSgn) return "Email must contain '@' symbol and it cannot be the first character.";
    if (!validCharsBeforeAt) return "Email must contain valid characters before '@'.";
    if (!hasDot) return "Email must contain '.' after '@'.";
    if (!validCharsBetweenAtAndDot) return "Email must contain valid characters between '@' and '.'.";
    if (!validCharactersAfterDot) return "Email must have valid characters after the last '.'.";

    return null; // Email is valid
};

const validatePassword = (password: string): string | null => {
    if (typeof password !== "string" || password.length < 8) {
        return "Password must be at least 8 characters long.";
    }

    let hasUppercase = false;
    let hasLowercase = false;
    let hasNumber = false;
    let hasSymbol = false;
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-="; // Allowed symbols

    for (let i = 0; i < password.length; i++) {
        const char = password[i];
        if (char >= "A" && char <= "Z") {
            hasUppercase = true;
        } else if (char >= "a" && char <= "z") {
            hasLowercase = true;
        } else if (char >= "0" && char <= "9") {
            hasNumber = true;
        } else if (symbols.includes(char)) {
            hasSymbol = true;
        }
    }

    if (!hasUppercase) return 'Password must contain an uppercase letter.';
    if (!hasLowercase) return 'Password must contain a lowercase letter.';
    if (!hasNumber) return 'Password must contain a number.';
    if (!hasSymbol) return 'Password must contain a symbol.';

    return null; // Password is valid
};

/**
 * Handler untuk endpoint registrasi (POST /auth/register).
 */
export const handleRegister = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // Validasi input dasar
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const emailError = isValiEmail(email);
        if (emailError) {
            return res.status(400).json({
                success: false,
                message: emailError,
            });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({
                success: false,
                message: passwordError,
            });
        }

        const newUser = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser,
        });
    } catch (error: unknown) {
        console.error("[ERROR] Failed to register user:", error);
        if (error instanceof Error) {
            if (error.message.includes("already exists")) {
                return res
                    .status(409)
                    .json({ 
                        success: false, 
                        message: error.message 

                    });
            }
            if (error.message.includes("required for registration")) {
                return res
                    .status(400)
                    .json({
                        success: false, 
                        message: error.message 

                    });
            }
            return res
                .status(500)
                .json({ 
                    success: false, 
                    message: error.message 

                });
        }
        res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * Handler untuk endpoint login (POST /auth/login).
 */
export const handleLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const emailError = isValiEmail(email);
        if (emailError) {
            return res.status(400).json({
                success: false,
                message: emailError,
            });
        }

        //  Basic password check
        if (typeof password !== "string" || password.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: "Password is required" });
        }

        const token = await authService.login({ email, password });
        res.status(200).json({
            success: true,
            message: "Login successfully",
            data: { access_token: token },
        });
    } catch (error: unknown) {
        console.error("[ERROR] Failed to login user:", error);
        if (error instanceof Error) {
            if (error.message === "Invalid email or password") {
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid credentials" });
            }
            if (error.message.includes("required for login")) {
                return res
                    .status(400)
                    .json({ success: false, message: error.message });
            }
            if (error.message === "Authentication configuration error.") {
                console.error("CRITICAL: JWT_SECRET is missing or invalid!");
                return res
                    .status(500)
                    .json({
                        success: false,
                        message: "Internal server configuration error.",
                    });
            }
            return res
                .status(500)
                .json({ success: false, message: error.message });
        }
        res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * Handler untuk mendapatkan profil pengguna saat ini (GET /auth/me).
 */
export const handleGetMe = (req: AuthRequest, res: Response) => {
    // Data 'user' sudah divalidasi dan ditambahkan ke object 'req' oleh middleware
    res.status(200).json({
        success: true,
        message: 'Get me successfully',
        data: req.user,
    });
};