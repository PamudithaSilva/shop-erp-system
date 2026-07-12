import { Router } from 'express';
import Customer from '../models/Customer';
import { createCrudController } from '../controllers/crudController';
import { protect } from '../middleware/auth';
import { permit } from '../middleware/roleMiddleware';
const router = Router(); const controller = createCrudController(Customer, 'Customer');
router.use(protect); router.get('/', controller.list); router.post('/', permit('admin', 'staff'), controller.create); router.put('/:id', permit('admin', 'staff'), controller.update); router.delete('/:id', permit('admin'), controller.remove);
export default router;
