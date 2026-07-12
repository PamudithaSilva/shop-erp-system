import { Router } from 'express';
import Supplier from '../models/Supplier';
import { createCrudController } from '../controllers/crudController';
import { protect } from '../middleware/auth';
import { permit } from '../middleware/roleMiddleware';
const router = Router(); const controller = createCrudController(Supplier, 'Supplier');
router.use(protect); router.get('/', controller.list); router.post('/', permit('admin'), controller.create); router.put('/:id', permit('admin'), controller.update); router.delete('/:id', permit('admin'), controller.remove);
export default router;
