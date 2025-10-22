import { GenreRepository } from './genre.repository';

export const GenreService = {
    /**
     * @author Member A
     */
    createGenre: async (name: string) => {
        if (!name) {
            throw new Error('Genre name is required.');
        }
        const existingGenre = await GenreRepository.findByName(name);
        if (existingGenre) {
            throw new Error('Genre name already exists.');
        }
        return await GenreRepository.create(name);
    },
    
    /**
     * @author Member A
     */
    getGenres: async (page: number, limit: number, search: string, orderByName: 'asc' | 'desc') => {
        const finalPage = Math.max(1, page);
        const finalLimit = Math.max(1, limit);

        const { genres, totalCount } = await GenreRepository.findAllWithPagination(
            finalPage, finalLimit, search, orderByName
        );

        const totalPages = Math.ceil(totalCount / finalLimit);
        const meta = {
            page: finalPage,
            limit: finalLimit,
            prev_page: finalPage > 1 ? finalPage - 1 : null,
            next_page: finalPage < totalPages ? finalPage + 1 : null,
        };

        return { genres, meta };
    },

};