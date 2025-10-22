import { Router } from 'express';
import * as genreController from '../controllers/genre.controllers';

const router: Router = Router(); 

/** 
 * * Route to get genre details by ID.
 * @author zelebwr
 * @param genre_id The UUID of the genre to retrieve.
 * Returns genre details in JSON format or 404 if not found.
 */
router.get('/:genre_id', genreController.getGenreDetail);

/**
 * * Route to update genre details by ID.
 * @author zelebwr
 * @param genre_id The UUID of the genre to update.
 * @param name The new name for the genre.
 */
router.patch('/:genre_id', genreController.updateGenre);

/**
 * * Route to delete a genre by ID.
 * @author zelebwr
 * @param genre_id The UUID of the genre to delete.
 */
router.delete('/:genre_id', genreController.deleteGenre);

export default router;