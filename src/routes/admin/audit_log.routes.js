const express = require('express');
const router = express.Router();
const auditLogController = require('../../controllers/admin/audit_log.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Audit Logs
 *   description: View admin activity history
 */

router.use(authMiddleware.protectAdmin);
// Only super admins or users with view_audit_logs permission
router.use(authMiddleware.requirePermission('view_audit_logs'));

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get all audit logs
 *     tags: [Admin Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action (e.g. LOGIN)
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: string
 *         description: Filter by admin ID
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter by entity type (e.g. Product)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 */
router.get('/', auditLogController.getAuditLogs);

module.exports = router;
