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
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error('No transactions found');
            }
        }
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
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const bookIds = books.map(item => item.bookId);
        const booksInDb = await tx.book.findMany({
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
        
        let totalAmount = 0;
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
                tx.book.update({
                    where: { id: book.id },
                    data: { stockQuantity: { decrement: item.quantity }},
                })
            );
        }

        const newTransaction = await tx.transaction.create({
            data: {
                userId: userId,
                total: totalAmount,
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

/**
 * * Calculates sales statistics.
 * @author zelebwr
 * @return An object containing total sales amount and total number of transactions.
 */
export const getTransactionStatistics = async () => {
    try {
        const totalTransactions = await prisma.transaction.count();
        const averageResult = await prisma.transaction.aggregate({
            _avg: {
                total: true,
            },
        });
        const averageTransactionValue = averageResult._avg.total ?? 0;

        const genreCount = await prisma.book.findMany({
            where: {
                deletedAt: null,
                transactions: {
                    some: {},
                },
            },
            select: {
                genre: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
        });

        let genreSales: { [genreName: string]: { id: string, name: string, count: number } } = {};

        genreCount.forEach(book => {
            const genreName = book.genre.name;
            const count = book._count.transactions;

            if (genreSales[genreName]) {
                genreSales[genreName].count += count;
            } else {
                genreSales[genreName] = {
                    id: book.genre.id,
                    name: genreName,
                    count: count,
                };
            }
        });

        const salesArray = Object.values(genreSales); 
        let mostSoldGenre: { name: string; count: number; } | null = null;
        let leastSoldGenre: { name: string; count: number; } | null = null;

        if (salesArray.length > 0) {
            salesArray.sort((a, b) => b.count - a.count); // Sort descending by count
            mostSoldGenre = { name: salesArray[0].name, count: salesArray[0].count };
            leastSoldGenre = { name: salesArray[salesArray.length - 1].name, count: salesArray[salesArray.length - 1].count };
        }

        return {
            totalTransactions,
            averageTransactionValue,
            mostSoldGenre,
            leastSoldGenre,
        };
    } catch (error) {
        console.error('Error calculating transaction statistics:', error);
        throw new Error('Database error while calculating transaction statistics.');
    }
};