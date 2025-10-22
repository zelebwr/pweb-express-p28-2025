import { Request, Response } from "express";
import * as transactionService from "../services/transaction.service";

/**
 * * Handles HTTP Requests to get all transactions.
 * @author zelebwr
 * @param req Express Request object.
 * @param res Express Response object to send the transactions data or error.
 */
export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const transactions = await transactionService.getAllTransactions();
        return res.json(transactions);
    } catch (error) {
        console.error('Error retrieving all transactions:', error);
        if (error instanceof Error) {
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
        return res.status(500).json({ error: 'Internal server error' });
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
        const transaction = await transactionService.getTransactionById(transaction_id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        return res.status(200).json(transaction);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('Invalid transaction ID format')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message === 'Transaction not found') {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message,
            });
        }
        return res.status(500).json({ message: "An unknown error occurred" });
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
            return res.status(400).json({ message: 'Request body must include userId and a non-empty array of books.' });
        }

        const newTransaction = await transactionService.createTransaction(userId, books);

        return res.status(201).json(newTransaction);

    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('required') || error.message.includes('valid bookId') || error.message.includes('positive quantity')) {
                return res.status(400).json({ message: error.message }); // Bad Request
            }
            if (error.message.includes('User not found') || error.message.includes('Book(s) not found')) {
                return res.status(404).json({ message: error.message }); // Not Found
            }
            if (error.message.includes('Insufficient stock')) {
                return res.status(409).json({ message: error.message }); // Conflict (or 400 Bad Request)
            }
            return res.status(500).json({
                message: 'Internal server error during transaction creation',
                error: error.message,
            });
        }
        return res.status(500).json({ message: 'An unknown error occurred during transaction creation' });
    }
};