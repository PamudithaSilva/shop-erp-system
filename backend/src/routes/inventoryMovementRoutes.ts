import { Router } from 'express';
import { listInventoryMovements } from '../controllers/inventoryMovementController';
import { protect } from '../middleware/auth';
import { permit } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', protect, permit('admin', 'staff'), listInventoryMovements);

export default router;
