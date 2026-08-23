const mongoose = require('mongoose');
const SubCategory = require('./src/models/sub_category.model');
const Category = require('./src/models/category.model');

// Load env variables if needed, assuming the uri is simple for local
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uk-ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const categories = await Category.find();
        console.log("Categories:", categories.map(c => ({ id: c._id, name: c.name, slug: c.slug, status: c.status })));
        
        const subCategories = await SubCategory.find();
        console.log("SubCategories:", subCategories.map(s => ({ id: s._id, name: s.name, cat_id: s.category_id, status: s.status })));
        
        mongoose.disconnect();
    })
    .catch(console.error);
