import { Request, Response } from 'express';
import { GenreService } from '../services/genre.service';
import { sendResponse } from '../utils/response';

/**
 * @author Member A
 */
export const createGenreController = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const newGenre = await GenreService.createGenre(name);
        return sendResponse(res, 201, true, 'Genre created successfully', newGenre);

    } catch (error: any) {
        const message = error.message || 'Internal server error.';
        if (message.includes('required')) return sendResponse(res, 400, false, message);
        if (message.includes('already exists')) return sendResponse(res, 409, false, message);
        console.error('Create genre error:', error);
        return sendResponse(res, 500, false, message);
    }
};

/**
 * @author Member A
 */
export const getAllGenreController = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = (req.query.search as string) || '';
        const orderByName = (req.query.orderByName as 'asc' | 'desc') || 'asc'; 

        const { genres, meta } = await GenreService.getGenres(page, limit, search, orderByName);

        return sendResponse(res, 200, true, 'Get all genre successfully', genres, meta);

    } catch (error: any) {
        console.error('Get all genre error:', error);
        return sendResponse(res, 500, false, 'Internal server error while fetching genres.');
    }
};