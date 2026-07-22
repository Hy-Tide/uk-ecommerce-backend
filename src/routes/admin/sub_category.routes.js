const express = require('express');
const router = express.Router();
const subCategoryController = require('../../controllers/admin/sub_category.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { subCategoryValidator } = require('../../validators/sub_category.validator');

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin SubCategories
 *   description: SubCategory management for admins
 */

/**
 * @swagger
 * /admin/subcategories:
 *   post:
 *     summary: Create a new subcategory
 *     tags: [Admin SubCategories]
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
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *               category_id:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       201:
 *         description: SubCategory created successfully
 *   get:
 *     summary: Get all subcategories
 *     tags: [Admin SubCategories]
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
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: SubCategories retrieved successfully
 */
router.route('/')
    .post(subCategoryValidator, subCategoryController.createSubCategory)
    .get(subCategoryController.getAllSubCategories);

/**
 * @swagger
 * /admin/subcategories/{id}:
 *   get:
 *     summary: Get a single subcategory by ID
 *     tags: [Admin SubCategories]
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
 *         description: SubCategory retrieved successfully
 *   put:
 *     summary: Update a subcategory by ID
 *     tags: [Admin SubCategories]
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
 *               category_id:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: SubCategory updated successfully
 *   delete:
 *     summary: Delete a subcategory by ID
 *     tags: [Admin SubCategories]
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
 *         description: SubCategory deleted successfully
 */
router.route('/:id')
    .get(subCategoryController.getSubCategoryById)
    .put(subCategoryValidator, subCategoryController.updateSubCategory)
    .delete(subCategoryController.deleteSubCategory);

module.exports = router;
