import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

/**
 * * Retrieve a single genre by its unique ID. 
 * @author zelebwr
 * @param id The UUID of the genre to retrieve. 
 * @return The genre object or null if not found.
 */
export const getGenreById = async (id: string) => {
    try {
        // Use Prisma to find unique genre by ID
        const genre = await prisma.genre.findUnique({
            where: {
                id: id,
            },
        });

        // Return the genre, or null if Prisma didn't find one
        return genre;
    } catch (error) {
        console.error('Error retrieving genre by ID:', error);
        throw new Error('Database error while retrieving genre by ID.');
    }
};


/**
 * * Update a genre's data by ID. 
 * @author zelebwr
 * @param id The UUID of the genre to update. 
 * @param name The new name for the genre.
 * @returns The updated genre object.
 */
export const updateGenreById = async (id: string, name: string) => {
    try {
        const updatedGenre = await prisma.genre.update({
            where: {
                id: id,
            }, 
            data: {
                name: name,
            },
        });
        return updatedGenre;   
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                throw new Error('A genre with this name already exists.');
            }
            if (error.code === 'P2025') {
                throw new Error('Genre not found');
            }
        }
        console.error('Error updating genre:', error);
        throw new Error('Database error while updating genre.');
    }
};

/**
 * * Delete a genre by ID. 
 * @author zelebwr
 * @param id The UUID of the genre to delete.
 * @return The deleted genre object.
 */
export const deleteGenreById = async (id: string) => {
    try {
        const deletedGenre = await prisma.genre.delete({
            where: {
                id: id,
            },
        });
        return deletedGenre;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error('Genre not found');
            }
            if (error.code === 'P2003') {
                throw new Error('Cannot delete genre when it\' still associated with some books.');
            }
        }
        console.error('Error deleting genre:', error);
        throw new Error('Database error while deleting genre.');
    }
};
