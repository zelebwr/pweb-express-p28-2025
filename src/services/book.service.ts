import prisma from '../config/prisma';
import { Book } from '@prisma/client';

// Tipe data untuk input saat membuat buku baru
type CreateBookInput = Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
// Tipe data untuk input saat mengupdate buku (hanya kolom tertentu)
type UpdateBookInput = Partial<Pick<Book, 'description' | 'price' | 'stockQuantity'>>;

/**
 * Membuat buku baru.
 * @param bookData Data untuk buku baru.
 */
export const createBook = async (bookData: CreateBookInput) => {
    // Ambil genreId secara terpisah, dan sisanya masukkan ke variabel 'rest'
    const { genreId, ...rest } = bookData;

    return await prisma.book.create({
        data: {
            ...rest, // Masukkan semua data buku lainnya (title, writer, dll.)
            publicationYear: Number(rest.publicationYear),
            price: Number(rest.price),
            stockQuantity: Number(rest.stockQuantity),
            genre: {
                // Beri tahu Prisma untuk MENGHUBUNGKAN ke genre yang sudah ada
                connect: {
                    id: genreId 
                }
            }
        }
    });
};

/**
 * Mengambil detail satu buku berdasarkan ID.
 * @param bookId ID dari buku yang akan dicari.
 */
export const getBookById = async (bookId: string) => {
    return await prisma.book.findUnique({
        where: { id: bookId, deletedAt: null }, // Hanya cari buku yang belum di soft-delete
        include: {
            genre: { // Sertakan informasi nama genre dari relasi
                select: { name: true }
            }
        }
    });
};

/**
 * Mengupdate data buku (deskripsi, harga, stok).
 * @param bookId ID dari buku yang akan diupdate.
 * @param bookData Data baru untuk buku.
 */
export const updateBook = async (bookId: string, bookData: UpdateBookInput) => {
    return await prisma.book.update({
        where: { id: bookId },
        data: bookData,
    });
};

/**
 * Mengambil daftar buku berdasarkan genre dengan pagination.
 * @param genreId ID dari genre yang dicari.
 * @param page Halaman saat ini.
 * @param limit Jumlah data per halaman.
 */
export const getBooksByGenreId = async (genreId: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const books = await prisma.book.findMany({
        where: { genreId: genreId, deletedAt: null },
        skip: skip,
        take: limit,
        include: {
            genre: { select: { name: true } }
        }
    });

    const totalBooks = await prisma.book.count({
        where: { genreId: genreId, deletedAt: null }
    });

    return { books, total: totalBooks };
};