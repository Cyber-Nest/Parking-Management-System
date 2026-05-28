import { Router } from 'express';
import { login, forgotPassword, resetPassword, refreshToken } from '../controllers/officerAuth.controller';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshToken);

export default router;
