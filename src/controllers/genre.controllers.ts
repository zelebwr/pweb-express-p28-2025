import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import * as genreService from "../services/genre.services";

/** 
 * * Handles HTTP Requests to get a genre by ID.
 * @author zelebwr
 * @param req Express Request object containing genre_id param.
 * @param res Express Response object to send the genre data or error.
 * @return Doesn't return anything; sends HTTP response directly. 
 */
export const getGenreDetail = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        const genre = await genreService.getGenreById(genre_id);

        if (!genre) {
            return res.status(404).json({ message: "Genre not found" });
        }

        res.status(200).json(genre);
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ 
                message: 'Internal server error',
                error: error.message,
            });
        }
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};

/**
 * * Handles HTTP Requests to update a genre by ID.
 * @author zelebwr
 * @param req Express Request object containing genre_id param and name in body.
 * @param res Express Response object to send the updated genre data or error.
 */
export const updateGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Genre name is required" });
        }

        const updatedGenre = await genreService.updateGenreById(genre_id, name);
        return res.status(200).json(updatedGenre);
    } catch (error) {
        if (error instanceof Error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') { // Unique constraint failed
                    return res.status(409).json({ message: 'A genre with this name already exists.' });
                }
                if (error.code === 'P2025') { // Record to update not found
                    return res.status(404).json({ message: 'Genre not found' });
                }
            }
            // Handle generic errors from the service (like "already exists")
            if (error.message.includes('already exists')) {
                 return res.status(409).json({ message: error.message });
            }
            // Handle other general errors
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};

/**
 * * Handles HTTP Requests to delete a genre by ID.
 * @author zelebwr
 * @param req Express Request object containing genre_id param.
 * @param res Express Response object to send the deleted genre data or error.
 */
export const deleteGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        await genreService.deleteGenreById(genre_id);
        return res.status(200).json({ message: 'Genre deleted successfully' });
    } catch (error) {
        if (error instanceof Error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') { // Record to delete not found
                    return res.status(404).json({ message: 'Genre not found' });
                }
                if (error.code === 'P2003') { // Foreign key constraint failed
                    return res.status(409).json({ message: 'Cannot delete genre as it is referenced by other records.' });
                }
                if (error.code === 'P2014') { // Constraint violation
                    return res.status(409).json({ message: 'Cannot delete genre as it is referenced by other records.' });
                }
                return res.status(500).json({
                    message: 'Internal server error',
                    error: error.message,
                });
            }
            return res.status(500).json({
                message: 'An unknown error occurred',
                error: error.message,
            });
        }
        return res.status(500).json({ message: "An unknown error occurred" });
    }
};
