const express = require('express');
const router = express.Router();
const productController = require('../../controllers/admin/product.controller');
const authMiddleware = require('../../middleware/auth.middleware');



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
 *               - name
 *               - categoryId
 *               - sku
 *               - variations
 *             properties:
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               subCategoryId:
 *                 type: string
 *               brand:
 *                 type: string
 *               sku:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               description:
 *                 type: string
 *               variations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     weight:
 *                       type: number
 *                     weightUnit:
 *                       type: string
 *                       enum: [g, ml]
 *                     regularPrice:
 *                       type: number
 *                     salePrice:
 *                       type: number
 *                     stockQuantity:
 *                       type: integer
 *                     minStockAlert:
 *                       type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string

 *               inStock:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, active, inactive]
 *     responses:
 *       201:
 *         description: Product created successfully
 *   get:
 *     summary: Get all products
 *     tags: [Admin Products]
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
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: subCategoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name, price, -price, displayOrder, newest]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.route('/')
    .post(authMiddleware.protectAdmin, productController.createProduct)
    .get(productController.getAllProducts);

/**
 * @swagger
 * /admin/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Admin Products]
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
 *               name:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               subCategoryId:
 *                 type: string
 *               brand:
 *                 type: string
 *               sku:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               description:
 *                 type: string
 *               variations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     weight:
 *                       type: number
 *                     weightUnit:
 *                       type: string
 *                       enum: [g, ml]
 *                     regularPrice:
 *                       type: number
 *                     salePrice:
 *                       type: number
 *                     stockQuantity:
 *                       type: integer
 *                     minStockAlert:
 *                       type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string

 *               inStock:
 *                 type: boolean
 *               isFeatured:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, active, inactive]
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
    .put(authMiddleware.protectAdmin, productController.updateProduct)
    .delete(authMiddleware.protectAdmin, productController.deleteProduct);

module.exports = router;

