import { Router } from 'express';
import { listPricings, createPricing, updatePricing, deletePricing } from '../controllers/pricing.controller';

const router = Router();

router.get('/', listPricings);
router.post('/', createPricing);
router.patch('/:id', updatePricing);
router.delete('/:id', deletePricing);

export default router;