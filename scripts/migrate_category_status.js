const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' }); // Make sure we load the env file
const Category = require('../src/models/category.model');

const migrateCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all categories that do not have the 'status' field set
        const categories = await Category.find({ status: { $exists: false } }).lean();
        
        console.log(`Found ${categories.length} categories to migrate.`);

        for (const cat of categories) {
            // Determine the new status
            const newStatus = cat.is_active === false ? 'Inactive' : 'Active';

            // Update the document: set status and unset is_active
            await Category.collection.updateOne(
                { _id: cat._id },
                { 
                    $set: { status: newStatus },
                    $unset: { is_active: "" } 
                }
            );
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateCategories();
