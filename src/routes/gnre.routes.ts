import { Router } from 'express';
import { createGenreController, getAllGenreController } from '../controllers/genre.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const genreRouter = Router();

/**
 * @author Member A, Member C
 */

genreRouter.post('/', authMiddleware, createGenreController);
genreRouter.get('/', authMiddleware, getAllGenreController); 

export default genreRouter;