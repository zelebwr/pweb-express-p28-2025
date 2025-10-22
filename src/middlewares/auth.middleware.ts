import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { Request } from 'express';

// Membuat interface custom untuk Request agar bisa menyimpan data user
export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
    }

    // Simpan data user ke dalam object request
    req.user = user;
    next(); // Lanjutkan ke controller
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};