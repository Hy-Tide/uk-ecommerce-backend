const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/admin/report.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Reports
 *   description: Exportable data reports for analytics
 */

router.use(authMiddleware.protectAdmin);

// Common parameters for most reports
const reportParams = [
    {
        in: 'query',
        name: 'format',
        schema: { type: 'string', enum: ['json', 'csv', 'excel', 'pdf'], default: 'json' },
        description: 'Export format'
    },
    {
        in: 'query',
        name: 'startDate',
        schema: { type: 'string', format: 'date' },
        description: 'Filter from this date (YYYY-MM-DD)'
    },
    {
        in: 'query',
        name: 'endDate',
        schema: { type: 'string', format: 'date' },
        description: 'Filter up to this date (YYYY-MM-DD)'
    }
];

/**
 * @swagger
 * /admin/reports/sales:
 *   get:
 *     summary: Get Sales Report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FormatParam'
 *       - $ref: '#/components/parameters/StartDateParam'
 *       - $ref: '#/components/parameters/EndDateParam'
 *     responses:
 *       200:
 *         description: Sales report retrieved successfully
 */
router.get('/sales', reportController.getSalesReport);

/**
 * @swagger
 * /admin/reports/customers:
 *   get:
 *     summary: Get Customer Report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FormatParam'
 *       - $ref: '#/components/parameters/StartDateParam'
 *       - $ref: '#/components/parameters/EndDateParam'
 *     responses:
 *       200:
 *         description: Customer report retrieved successfully
 */
router.get('/customers', reportController.getCustomerReport);

/**
 * @swagger
 * /admin/reports/orders:
 *   get:
 *     summary: Get Order Report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FormatParam'
 *       - $ref: '#/components/parameters/StartDateParam'
 *       - $ref: '#/components/parameters/EndDateParam'
 *     responses:
 *       200:
 *         description: Order report retrieved successfully
 */
router.get('/orders', reportController.getOrderReport);

/**
 * @swagger
 * /admin/reports/inventory:
 *   get:
 *     summary: Get Inventory Report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FormatParam'
 *     responses:
 *       200:
 *         description: Inventory report retrieved successfully
 */
router.get('/inventory', reportController.getInventoryReport);

/**
 * @swagger
 * /admin/reports/coupons:
 *   get:
 *     summary: Get Coupon Report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FormatParam'
 *       - $ref: '#/components/parameters/StartDateParam'
 *       - $ref: '#/components/parameters/EndDateParam'
 *     responses:
 *       200:
 *         description: Coupon report retrieved successfully
 */
router.get('/coupons', reportController.getCouponReport);

/**
 * @swagger
 * /admin/reports/taxes:
 *   get:
 *     summary: Get Tax Report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FormatParam'
 *       - $ref: '#/components/parameters/StartDateParam'
 *       - $ref: '#/components/parameters/EndDateParam'
 *     responses:
 *       200:
 *         description: Tax report retrieved successfully
 */
router.get('/taxes', reportController.getTaxReport);

/**
 * @swagger
 * /admin/reports/deliveries:
 *   get:
 *     summary: Get Delivery Report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FormatParam'
 *       - $ref: '#/components/parameters/StartDateParam'
 *       - $ref: '#/components/parameters/EndDateParam'
 *     responses:
 *       200:
 *         description: Delivery report retrieved successfully
 */
router.get('/deliveries', reportController.getDeliveryReport);

/**
 * @swagger
 * /admin/reports/payments:
 *   get:
 *     summary: Get Payment Report
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/FormatParam'
 *       - $ref: '#/components/parameters/StartDateParam'
 *       - $ref: '#/components/parameters/EndDateParam'
 *     responses:
 *       200:
 *         description: Payment report retrieved successfully
 */
router.get('/payments', reportController.getPaymentReport);

module.exports = router;
