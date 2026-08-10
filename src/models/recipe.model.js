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
    ingredients: {
        type: [String],
        validate: [
            {
                validator: function(arr) {
                    return arr.every(i => typeof i === 'string' && i.trim().length > 0);
                },
                message: 'Ingredients cannot contain empty values'
            }
        ]
    },
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
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
