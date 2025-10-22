import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware'; // Kita akan buat ini selanjutnya

export const handleRegister = async (req: Request, res: Response) => {
    try {
        const newUser = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: newUser,
        });
    } catch (error: any) {
        if (error.code === 'P2002') { // Kode error Prisma untuk unique constraint violation
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const handleLogin = async (req: Request, res: Response) => {
    try {
        const token = await authService.login(req.body);

        if (!token) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.status(200).json({
            success: true,
            message: 'Login successfully',
            data: { access_token: token },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const handleGetMe = (req: AuthRequest, res: Response) => {
    // Data user diambil dari token yang sudah divalidasi oleh middleware
    res.status(200).json({
        success: true,
        message: 'Get me successfully',
        data: req.user,
    });
};