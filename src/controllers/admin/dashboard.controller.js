const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const Brand = require('../../models/brand.model');
const AuditLog = require('../../models/audit_log.model');
const ApiResponse = require('../../utils/ApiResponse');

exports.getDashboardData = async (req, res, next) => {
    try {
        // 1. Overview (Revenue & Customers)
        const revenueAggregation = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
        const totalCustomers = await User.countDocuments();

        // 2. Orders Breakdown
        const pendingOrdersCount = await Order.countDocuments({ orderStatus: 'Pending' });
        const packedOrdersCount = await Order.countDocuments({ orderStatus: 'Packed' });
        const cancelledOrdersCount = await Order.countDocuments({ orderStatus: 'Cancelled' });
        const deliveredOrdersCount = await Order.countDocuments({ orderStatus: 'Delivered' });

        // 3. Stock Alerts
        const outOfStockCount = await Product.countDocuments({
            variations: { $elemMatch: { stockQuantity: { $lte: 0 } } }
        });
        
        const lowStockCount = await Product.countDocuments({
            variations: { $elemMatch: { stockQuantity: { $gt: 0, $lte: 5 } } }
        });

        // 4. Sales Trend (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const salesTrendAgg = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'completed' } },
            {
                $group: {
                    _id: { 
                        dateStr: { $dateToString: { format: "%b %d", date: "$createdAt" } },
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
            { $project: { _id: 0, name: "$_id.dateStr", revenue: 1 } }
        ]);

        // 5. Recent Orders (Last 5)
        const recentOrders = await Order.find()
            .populate('user', 'email')
            .select('orderNumber user totalAmount paymentStatus')
            .sort({ createdAt: -1 })
            .limit(5);

        // 6. Top Brands
        const topBrandsAgg = await Order.aggregate([
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDetails' } },
            { $unwind: '$productDetails' },
            { $match: { 'productDetails.brand': { $exists: true, $ne: null } } },
            { $group: { _id: '$productDetails.brand', count: { $sum: '$items.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'brands', localField: '_id', foreignField: '_id', as: 'brand' } },
            { $unwind: '$brand' },
            { $project: { _id: 1, count: 1, name: '$brand.name' } }
        ]);

        // 7. Audit Logs
        const recentAuditLogs = await AuditLog.find()
            .populate('adminId', 'name')
            .select('action adminId createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        const dashboardData = {
            ordersBreakdown: {
                pending: pendingOrdersCount,
                packed: packedOrdersCount,
                delivered: deliveredOrdersCount,
                cancelled: cancelledOrdersCount
            },
            overview: {
                revenue: totalRevenue,
                customers: totalCustomers
            },
            stockAlerts: {
                lowStock: lowStockCount,
                outOfStock: outOfStockCount
            },
            salesTrend: salesTrendAgg,
            recentOrders: recentOrders,
            topBrands: topBrandsAgg,
            auditLogs: recentAuditLogs
        };

        res.status(200).json(new ApiResponse(200, dashboardData, 'Dashboard data retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
