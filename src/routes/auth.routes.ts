import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rute publik untuk registrasi
router.post('/register', authController.handleRegister);

// Rute publik untuk login
router.post('/login', authController.handleLogin);

// Rute yang dilindungi untuk mendapatkan profil pengguna
// Middleware 'authMiddleware' akan dijalankan sebelum 'handleGetMe'
router.get('/me', authMiddleware, authController.handleGetMe);

export default router;