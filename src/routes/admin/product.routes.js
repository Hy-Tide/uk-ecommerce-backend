const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/product.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin Products
 *   description: Product management for admins
 */

/**
 * @swagger
 * /admin/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - base_price
 *               - category_id
 *             properties:
 *               title:
 *                 type: string
 *               category_id:
 *                 type: string
 *               sub_category_id:
 *                 type: string
 *               brand_id:
 *                 type: string
 *               description:
 *                 type: string
 *               base_price:
 *                 type: number
 *               discount_price:
 *                 type: number
 *               weight:
 *                 type: string
 *               unit:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, active, archived]
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sku:
 *                       type: string
 *                     attributes:
 *                       type: object
 *                     price_modifier:
 *                       type: number
 *                     stock_quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *   get:
 *     summary: Get all products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.route('/')
    .post(productController.createProduct)
    .get(productController.getAllProducts);

/**
 * @swagger
 * /admin/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *   put:
 *     summary: Update a product by ID
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               base_price:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.route('/:id')
    .get(productController.getProductById)
    .put(productController.updateProduct)
    .delete(productController.deleteProduct);

module.exports = router;
