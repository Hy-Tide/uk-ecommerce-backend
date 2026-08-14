const Product = require('../../models/product.model');
const StockLog = require('../../models/stock_log.model');
const ApiResponse = require('../../utils/ApiResponse');

exports.getInventory = async (req, res, next) => {
    try {
        const { 
            search, page = 1, limit = 10, categoryId, brand, 
            stockStatus, sort 
        } = req.query;
        
        let query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (categoryId) query.categoryId = categoryId;
        if (brand) query.brand = brand;

        let products = await Product.find(query)
            .populate('categoryId', 'name')
            .populate('brand', 'name')
            .sort({ updatedAt: -1 }); // initial sort, will refine below

        // Compute inventory fields
        let inventoryList = products.map(p => {
            const stock = (p.variations || []).reduce((acc, curr) => acc + (curr.stockQuantity || 0), 0);
            const lowStockThreshold = (p.variations && p.variations.length > 0) ? (p.variations[0].minStockAlert || 10) : 10;
            const price = (p.variations && p.variations.length > 0) ? p.variations[0].regularPrice : 0;
            
            let status = 'In Stock';
            if (stock === 0) status = 'Out of Stock';
            else if (stock <= lowStockThreshold) status = 'Low Stock';

            return {
                _id: p._id,
                productName: p.name,
                sku: p.sku,
                category: p.categoryId ? p.categoryId.name : '',
                brand: p.brand ? p.brand.name : '',
                stock,
                status,
                lowStockThreshold,
                price,
                updatedAt: p.updatedAt
            };
        });

        // Filter by stockStatus
        if (stockStatus) {
            if (stockStatus === 'Low Stock') {
                inventoryList = inventoryList.filter(item => item.status === 'Low Stock');
            } else if (stockStatus === 'Out of Stock') {
                inventoryList = inventoryList.filter(item => item.status === 'Out of Stock');
            } else if (stockStatus === 'In Stock') {
                inventoryList = inventoryList.filter(item => item.status === 'In Stock');
            }
        }

        // Sorting
        if (sort === 'stockAsc') inventoryList.sort((a, b) => a.stock - b.stock);
        else if (sort === 'stockDesc') inventoryList.sort((a, b) => b.stock - a.stock);
        else if (sort === 'name') inventoryList.sort((a, b) => a.productName.localeCompare(b.productName));
        else if (sort === '-name') inventoryList.sort((a, b) => b.productName.localeCompare(a.productName));

        // Pagination
        const skip = (page - 1) * limit;
        const total = inventoryList.length;
        const paginatedList = inventoryList.slice(skip, skip + parseInt(limit));

        res.status(200).json(new ApiResponse(200, {
            inventory: paginatedList,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Inventory retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getCriticalStockAlerts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        let products = await Product.find().select('name sku variations');
        
        let alerts = [];
        
        products.forEach(p => {
            (p.variations || []).forEach(v => {
                const stock = v.stockQuantity || 0;
                const minStockAlert = v.minStockAlert || 0;
                
                let currentStatus = null;
                if (stock <= 0) {
                    currentStatus = 'OUT_OF_STOCK';
                } else if (stock > 0 && stock <= minStockAlert) {
                    currentStatus = 'LOW_STOCK';
                }
                
                if (currentStatus) {
                    alerts.push({
                        productId: p._id,
                        variationId: v._id,
                        productName: `${p.name} ${v.displayWeight ? '- ' + v.displayWeight : ''}`.trim(),
                        sku: p.sku,
                        stock,
                        minStockAlert,
                        status: currentStatus
                    });
                }
            });
        });
        
        if (status) {
            alerts = alerts.filter(a => a.status === status);
        }
        
        const skip = (page - 1) * limit;
        const total = alerts.length;
        const paginatedAlerts = alerts.slice(skip, skip + parseInt(limit));
        
        res.status(200).json(new ApiResponse(200, {
            alerts: paginatedAlerts,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Critical stock alerts retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getStockManagementLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, product, action, user, startDate, endDate } = req.query;
        
        let query = {};
        if (product) query.productId = product;
        if (action) query.action = action;
        if (user) query.user = user;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const skip = (page - 1) * limit;
        const total = await StockLog.countDocuments(query);
        const logs = await StockLog.find(query)
            .populate('productId', 'name sku')
            .populate('user', 'first_name last_name name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        res.status(200).json(new ApiResponse(200, {
            logs,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Stock management logs retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
