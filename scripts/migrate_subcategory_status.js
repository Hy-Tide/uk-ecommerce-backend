const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' }); // Make sure we load the env file
const SubCategory = require('../src/models/sub_category.model');

const migrateSubCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all subcategories
        const subcategories = await SubCategory.find({});
        console.log(`Found ${subcategories.length} subcategories to check.`);

        for (const sub of subcategories) {
            let updated = false;

            // Migrate status case
            if (sub.status === 'active') {
                sub.status = 'Active';
                updated = true;
            } else if (sub.status === 'inactive') {
                sub.status = 'Inactive';
                updated = true;
            }

            // Ensure displayOrder is set (if not already set correctly by default in schema)
            if (sub.displayOrder === undefined || sub.displayOrder === null) {
                sub.displayOrder = 0;
                updated = true;
            }

            if (updated) {
                await sub.save();
                console.log(`Updated subcategory: ${sub.name}`);
            }
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

migrateSubCategories();
