const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // assuming uuid is available, let's use standard crypto if not. Actually I will use Date.now() + Math.round(Math.random() * 1E9)

/**
 * Checks if a string is a valid base64 image.
 */
const isBase64Image = (str) => {
    if (typeof str !== 'string') return false;
    return str.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
};

/**
 * Decodes a base64 string and saves it as an image file.
 * Returns the URL for the saved image.
 */
const saveBase64Image = async (base64Str, baseUrl) => {
    return new Promise((resolve, reject) => {
        const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            return reject(new Error('Invalid base64 image format'));
        }

        let extension = matches[1].toLowerCase();
        if (extension === 'jpeg') extension = 'jpg';
        
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const filename = `img_${Date.now()}_${Math.round(Math.random() * 1E9)}.${extension}`;
        
        // Ensure uploads directory exists
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const filePath = path.join(uploadDir, filename);
        
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                return reject(err);
            }
            // Form the URL: baseUrl/uploads/filename
            // Removing trailing slash from baseUrl just in case
            const cleanBaseUrl = baseUrl.replace(/\/$/, '');
            resolve(`${cleanBaseUrl}/uploads/${filename}`);
        });
    });
};

/**
 * Processes a field containing base64 images or standard URLs.
 * Works for both single strings and arrays of strings.
 * Leaves non-base64 strings untouched.
 */
const processBase64Images = async (data, baseUrl) => {
    if (!data) return data;

    if (Array.isArray(data)) {
        const processed = [];
        for (const item of data) {
            if (isBase64Image(item)) {
                try {
                    const url = await saveBase64Image(item, baseUrl);
                    processed.push(url);
                } catch (error) {
                    console.error('Error processing base64 image:', error);
                    // On error, we could push the original string or fail. Let's push original to avoid losing data, though it might be invalid.
                    processed.push(item);
                }
            } else {
                processed.push(item);
            }
        }
        return processed;
    } else if (typeof data === 'string') {
        if (isBase64Image(data)) {
            try {
                return await saveBase64Image(data, baseUrl);
            } catch (error) {
                console.error('Error processing base64 image:', error);
                return data;
            }
        }
        return data;
    }

    return data;
};

module.exports = {
    isBase64Image,
    saveBase64Image,
    processBase64Images
};
