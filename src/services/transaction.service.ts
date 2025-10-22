import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

type BookOrderItem = { 
    bookId: string;
    quantity: number;
}

/**
 * * Retrieve a list of all transactions.
 * @author zelebwr
 * @return An array of transaction objects.
 * @description List of all transactions, including user information and details about the boks in each transaction.
 */
export const getAllTransactions = async () => {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                // User details, excluding password
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
                // Books details in the transaction
                books: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                price: true, 
                            },
                        },
                    },
                },
            },
        });
        return transactions;
    } catch (error) {
        console.error('Error retrieving all transactions:', error);
        throw new Error('Database error while retrieving transactions.');
    }
};

/**
 * * Retrieve a single transaction by its unique ID.
 * @author zelebwr
 * @param id The UUID of the transaction to retrieve.
 * @return The transaction object or null if not found.
 * @description Includes user details and detailed book information for the specific transaction.
 */
export const getTransactionById = async (id: string) => {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
                books: {
                    select: {
                        quantity: true,
                        book: {
                            select: {
                                id: true,
                                title: true,
                                writer: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });
        return transaction;
    } catch (error) {
        console.error('Error retrieving transaction by ID:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error('Transaction not found');
            }
        } 
        throw new Error('Database error while retrieving transaction by ID.');
    }
};

/**
 * * Creates a new transaction (purchase). 
 * @author zelebwr
 * @param userId The ID of the user making the transaction.
 * @param books An array of book order items, each containing a bookId and quantity.
 * @return The newly created transaction object.
 * @throws Error if user not found, book not found, or insufficient stock.
 */
export const createTransaction = async (userId: string, books: BookOrderItem[]) => {
    if (!userId || !books || books.length === 0) {
        throw new Error('Invalid input: userId and books are required.');
    }
    for (const item of books) {
        if (!item.bookId || !item.quantity || item.quantity <= 0) {
            throw new Error('Invalid book item: invalid bookId and a positive quantity are required.');
        }
    }

    // Prisma's interactive transaction
    return prisma.$transaction(async (prisma) => {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const bookIds = books.map(item => item.bookId);
        const booksInDb = await prisma.book.findMany({
            where: {
                id: { in: bookIds },
                deletedAt: null,
            },
        });

        if (booksInDb.length !== bookIds.length) {
            const foundIds = booksInDb.map(book => book.id);
            const missingIds = bookIds.filter(id => !foundIds.includes(id));
            throw new Error(`Book(s) not found: ${missingIds.join(', ')}`);
        }
        
        const update: Promise<any>[] = []; 

        for (const item of books) {
            const book = booksInDb.find(book => book.id === item.bookId)!;
            if (!book) {
                throw new Error(`Book not found: ${item.bookId}`);
            }
            if (book.stockQuantity < item.quantity) {
                throw new Error(`Insufficient stock for book: ${book.title}. Available: ${book.stockQuantity}, Requested: ${item.quantity}`);
            }
            totalAmount += book.price * item.quantity;

            // Update stock quantity
            update.push(
                prisma.book.update({
                    where: { id: book.id },
                    data: { stockQuantity: { decrement: item.quantity }},
                })
            );
        }

        const newTransaction = await prisma.transaction.create({
            data: {
                userId: userId,
                books: {
                    create: books.map(item => ({
                        bookId: item.bookId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                user: { 
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    }
                },
                books: {
                    select: {
                        quantity: true,
                        book: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                            }
                        }
                    }
                }
            },
        });
        await Promise.all(update);
        
        return newTransaction;
    });
};