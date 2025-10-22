import { Router } from 'express';
import { registerController } from '../controllers/auth.controller';

const authRouter = Router();

/**
 * @author Member A, Member B
 */
authRouter.post('/register', registerController); 
export default authRouter;