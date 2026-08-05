const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
    query: {
        type: String,
        required: [true, 'Search query is required'],
        trim: true,
        lowercase: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    resultsCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('SearchLog', searchLogSchema);
