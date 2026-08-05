const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    permissions: [{
        type: String
    }],
    isSystem: {
        type: Boolean,
        default: false // Core roles cannot be deleted
    }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
