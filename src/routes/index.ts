/**
 * @author Hikari
 */

// src/routes/index.ts - SETELAH

import { Router } from 'express'; 

import authRoute from './auth.routes'; 
// import bookRouter from './book.routes';
// import genreRouter from './genre.routes'; // <-- Beri comment di sini
// import transactionRouter from './transaction.routes'; // <-- dan di sini

const router = Router(); 

router.use('/auth', authRoute);
// router.use('/books', bookRouter);
// router.use('/genres', genreRouter); // <-- Beri comment di sini
// router.use('/transactions', transactionRouter); // <-- dan di sini juga

export default router;