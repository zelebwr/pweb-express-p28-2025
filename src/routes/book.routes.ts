import { Router } from 'express';
import { getAllBooksController, deleteBookController } from '../controllers/book.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const bookRouter = Router();

/**
 * @author Member A, Member B
 */

bookRouter.get('/', authMiddleware, getAllBooksController);
bookRouter.delete('/:book_id', authMiddleware, deleteBookController);


export default bookRouter;