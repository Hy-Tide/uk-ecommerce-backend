const AuditLog = require('../models/audit_log.model');

/**
 * Logs an admin action to the AuditLog collection
 * 
 * @param {String} adminId - ID of the admin performing the action
 * @param {String} action - The action string (e.g. 'UPDATE_PRODUCT')
 * @param {String} entityId - The ID of the document being modified
 * @param {String} entityType - The type of document (e.g. 'Product')
 * @param {Object} details - Any JSON metadata to store about the change
 * @param {String} ipAddress - IP address of the admin
 */
exports.logAdminAction = async (adminId, action, entityId, entityType, details = {}, ipAddress = '') => {
    try {
        if (!adminId) return;

        await AuditLog.create({
            adminId,
            action,
            entityId,
            entityType,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Failed to log admin action:', error);
        // We do not throw the error to prevent breaking the main transaction flow
    }
};
