import { Request, Response } from "express";
import * as transactionService from "../services/transaction.service";
import { Prisma } from "@prisma/client";

type CreatedTransactionPayload = Prisma.TransactionGetPayload<{
    include: {
        books: {
            select: {
                quantity: true;
            };
        };
        // We don't strictly need the user include here for the response,
        // but it could be included if the service returns it.
    };
}> & {
    id: string;
    total: number;
};

/**
 * * Handles HTTP Requests to get all transactions.
 * @author zelebwr
 * @param req Express Request object.
 * @param res Express Response object to send the transactions data or error.
 */
export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const transactions = await transactionService.getAllTransactions();
        return res.status(200).json({
            success: true,
            message: "Transactions retrieved successfully",
            data: transactions,
        });
    } catch (error) {
        console.error("Error retrieving all transactions:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: errorMessage,
        });
    }
};

/**
 * * Handles HTTP request to get a single transaction by its ID.
 * @author zelebwr
 * @param req Express Request object containing transaction_id param.
 * @param res Express Response object to send the transaction data or error.
 */
export const getTransactionById = async (req: Request, res: Response) => {
    try {
        const { transaction_id } = req.params;
        const transaction = await transactionService.getTransactionById(
            transaction_id
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Transaction detail retrieved successfully",
            data: transaction,
        });
    } catch (error) {
        let statusCode = 500;
        let message = "Internal server error";
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";

        if (error instanceof Error) {
            if (error.message.includes("Invalid transaction ID format")) {
                statusCode = 400;
                message = error.message;
            } else if (error.message === "Transaction not found") {
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
 * * Handles HTTP request to create a new transaction (purchase).
 * @author zelebwr
 * @param req Express Request object. Expects body: { userId: string, books: [{ bookId: string, quantity: number }] }
 * @param res Express Response object.
 */
export const createTransaction = async (req: Request, res: Response) => {
    try {
        const { userId, books } = req.body;

        if (!userId || !Array.isArray(books) || books.length === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "Request body must include userId and a non-empty array of books.",
            });
        }

        const newTransaction = await transactionService.createTransaction(
            userId,
            books
        );
        const totalQuantity = newTransaction.books.reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0
        );
        const totalPrice = newTransaction.total;

        return res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: {
                transaction_id: newTransaction.id,
                total_quantity: totalQuantity,
                total_price: totalPrice,
            },
        });
    } catch (error) {
        let statusCode = 500;
        let message = "Internal server error during transaction creation";
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";

        if (error instanceof Error) {
            if (
                error.message.includes("required") ||
                error.message.includes("valid bookId") ||
                error.message.includes("positive quantity")
            ) {
                statusCode = 400; // Bad Request
                message = error.message;
            } else if (
                error.message.includes("User not found") ||
                error.message.includes("Book(s) not found")
            ) {
                statusCode = 404; // Not Found
                message = error.message;
            } else if (error.message.includes("Insufficient stock")) {
                statusCode = 409; // Conflict
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
 * * Handls HTTP request to get transaction statistics.
 * @author zelebwr
 * @param req Express Request object.
 * @param res Express Response object to send statistics data or error.
 */
export const getTransactionStatistics = async (req: Request, res: Response) => {
    try {
        const stats = await transactionService.getTransactionStatistics();

        const responseData = {
            total_transactions: stats.totalTransactions,
            average_transaction_amount: stats.averageTransactionValue,
            most_book_sales_genre: stats.mostSoldGenre
                ? stats.mostSoldGenre.name
                : null,
            fewest_book_sales_genre: stats.leastSoldGenre
                ? stats.leastSoldGenre.name
                : null,
        };

        return res.status(200).json({
            success: true,
            message: "Get transactions statistics successfully",
            data: responseData,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching statistics",
            error: errorMessage,
        });
    }
};
