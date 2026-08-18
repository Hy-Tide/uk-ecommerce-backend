const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const { processBase64Images } = require('../src/utils/base64Helper');

// Import models
const Product = require('../src/models/product.model');
const Category = require('../src/models/category.model');
const Brand = require('../src/models/brand.model');
const SubCategory = require('../src/models/sub_category.model');
const Testimonial = require('../src/models/testimonial.model');
const Recipe = require('../src/models/recipe.model');
const Offer = require('../src/models/offer.model');
const HomeConfiguration = require('../src/models/home_configuration.model');
const DeliveryPartner = require('../src/models/delivery_partner.model');
const Cuisine = require('../src/models/cuisine.model');
const BlogCategory = require('../src/models/blog_category.model');
const Blog = require('../src/models/blog.model');
const Banner = require('../src/models/banner.model');

// Define baseUrl for migration. Hardcode or get from env, or default
const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected...');

        let totalMigrated = 0;

        // Helper to process and update
        const migrateModel = async (Model, fields, arrayFields = []) => {
            const docs = await Model.find({});
            let count = 0;
            
            for (let doc of docs) {
                let updated = false;

                for (let field of fields) {
                    if (doc[field] && doc[field].startsWith('data:image/')) {
                        try {
                            doc[field] = await processBase64Images(doc[field], baseUrl);
                            updated = true;
                        } catch (e) {
                            console.error(`Error processing ${Model.modelName} ${doc._id} field ${field}:`, e.message);
                        }
                    }
                }

                for (let field of arrayFields) {
                    if (doc[field] && Array.isArray(doc[field])) {
                        const hasBase64 = doc[field].some(item => item.startsWith('data:image/'));
                        if (hasBase64) {
                            try {
                                doc[field] = await processBase64Images(doc[field], baseUrl);
                                updated = true;
                            } catch (e) {
                                console.error(`Error processing ${Model.modelName} ${doc._id} array field ${field}:`, e.message);
                            }
                        }
                    }
                }

                if (updated) {
                    await doc.save({ validateBeforeSave: false }); // Skip validation just in case other fields are invalid
                    count++;
                }
            }
            console.log(`Migrated ${count} documents in ${Model.modelName}`);
            totalMigrated += count;
        };

        await migrateModel(Product, [], ['images']);
        await migrateModel(Category, ['image']);
        await migrateModel(Brand, ['image_url']);
        await migrateModel(SubCategory, ['image', 'image_url']);
        await migrateModel(Testimonial, ['image_url']);
        await migrateModel(Recipe, ['image_url']);
        await migrateModel(Offer, ['bannerImage']);
        await migrateModel(HomeConfiguration, ['backgroundImage', 'iconImage', 'bannerImage']);
        await migrateModel(DeliveryPartner, ['profileImage']);
        await migrateModel(Cuisine, ['image']);
        await migrateModel(BlogCategory, ['image']);
        await migrateModel(Blog, ['featuredImage', 'coverImage']);
        await migrateModel(Banner, ['image_url']);

        console.log(`Migration complete. Total documents migrated: ${totalMigrated}`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
