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
 *               ingredients:
 *                 type: string
 *               nutritionalInformation:
 *                 type: string
 *               highlights:
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
 *                       enum: [g, kg, ml, l, pcs, pack]
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
 *               ingredients:
 *                 type: string
 *               nutritionalInformation:
 *                 type: string
 *               highlights:
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
 *                       enum: [g, kg, ml, l, pcs, pack]
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
/**
 * @swagger
 * /admin/products/most-viewed:
 *   get:
 *     summary: Get most viewed products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Most viewed products retrieved successfully
 */
router.get('/most-viewed', authMiddleware.protectAdmin, productController.getMostViewedProducts);

/**
 * @swagger
 * /admin/products/trending:
 *   get:
 *     summary: Get trending products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trending products retrieved successfully
 */
router.get('/trending', authMiddleware.protectAdmin, productController.getTrendingProducts);

/**
 * @swagger
 * /admin/products/best-seller:
 *   get:
 *     summary: Get best seller products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Best seller products retrieved successfully
 */
router.get('/best-seller', authMiddleware.protectAdmin, productController.getBestSellerProducts);

/**
 * @swagger
 * /admin/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Featured products retrieved successfully
 */
router.get('/featured', authMiddleware.protectAdmin, productController.getFeaturedProducts);

/**
 * @swagger
 * /admin/products/{id}/related:
 *   get:
 *     summary: Get related products for a product ID
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
 *         description: Related products retrieved successfully
 */
router.get('/:id/related', authMiddleware.protectAdmin, productController.getRelatedProducts);

/**
 * @swagger
 * /admin/products/{id}/toggle-featured:
 *   patch:
 *     summary: Toggle product featured status
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
 *         description: Featured status toggled successfully
 */
router.patch('/:id/toggle-featured', authMiddleware.protectAdmin, productController.toggleFeatured);

/**
 * @swagger
 * /admin/products/{id}/toggle-best-seller:
 *   patch:
 *     summary: Toggle product best seller status
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
 *         description: Best seller status toggled successfully
 */
router.patch('/:id/toggle-best-seller', authMiddleware.protectAdmin, productController.toggleBestSeller);

/**
 * @swagger
 * /admin/products/{id}/toggle-status:
 *   patch:
 *     summary: Toggle product active/inactive status
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
 *         description: Status toggled successfully
 */
router.patch('/:id/toggle-status', authMiddleware.protectAdmin, productController.toggleStatus);

/**
 * @swagger
 * /admin/products/{id}/toggle-instock:
 *   patch:
 *     summary: Toggle product in-stock status
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
 *         description: In-stock status toggled successfully
 */
router.patch('/:id/toggle-instock', authMiddleware.protectAdmin, productController.toggleInStock);

router.route('/:id')
    .get(productController.getProductById)
    .put(authMiddleware.protectAdmin, productController.updateProduct)
    .delete(authMiddleware.protectAdmin, productController.deleteProduct);

module.exports = router;

