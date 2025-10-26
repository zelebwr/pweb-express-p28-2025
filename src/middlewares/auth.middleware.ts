import { Response, NextFunction, Request } from 'express';
import jwt, { JwtPayload, JsonWebTokenError,TokenExpiredError,} from "jsonwebtoken";
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

interface AuthenticatedUser {
    id: string;
    email: string;
    username: string | null; // Prisma schema shows username is optional
}

// Membuat interface custom agar TypeScript tahu bahwa 'req' bisa memiliki properti 'user'
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

interface TokenPayload extends JwtPayload {
    id: string;
    email: string; // Ensure email is expected in the payload as per auth.service
}

/**
 * Middleware untuk memvalidasi JWT dan melampirkan data pengguna ke request.
 */
export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    // Cek apakah header Authorization ada dan formatnya benar ('Bearer [token]')
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No or invalid token provided",
        });
    }

    const token = authHeader.split(" ")[1];

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("CRITICAL: JWT_SECRET environment variable is not set!");
        // Generic Server Error
        return res.status(500).json({
            success: false,
            message: "Internal server configuration error.",
        });
    }

    try {
        // Verifikasi token menggunakan kunci rahasia
        const decoded = jwt.verify(token, jwtSecret) as TokenPayload;

        if (!decoded.id || !decoded.email) {
            throw new Error("Invalid token payload");
        }

        // Cari pengguna di database berdasarkan ID dari token
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, username: true }, // Hanya ambil data yang aman
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found",
            });
        }

        // Lampirkan data pengguna ke object request
        req.user = user;
        next(); // Lanjutkan ke controller jika token valid
    } catch (error: unknown) {
        console.error("Authentication error:", error);

        let errorMessage = "Unauthorized: Invalid token";

        if (error instanceof TokenExpiredError) {
            errorMessage = "Unauthorized: Token expired";
        } else if (error instanceof JsonWebTokenError) {
            // Catches other JWT errors (malformed, invalid signature etc.)
            errorMessage = `Unauthorized: ${error.message}`;
        } else if (
            error instanceof Error &&
            error.message === "Invalid token payload"
        ) {
            errorMessage = "Unauthorized: Invalid token content";
        }
        else if (
            error instanceof Prisma.PrismaClientKnownRequestError ||
            error instanceof Prisma.PrismaClientUnknownRequestError
        ) {
            errorMessage = "Internal server error during authentication.";
            return res.status(500).json({
              success: false, 
              message: errorMessage 
            });
        }

        // Send standardized 401 response for token errors
        return res.status(401).json({ 
          success: false, 
          message: errorMessage });
    }
};