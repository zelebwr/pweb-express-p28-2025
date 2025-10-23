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
            return res.status(404).json({
                success: false,
                message: "Genre not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Get genre detail successfully",
            data: genre,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: errorMessage,
        });
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
 * @param req Express Request object containing genre_id param.
 * @param res Express Response object to send the deleted genre data or error.
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
