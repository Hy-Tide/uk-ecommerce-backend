const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Recipe title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Recipe description is required']
    },
    image_url: {
        type: String,
        trim: true
    },
    ingredients: [{
        type: String,
        trim: true
    }],
    instructions: {
        type: String,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    cuisine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cuisine'
    }
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
