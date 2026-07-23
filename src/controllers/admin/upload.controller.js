const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.uploadImage = (req, res, next) => {
    if (!req.file && (!req.files || req.files.length === 0)) {
        return next(new ApiError(400, 'Please upload a file'));
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (req.file) {
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
        return res.status(200).json(new ApiResponse(200, { url: fileUrl }, 'File uploaded successfully'));
    } else if (req.files && req.files.length > 0) {
        const urls = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
        return res.status(200).json(new ApiResponse(200, { urls }, 'Files uploaded successfully'));
    }
};
