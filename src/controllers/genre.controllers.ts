import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import * as genreService from "../services/genre.services";

/**
 * * Handler untuk membuat genre baru (POST /genre).
 * @author HikariReiziq (diadaptasi dari Gemini)
 */
export const handleCreateGenre = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Genre name is required",
            });
        }
        const newGenre = await genreService.createGenre(name);
        res.status(201).json({
            success: true,
            message: "Genre created successfully",
            data: newGenre,
        });
    } catch (error) {
        console.error(`[ERROR] Failed to create genre`, error);
        if (error instanceof Error && error.message.includes("already exists")) {
            return res.status(409).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * * Handler untuk mendapatkan semua genre (GET /genre).
 * @author HikariReiziq (diadaptasi dari Gemini)
 */
export const handleGetAllGenres = async (req: Request, res: Response) => {
    try {
        const result = await genreService.getAllGenres(req.query);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        res.status(200).json({
            success: true,
            message: "Get all genres successfully",
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
        console.error(`[ERROR] Failed to get all genres`, error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

/**
 * * Handles HTTP Requests to get a genre by ID. (GET /genre/:genre_id)
 * @author zelebwr
 */
export const getGenreDetail = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        const genre = await genreService.getGenreById(genre_id);

        if (!genre) {
            return res.status(404).json({
                success: false,
                message: "Genre not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Get genre detail successfully",
            data: genre,
        });
    } catch (error) {
        console.error(
            `[ERROR] Failed to get genre detail for ID: ${req.params.genre_id}`,
            error
        );
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        });
    }
};

/**
 * * Handles HTTP Requests to update a genre by ID. (PATCH /genre/:genre_id)
 * @author zelebwr
 */
export const updateGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Genre name is required",
            });
        }

        const updatedGenre = await genreService.updateGenreById(genre_id, name);
        return res.status(200).json({
            success: true,
            message: "Genre updated successfully",
            data: updatedGenre,
        });
    } catch (error) {
        console.error(
            `[ERROR] Failed to update genre for ID: ${req.params.genre_id}`,
            error
        );

        let statusCode = 500;
        let message = "Internal server error";
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";

        if (error instanceof Error) {
            if (error.message.includes("already exists")) {
                statusCode = 409;
                message = error.message;
            } else if (error.message.includes("Genre not found")) {
                statusCode = 404;
                message = error.message;
            }
        }

        return res.status(statusCode).json({
            success: false,
            message: message,
            error: errorMessage,
        });
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
        return res.status(200).json({
            success: true,
            message: "Genre removed successfully",
        });
    } catch (error) {
        console.error(
            `[ERROR] Failed to remove genre for ID: ${req.params.genre_id}`,
            error
        );

        let statusCode = 500;
        let message = "Internal server error";
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";

        if (error instanceof Error) {
            if (error.message.includes("Genre not found")) {
                statusCode = 404;
                message = error.message;
            } else if (error.message.includes("Cannot delete genre")) {
                statusCode = 400;
                message = error.message;
            }
        }

        return res.status(statusCode).json({
            success: false,
            message: message,
            error: errorMessage,
        });
    }
};

