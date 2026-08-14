const StockLog = require('../models/stock_log.model');

/**
 * Utility to log stock changes.
 * @param {Object} params
 * @param {ObjectId|string} params.productId
 * @param {ObjectId|string} [params.variationId]
 * @param {string} params.action 'STOCK_ADDED' | 'STOCK_REMOVED' | 'STOCK_ADJUSTED'
 * @param {number} params.quantityChanged
 * @param {number} params.previousStock
 * @param {number} params.newStock
 * @param {string} [params.reason]
 * @param {ObjectId|string} [params.user]
 * @param {string} [params.userModel] 'AdminUser' | 'User' | 'System'
 */
const logStockChange = async (params) => {
    try {
        await StockLog.create({
            productId: params.productId,
            variationId: params.variationId,
            action: params.action,
            quantityChanged: params.quantityChanged,
            previousStock: params.previousStock,
            newStock: params.newStock,
            reason: params.reason || '',
            user: params.user || null,
            userModel: params.userModel || 'System'
        });
    } catch (error) {
        console.error('Error logging stock change:', error);
    }
};

module.exports = {
    logStockChange
};
