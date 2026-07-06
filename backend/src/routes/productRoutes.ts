import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} from "../controllers/productController";
import { protect } from "../middleware/auth";
import { permit } from "../middleware/roleMiddleware";

const router = Router();

router.get("/low-stock", protect, permit("admin", "staff"), getLowStockProducts);
router.get("/", protect, permit("admin", "staff"), getProducts);
router.get("/:id", protect, permit("admin", "staff"), getProductById);
router.post("/", protect, permit("admin"), createProduct);
router.put("/:id", protect, permit("admin"), updateProduct);
router.delete("/:id", protect, permit("admin"), deleteProduct);

export default router;