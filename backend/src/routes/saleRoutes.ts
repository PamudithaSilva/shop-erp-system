import { Router } from 'express';
import { createSale, listSales, refundSale } from '../controllers/saleController';
import { protect } from '../middleware/auth';
import { permit } from '../middleware/roleMiddleware';
const router = Router(); router.use(protect); router.get('/', listSales); router.post('/', permit('admin', 'staff'), createSale); router.post('/:id/refund', permit('admin'), refundSale); export default router;
