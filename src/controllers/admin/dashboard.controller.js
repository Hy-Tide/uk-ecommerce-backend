const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const Brand = require('../../models/brand.model');
const ApiResponse = require('../../utils/ApiResponse');

exports.getDashboardData = async (req, res, next) => {
    try {
        // 1. Revenue: sum of totalAmount where paymentStatus = 'completed'
        const revenueAggregation = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

        // 2. Orders Count
        const totalOrders = await Order.countDocuments();

        // 3. Customers Count
        const totalCustomers = await User.countDocuments();

        // 4. Products Count
        const totalProducts = await Product.countDocuments();

        // 5. Recent Orders (Last 5)
        const recentOrders = await Order.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(5);

        // 6. Order Status Breakdowns
        const pendingOrdersCount = await Order.countDocuments({ orderStatus: 'Pending' });
        const cancelledOrdersCount = await Order.countDocuments({ orderStatus: 'Cancelled' });
        const deliveredOrdersCount = await Order.countDocuments({ orderStatus: 'Delivered' });

        // 7. Low Stock Products
        // Products where any variation has stockQuantity <= 5
        // (Using a simple fallback query since $expr inside $elemMatch can cause errors)
        // Actually, $elemMatch with $lte is safer. Let's do:
        const lowStockProductsSafe = await Product.find({
            variations: {
                $elemMatch: { stockQuantity: { $lte: 5 } }
            }
        }).select('name images sku inStock variations').limit(10);

        // 8. Top Categories (Simply by order count or we can just fetch top viewed/active for now)
        // Proper aggregation: 
        const topCategoriesData = await Category.find({ isActive: true }).limit(5); // Placeholder for fast execution
        
        // Let's do a real aggregation for top categories based on products inside orders
        const topCategoriesAgg = await Order.aggregate([
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDetails' } },
            { $unwind: '$productDetails' },
            { $group: { _id: '$productDetails.categoryId', count: { $sum: '$items.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
            { $unwind: '$category' },
            { $project: { _id: 1, count: 1, name: '$category.name', image: '$category.image' } }
        ]);

        // 9. Top Brands
        const topBrandsAgg = await Order.aggregate([
            { $unwind: '$items' },
            { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productDetails' } },
            { $unwind: '$productDetails' },
            // Only aggregate if brand exists
            { $match: { 'productDetails.brand': { $exists: true, $ne: null } } },
            { $group: { _id: '$productDetails.brand', count: { $sum: '$items.quantity' } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $lookup: { from: 'brands', localField: '_id', foreignField: '_id', as: 'brand' } },
            { $unwind: '$brand' },
            { $project: { _id: 1, count: 1, name: '$brand.name', image: '$brand.image' } }
        ]);

        const dashboardData = {
            overview: {
                revenue: totalRevenue,
                orders: totalOrders,
                customers: totalCustomers,
                products: totalProducts
            },
            ordersBreakdown: {
                pending: pendingOrdersCount,
                cancelled: cancelledOrdersCount,
                delivered: deliveredOrdersCount
            },
            recentOrders: recentOrders,
            lowStockProducts: lowStockProductsSafe,
            topCategories: topCategoriesAgg,
            topBrands: topBrandsAgg
        };

        res.status(200).json(new ApiResponse(200, dashboardData, 'Dashboard data retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
