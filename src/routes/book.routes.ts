import { Router } from 'express';
import * as bookController from '../controllers/book.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Terapkan middleware untuk semua rute di bawah ini
router.use(authMiddleware);

// POST /api/books
router.post('/', bookController.handleCreateBook);

// GET /api/books/genre/:genre_id
router.get('/genre/:genre_id', bookController.handleGetBooksByGenre);

// GET /api/books/:book_id
router.get('/:book_id', bookController.handleGetBookById);

// PATCH /api/books/:book_id
router.patch('/:book_id', bookController.handleUpdateBook);

export default router;