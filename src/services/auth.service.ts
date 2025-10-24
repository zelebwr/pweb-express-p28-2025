import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

// Mendefinisikan tipe untuk data input pengguna baru
type UserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Mendaftarkan pengguna baru ke database.
 * @param userData Data pengguna (email, password, username).
 * @returns Objek pengguna baru tanpa password.
 */
export const register = async (userData: UserInput) => {
    const { email, password, username } = userData;

    // Enkripsi (hash) password sebelum disimpan untuk keamanan
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username,
        },
        // Pilih hanya data yang aman untuk dikembalikan
        select: {
            id: true,
            email: true,
            username: true,
            createdAt: true,
        },
    });
    return newUser;
};

/**
 * Memvalidasi kredensial pengguna dan mengembalikan JWT.
 * @param credentials Data login (email, password).
 * @returns JWT token jika valid, atau null jika tidak.
 */
export const login = async (credentials: Pick<UserInput, 'email' | 'password'>) => {
    const { email, password } = credentials;

    // Cari pengguna berdasarkan email
    const user = await prisma.user.findUnique({
        where: { email },
    });

    // Jika pengguna tidak ditemukan, kembalikan null
    if (!user) {
        return null;
    }

    // Bandingkan password yang diinput dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return null; // Kembalikan null jika password salah
    }

    // Jika kredensial valid, buat JWT
    const token = jwt.sign(
        { id: user.id, email: user.email }, // Data yang ingin disimpan di dalam token (payload)
        process.env.JWT_SECRET as string,    // Kunci rahasia dari file .env
        { expiresIn: '1d' }                  // Token akan kedaluwarsa dalam 1 hari
    );

    return token;
};