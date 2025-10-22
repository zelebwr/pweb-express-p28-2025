import { Request, Response } from 'express';
import { BookService } from '../services/book.service';
import { sendResponse } from '../utils/response';

/**
 * @author Member A
 */
export const getAllBooksController = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = (req.query.search as string) || '';
        const orderByTitle = (req.query.orderByTitle as 'asc' | 'desc') || 'asc'; 
        const orderByPublishDate = (req.query.orderByPublishDate as 'asc' | 'desc') || 'asc';

        const { books, meta } = await BookService.getBooks(
            page, 
            limit, 
            search, 
            orderByTitle, 
            orderByPublishDate
        );

        return sendResponse(res, 200, true, 'Get all book successfully', books, meta);

    } catch (error: any) {
        console.error('Get all books error:', error);
        return sendResponse(res, 500, false, 'Internal server error while fetching books.');
    }
};


/**
 * @author Member A
 */
export const deleteBookController = async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;

        await BookService.removeBook(book_id);

        return sendResponse(res, 200, true, 'Book removed successfully');

    } catch (error: any) {
        const message = error.message || 'Internal server error.';
        
        if (message.includes('not found') || message.includes('already removed')) {
            return sendResponse(res, 404, false, message); 
        }

        console.error('Delete book error:', error);
        return sendResponse(res, 500, false, message);
    }
};