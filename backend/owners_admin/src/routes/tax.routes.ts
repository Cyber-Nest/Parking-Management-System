import { Router } from 'express';
import { listTaxes, createTax, updateTax, deleteTax } from '../controllers/tax.controller';

const router = Router();

router.get('/', listTaxes);
router.post('/', createTax);
router.patch('/:id', updateTax);
router.delete('/:id', deleteTax);

export default router;