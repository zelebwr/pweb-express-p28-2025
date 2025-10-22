import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response'; 

/**
 * @author Member A (Struktur dasar)
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendResponse(res, 401, false, 'Access denied. Bearer token required.');
    }
    next();
};