const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN', 'LOGOUT', 
            'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT',
            'UPDATE_ORDER', 'UPDATE_CUSTOMER', 'DELETE_CUSTOMER',
            'UPDATE_SETTINGS', 'CREATE_ROLE', 'UPDATE_ROLE', 'DELETE_ROLE',
            'CREATE_ADMIN', 'UPDATE_ADMIN', 'DELETE_ADMIN', 'OTHER'
        ]
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    entityType: {
        type: String
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
