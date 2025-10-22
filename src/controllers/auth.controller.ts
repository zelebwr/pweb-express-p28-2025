import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendResponse } from '../utils/response';

/**
 * @author Member A
 */

export const registerController = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if (!email || !password) {
        return sendResponse(res, 400, false, 'Email and password are required.');
    }

    try {
        const newUser = await AuthService.registerUser({ username, email, password });
        
        return sendResponse(res, 201, true, 'User registered successfully', newUser);

    } catch (error: any) {
        const message = error.message || 'Internal server error during registration.';
        
        if (message.includes('already registered') || message.includes('already taken')) {
            return sendResponse(res, 409, false, message); 
        }

        console.error('Registration error:', error);
        return sendResponse(res, 500, false, message); 
    }
};