require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        const db = mongoose.connection.db;
        const subcategories = await db.collection('subcategories').find({ category_id: { $type: 'string' } }).toArray();
        console.log('Found ' + subcategories.length + ' subcategories to migrate.');

        let updated = 0;
        for(let doc of subcategories) {
            if(mongoose.isValidObjectId(doc.category_id)) {
                await db.collection('subcategories').updateOne(
                    { _id: doc._id },
                    { $set: { category_id: new mongoose.Types.ObjectId(doc.category_id) } }
                );
                updated++;
            }
        }
        console.log('Successfully updated ' + updated + ' documents.');
        mongoose.disconnect();
    })
    .catch(console.error);
