import { Router } from 'express';
// Impor SEMUA controller, baik yang lama maupun yang baru
import * as genreController from '../controllers/genre.controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router(); 

// == RUTE BARU YANG KITA TAMBAHKAN ==
// POST /api/genre -> Membuat genre baru (dilindungi)
router.post('/', authMiddleware, genreController.handleCreateGenre);

// GET /api/genre -> Mendapatkan semua genre (publik)
router.get('/', genreController.handleGetAllGenres);
// ===================================


// == RUTE LAMA DARI TEMANMU (TETAP ADA) ==
/** * * Route to get genre details by ID.
 * @author zelebwr
 */
router.get('/:genre_id', genreController.getGenreDetail);

/**
 * * Route to update genre details by ID.
 * @author zelebwr
 */
router.patch('/:genre_id', authMiddleware, genreController.updateGenre);

/**
 * * Route to delete a genre by ID.
 * @author zelebwr
 */
router.delete('/:genre_id', authMiddleware, genreController.deleteGenre);
// =========================================

export default router;