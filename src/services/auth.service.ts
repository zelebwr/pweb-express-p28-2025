import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

// Tipe data untuk input register dan login
type UserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export const register = async (userData: UserInput) => {
    const { email, password, username } = userData;

    // Enkripsi password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username,
        },
        select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
        },
    });
    return newUser;
};

export const login = async (credentials: Pick<UserInput, 'email' | 'password'>) => {
    const { email, password } = credentials;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        // User tidak ditemukan
        return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        // Password salah
        return null;
    }

    // Jika valid, buat JWT
    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' } // Token berlaku selama 1 hari
    );

    return token;
};