import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware'; // Akan kita buat selanjutnya

/**
 * Handler untuk endpoint registrasi (POST /auth/register).
 */
export const handleRegister = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // Validasi input dasar
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const newUser = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: newUser,
        });
    } catch (error: any) {
        // Penanganan error spesifik jika email sudah ada (dari Prisma)
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, message: 'Email already exists' });
        }
        
        // Log error untuk debugging dan kirim response generik
        console.error('REGISTER ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
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
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }
        
        const token = await authService.login(req.body);

        // Jika service mengembalikan null, berarti kredensial tidak valid
        if (!token) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.status(200).json({
            success: true,
            message: 'Login successfully',
            data: { access_token: token },
        });
    } catch (error) {
        console.error('LOGIN ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
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