import { Request, Response } from 'express';
import * as bookService from '../services/book.service';

/**
 * Handler untuk membuat buku baru (POST /books)
 */
export const handleCreateBook = async (req: Request, res: Response) => {
    try {
        // --- PENAMBAHAN VALIDASI ---
        const { title, writer, publisher, publicationYear, price, stockQuantity, genreId } = req.body;
        if (!title || !writer || !publisher || !publicationYear || price === undefined || stockQuantity === undefined || !genreId) {
            return res.status(400).json({ success: false, message: 'Missing required fields: title, writer, publisher, publicationYear, price, stockQuantity, genreId are all required.' });
        }
        // --- AKHIR PENAMBAHAN ---

        const newBook = await bookService.createBook(req.body);
        res.status(201).json({ success: true, message: 'Book added successfully', data: newBook });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, message: 'Book with this title already exists' });
        }
        // Menangani jika genreId tidak valid/tidak ditemukan
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Genre with the provided genreId not found.' });
        }
        console.error('CREATE BOOK ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Handler untuk mengupdate buku (PATCH /books/:book_id)
 */
export const handleUpdateBook = async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;
        const updatedBook = await bookService.updateBook(book_id, req.body);
        res.status(200).json({ success: true, message: 'Book updated successfully', data: updatedBook });
    } catch (error: any) {
        // --- PENAMBAHAN VALIDASI SPESIFIK ---
        // Menangani error jika buku yang akan diupdate tidak ditemukan
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Book to update not found.' });
        }
        // --- AKHIR PENAMBAHAN ---
        console.error('UPDATE BOOK ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// Fungsi handleGetBookById dan handleGetBooksByGenre sudah cukup aman
// dan bisa dibiarkan seperti versi sebelumnya. Di bawah ini adalah salinannya.

/**
 * Handler untuk mendapatkan detail buku (GET /books/:book_id)
 */
export const handleGetBookById = async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;
        const book = await bookService.getBookById(book_id);

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        res.status(200).json({ success: true, message: 'Get book detail successfully', data: book });
    } catch (error) {
        console.error('GET BOOK BY ID ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Handler untuk mendapatkan buku berdasarkan genre (GET /books/genre/:genre_id)
 */
export const handleGetBooksByGenre = async (req: Request, res: Response) => {
    try {
        const { genre_id } = req.params;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const result = await bookService.getBooksByGenreId(genre_id, page, limit);

        res.status(200).json({
            success: true,
            message: 'Get books by genre successfully',
            data: result.books,
            meta: {
                page,
                limit,
                total: result.total,
                next_page: result.total > page * limit ? page + 1 : null,
                prev_page: page > 1 ? page - 1 : null,
            }
        });
    } catch (error) {
        console.error('GET BOOKS BY GENRE ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Handler untuk menghapus buku (DELETE /books/:book_id).
 */
export const handleDeleteBook = async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params;
        await bookService.deleteBookById(book_id);
        res.status(200).json({ success: true, message: 'Book removed successfully' });
    } catch (error: any) {
        // Menangani error jika buku yang akan dihapus tidak ditemukan
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Book to delete not found.' });
        }
        console.error('DELETE BOOK ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Handler untuk mendapatkan semua buku (GET /books).
 */
export const handleGetAllBooks = async (req: Request, res: Response) => {
    try {
        const result = await bookService.getAllBooks(req.query);
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        res.status(200).json({
            success: true,
            message: 'Get all books successfully',
            data: result.books,
            meta: {
                page,
                limit,
                total: result.total,
                next_page: result.total > page * limit ? page + 1 : null,
                prev_page: page > 1 ? page - 1 : null,
            }
        });
    } catch (error) {
        console.error('GET ALL BOOKS ERROR:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};