import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

// Membuat interface custom agar TypeScript tahu bahwa 'req' bisa memiliki properti 'user'
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware untuk memvalidasi JWT dan melampirkan data pengguna ke request.
 */
export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Cek apakah header Authorization ada dan formatnya benar ('Bearer [token]')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifikasi token menggunakan kunci rahasia
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Cari pengguna di database berdasarkan ID dari token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true }, // Hanya ambil data yang aman
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
    }

    // Lampirkan data pengguna ke object request
    req.user = user;
    next(); // Lanjutkan ke controller jika token valid
  } catch (error) {
    // Kirim error jika token tidak valid atau kedaluwarsa
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};