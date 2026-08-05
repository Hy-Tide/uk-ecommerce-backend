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

/**
 * @swagger
 * components:
 *   schemas:
 *     SalesReportItem:
 *       type: object
 *       properties:
 *         orderNumber: { type: string }
 *         date: { type: string }
 *         subTotal: { type: number }
 *         discount: { type: number }
 *         shipping: { type: number }
 *         total: { type: number }
 *     CustomerReportItem:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         email: { type: string }
 *         phone: { type: string }
 *         joinedDate: { type: string }
 *         totalOrders: { type: integer }
 *         totalSpent: { type: string }
 *     OrderReportItem:
 *       type: object
 *       properties:
 *         orderNumber: { type: string }
 *         date: { type: string }
 *         customer: { type: string }
 *         status: { type: string }
 *         paymentStatus: { type: string }
 *         itemsCount: { type: integer }
 *         total: { type: number }
 *     InventoryReportItem:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         sku: { type: string }
 *         category: { type: string }
 *         variation: { type: string }
 *         stock: { type: integer }
 *         status: { type: string }
 *     CouponReportItem:
 *       type: object
 *       properties:
 *         code: { type: string }
 *         type: { type: string }
 *         discount: { type: string }
 *         usageCount: { type: integer }
 *         status: { type: string }
 *     TaxReportItem:
 *       type: object
 *       properties:
 *         orderNumber: { type: string }
 *         date: { type: string }
 *         subTotal: { type: string }
 *         discount: { type: string }
 *         taxableAmount: { type: string }
 *         tax: { type: string }
 *         total: { type: string }
 *     DeliveryReportItem:
 *       type: object
 *       properties:
 *         orderNumber: { type: string }
 *         date: { type: string }
 *         customer: { type: string }
 *         phone: { type: string }
 *         address: { type: string }
 *         status: { type: string }
 *         deliverySlot: { type: string }
 *     PaymentReportItem:
 *       type: object
 *       properties:
 *         orderNumber: { type: string }
 *         date: { type: string }
 *         customer: { type: string }
 *         intentId: { type: string }
 *         amount: { type: string }
 *         status: { type: string }
 *         refundAmount: { type: string }
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SalesReportItem'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomerReportItem'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderReportItem'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryReportItem'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CouponReportItem'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaxReportItem'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeliveryReportItem'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PaymentReportItem'
 */
router.get('/payments', reportController.getPaymentReport);

module.exports = router;
