import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', authController.handleRegister);
router.post('/login', authController.handleLogin);

// Endpoint /me ini dilindungi oleh authMiddleware
router.get('/me', authMiddleware, authController.handleGetMe);

export default router;