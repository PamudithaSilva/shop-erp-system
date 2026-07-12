import { Router } from 'express';
import Category from '../models/Category';
import { createCrudController } from '../controllers/crudController';
import { protect } from '../middleware/auth';
import { permit } from '../middleware/roleMiddleware';
const router = Router(); const controller = createCrudController(Category, 'Category');
router.use(protect); router.get('/', controller.list); router.post('/', permit('admin'), controller.create); router.put('/:id', permit('admin'), controller.update); router.delete('/:id', permit('admin'), controller.remove);
export default router;
