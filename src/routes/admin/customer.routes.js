const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/admin/customer.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { updateCustomerValidator, updateStatusValidator } = require('../../validators/customer.validator');

/**
 * @swagger
 * tags:
 *   name: Admin Customers
 *   description: Customer management for admins
 */

/**
 * @swagger
 * /admin/customers:
 *   get:
 *     summary: Get all customers (with pagination and search)
 *     tags: [Admin Customers]
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
 *           enum: [Active, Inactive]
 *       - in: query
 *         name: is_blocked
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 */
router.route('/')
    .get(authMiddleware.protectAdmin, customerController.getAllCustomers);

/**
 * @swagger
 * /admin/customers/{id}:
 *   get:
 *     summary: Get a single customer by ID
 *     tags: [Admin Customers]
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
 *         description: Customer retrieved successfully
 *       404:
 *         description: Customer not found
 *   put:
 *     summary: Update a customer by ID
 *     tags: [Admin Customers]
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 *   delete:
 *     summary: Delete a customer by ID
 *     tags: [Admin Customers]
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
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 */
router.route('/:id')
    .get(authMiddleware.protectAdmin, customerController.getCustomerById)
    .put(authMiddleware.protectAdmin, updateCustomerValidator, customerController.updateCustomer)
    .delete(authMiddleware.protectAdmin, customerController.deleteCustomer);

/**
 * @swagger
 * /admin/customers/{id}/status:
 *   patch:
 *     summary: Update customer status
 *     tags: [Admin Customers]
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
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Customer status updated successfully
 *       404:
 *         description: Customer not found
 */
router.route('/:id/status')
    .patch(authMiddleware.protectAdmin, updateStatusValidator, customerController.updateCustomerStatus);

/**
 * @swagger
 * /admin/customers/{id}/block:
 *   patch:
 *     summary: Block a customer
 *     tags: [Admin Customers]
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
 *         description: Customer blocked successfully
 *       404:
 *         description: Customer not found
 */
router.route('/:id/block')
    .patch(authMiddleware.protectAdmin, customerController.blockCustomer);

/**
 * @swagger
 * /admin/customers/{id}/unblock:
 *   patch:
 *     summary: Unblock a customer
 *     tags: [Admin Customers]
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
 *         description: Customer unblocked successfully
 *       404:
 *         description: Customer not found
 */
router.route('/:id/unblock')
    .patch(authMiddleware.protectAdmin, customerController.unblockCustomer);

/**
 * @swagger
 * /admin/customers/{id}/wishlist:
 *   get:
 *     summary: Get a customer's wishlist
 *     tags: [Admin Customers]
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
 *         description: Customer wishlist retrieved successfully
 *       404:
 *         description: Customer not found
 */
router.route('/:id/wishlist')
    .get(authMiddleware.protectAdmin, customerController.getCustomerWishlist);

module.exports = router;
