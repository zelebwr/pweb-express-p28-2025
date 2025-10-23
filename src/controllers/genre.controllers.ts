import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import * as genreService from "../services/genre.services";

// == FUNGSI DARI TEMAN ANDA (DENGAN PERBAIKAN) ==

/** * * Handles HTTP Requests to get a genre by ID.
 * @author zelebwr
 */
export const getGenreDetail = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        const genre = await genreService.getGenreById(genre_id);

        if (!genre) {
            // Disesuaikan dengan format response standar
            return res.status(404).json({ success: false, message: "Genre not found" });
        }

        // Disesuaikan dengan format response standar
        res.status(200).json({ success: true, message: "Get genre detail successfully", data: genre });
    } catch (error: any) { // Perbaikan tipe error
        console.error('GET GENRE DETAIL ERROR:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * * Handles HTTP Requests to update a genre by ID.
 * @author zelebwr
 */
export const updateGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Genre name is required" });
        }

        const updatedGenre = await genreService.updateGenreById(genre_id, name);
        // Disesuaikan dengan format response standar
        return res.status(200).json({ success: true, message: "Genre updated successfully", data: updatedGenre });
    } catch (error: any) { // Perbaikan tipe error
        if (error.code === 'P2002') { // Unique constraint failed
            return res.status(409).json({ success: false, message: 'A genre with this name already exists.' });
        }
        if (error.code === 'P2025') { // Record to update not found
            return res.status(404).json({ success: false, message: 'Genre not found' });
        }
        console.error('UPDATE GENRE ERROR:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * * Handles HTTP Requests to delete a genre by ID.
 * @author zelebwr
 */
export const deleteGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        await genreService.deleteGenreById(genre_id);
        // Disesuaikan dengan format response standar
        return res.status(200).json({ success: true, message: 'Genre deleted successfully' });
    } catch (error: any) { // Perbaikan tipe error
        if (error.code === 'P2025') { // Record to delete not found
            return res.status(404).json({ success: false, message: 'Genre not found' });
        }
        if (error.code === 'P2003') { // Foreign key constraint failed
            return res.status(409).json({ success: false, message: 'Cannot delete genre as it is referenced by other records.' });
        }
        console.error('DELETE GENRE ERROR:', error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// == FUNGSI BARU YANG KITA TAMBAHKAN ==

/**
 * Handler untuk membuat genre baru (POST /genre).
 * @author HikariReiziq (diadaptasi dari Gemini)
 */
export const handleCreateGenre = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'Genre name is required' });
        }
        const newGenre = await genreService.createGenre(name);
        res.status(201).json({ success: true, message: 'Genre created successfully', data: newGenre });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, message: 'Genre with this name already exists' });
        }
        console.error('CREATE GENRE ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Handler untuk mendapatkan semua genre (GET /genre).
 * @author HikariReiziq (diadaptasi dari Gemini)
 */
export const handleGetAllGenres = async (req: Request, res: Response) => {
    try {
        const result = await genreService.getAllGenres(req.query);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        res.status(200).json({
            success: true,
            message: 'Get all genres successfully',
            data: result.genres,
            meta: {
                page,
                limit,
                total: result.total,
                next_page: result.total > page * limit ? page + 1 : null,
                prev_page: page > 1 ? page - 1 : null,
            },
        });
    } catch (error: any) {
        console.error('GET ALL GENRES ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};