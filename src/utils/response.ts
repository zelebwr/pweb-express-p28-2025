import { Response } from 'express';

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
    meta?: any; 
}

/**
 * @author Member A
 * @param {Response} res 
 * @param {number} statusCode 
 * @param {boolean} success 
 * @param {string} message 
 * @param {any} [data] 
 * @param {any} [meta] 
 */

export const sendResponse = (
    res: Response, 
    statusCode: number, 
    success: boolean, 
    message: string, 
    data?: any, 
    meta?: any
) => {
    const responseBody: ApiResponse = {
        success,
        message,
    };
    
    if (data !== undefined) {
        responseBody.data = data;
    }
    
    if (meta !== undefined) {
        responseBody.meta = meta;
    }

    return res.status(statusCode).json(responseBody);
};