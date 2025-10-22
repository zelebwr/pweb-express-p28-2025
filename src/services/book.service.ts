import { BookRepository } from './book.repository';

export const BookService = {
    /**
     * @author Member A
     */
    getBooks: async (
        page: number, 
        limit: number, 
        search: string, 
        orderByTitle: 'asc' | 'desc', 
        orderByPublishDate: 'asc' | 'desc'
    ) => {
        const finalPage = Math.max(1, page);
        const finalLimit = Math.max(1, limit);

        const { books, totalCount } = await BookRepository.findAllWithPagination(
            finalPage, 
            finalLimit, 
            search, 
            orderByTitle, 
            orderByPublishDate
        );

        const totalPages = Math.ceil(totalCount / finalLimit);
        const meta = {
            page: finalPage,
            limit: finalLimit,
            prev_page: finalPage > 1 ? finalPage - 1 : null,
            next_page: finalPage < totalPages ? finalPage + 1 : null,
        };

        return { books, meta };
    },

    /**
     * @author Member A
     * @param {string} bookId 
     * @returns {Promise<any>} 
     * @throws {Error} 
     */
    removeBook: async (bookId: string) => {
        const existingBook = await BookRepository.findById(bookId);

        if (!existingBook) {
            throw new Error('Book not found or already removed.');
        }

        const removedBook = await BookRepository.softDelete(bookId);
        return removedBook;
    }
};