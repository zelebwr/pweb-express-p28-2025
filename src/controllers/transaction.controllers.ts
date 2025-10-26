import { Request, Response } from "express";
import * as transactionService from "../services/transaction.service";

/**
 * * Handles HTTP Requests to get all transactions.
 * @author zelebwr
 */
export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const result = await transactionService.getAllTransactions(req.query );
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10; 
        
        return res.status(200).json({
            success: true,
            message: "Get all transactions successfully",
            data: result.transactions,
            meta: {
                page: page, 
                limit: limit, 
                total: result.total,
                next_page: result.total > page * limit ? page + 1 : null,
                prev_page: page > 1 ? page - 1 : null,
            },
        });
    } catch (error: unknown) {
        console.error(`[ERROR] Failed to get all transactions: ${error}`);

        let errorMessage = "Internal server error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return res.status(500).json({
            success: false,
            message: errorMessage,
        });
    }
};

/**
 * * Handles HTTP request to get a single transaction by its ID.
 * @author zelebwr
 */
export const getTransactionById = async (req: Request, res: Response) => {
    try {
        const { transaction_id } = req.params;
        const transaction = await transactionService.getTransactionById(
            transaction_id
        );

        return res.status(200).json({
            success: true,
            message: "Get transaction detail successfully", 
            data: transaction,
        });
    } catch (error: unknown) {
        console.error(`[ERROR] Failed to get transaction by ID: ${error}`);

        if (error instanceof Error) {
            if (error.message === "Transaction not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error.message === "Invalid transaction ID format") {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
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
                message:
                    "Request body must include userId and a non-empty array of books.",
            });
        }

        const newTransaction = await transactionService.createTransaction(
            userId,
            books
        );

        return res.status(201).json(newTransaction);
    } catch (error: unknown) {
        if (error instanceof Error) {
            // Bad Request
            if (
                error.message.includes("required") ||
                error.message.includes("valid bookId") ||
                error.message.includes("positive quantity")
            ) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            // Not Found
            if (
                error.message.includes("User not found") ||
                error.message.includes("Book(s) not found")
            ) {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }
            // Conflict (or 400 Bad Request)
            if (error.message.includes("Insufficient stock")) {
                return res.status(409).json({
                    success: false,
                    message: error.message,
                });
            }
            // Fallback to 500 Internal Server Error
            return res.status(500).json({
                message: "Internal server error during transaction creation",
                error: error.message,
            });
        }

        // Error when error is not an instance of Error
        return res.status(500).json({
            message: "An unknown error occurred during transaction creation",
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
        return res.status(200).json(stats);
    } catch (error: unknown) {
        console.error(`[ERROR] Failed to get transaction stats: ${error}`);

        let errorMessage =
            "An unknown error occurred while fetching statistics";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return res.status(500).json({
            success: false,
            message: errorMessage,
        });
    }};
