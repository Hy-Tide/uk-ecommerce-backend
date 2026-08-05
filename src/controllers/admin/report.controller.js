const Order = require('../../models/order.model');
const User = require('../../models/user.model');
const Product = require('../../models/product.model');
const Coupon = require('../../models/coupon.model');
const Payment = require('../../models/payment.model');
const { exportReport } = require('../../utils/export.util');
const dayjs = require('dayjs'); // Using dayjs for date formatting

const getMatchQuery = (req) => {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(endDate);
    }
    return match;
};

exports.getSalesReport = async (req, res, next) => {
    try {
        const { format } = req.query;
        const match = getMatchQuery(req);
        match.paymentStatus = 'completed'; // Only consider completed payments as sales

        const orders = await Order.find(match).sort({ createdAt: -1 });

        const data = orders.map(order => ({
            orderNumber: order.orderNumber,
            date: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
            subTotal: order.subTotal,
            discount: order.discountAmount,
            shipping: order.shippingFee,
            total: order.totalAmount
        }));

        const columns = [
            { header: 'Order Number', key: 'orderNumber', width: 20 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'SubTotal (£)', key: 'subTotal', width: 15 },
            { header: 'Discount (£)', key: 'discount', width: 15 },
            { header: 'Shipping (£)', key: 'shipping', width: 15 },
            { header: 'Total (£)', key: 'total', width: 15 }
        ];

        return exportReport(res, format, 'Sales', columns, data);
    } catch (error) {
        next(error);
    }
};

exports.getCustomerReport = async (req, res, next) => {
    try {
        const { format } = req.query;
        const match = getMatchQuery(req);

        // Aggregate orders per user
        const users = await User.find(match).sort({ createdAt: -1 });
        
        // We need order counts and total spent
        // For a large DB this should be an aggregation, but this is simple enough for now
        const userStats = await Order.aggregate([
            { $group: { _id: '$user', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } }
        ]);

        const statsMap = {};
        userStats.forEach(stat => {
            statsMap[stat._id.toString()] = stat;
        });

        const data = users.map(user => {
            const stats = statsMap[user._id.toString()] || { totalOrders: 0, totalSpent: 0 };
            return {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                phone: user.phone || 'N/A',
                joinedDate: dayjs(user.createdAt).format('YYYY-MM-DD'),
                totalOrders: stats.totalOrders,
                totalSpent: stats.totalSpent.toFixed(2)
            };
        });

        const columns = [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Joined Date', key: 'joinedDate', width: 15 },
            { header: 'Total Orders', key: 'totalOrders', width: 15 },
            { header: 'Total Spent (£)', key: 'totalSpent', width: 15 }
        ];

        return exportReport(res, format, 'Customers', columns, data);
    } catch (error) {
        next(error);
    }
};

exports.getOrderReport = async (req, res, next) => {
    try {
        const { format } = req.query;
        const match = getMatchQuery(req);

        const orders = await Order.find(match)
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 });

        const data = orders.map(order => ({
            orderNumber: order.orderNumber,
            date: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
            customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
            status: order.orderStatus,
            paymentStatus: order.paymentStatus,
            itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
            total: order.totalAmount
        }));

        const columns = [
            { header: 'Order Number', key: 'orderNumber', width: 20 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Customer', key: 'customer', width: 25 },
            { header: 'Order Status', key: 'status', width: 20 },
            { header: 'Payment Status', key: 'paymentStatus', width: 15 },
            { header: 'Items', key: 'itemsCount', width: 10 },
            { header: 'Total (£)', key: 'total', width: 15 }
        ];

        return exportReport(res, format, 'Orders', columns, data);
    } catch (error) {
        next(error);
    }
};

exports.getInventoryReport = async (req, res, next) => {
    try {
        const { format } = req.query;
        // Inventory doesn't usually filter by creation date for current snapshot, 
        // but we'll leave it simple.
        const products = await Product.find().populate('categoryId', 'name');

        const data = [];
        
        products.forEach(product => {
            if (product.variations && product.variations.length > 0) {
                product.variations.forEach(variation => {
                    data.push({
                        name: product.name,
                        sku: product.sku,
                        category: product.categoryId ? product.categoryId.name : 'N/A',
                        variation: variation.displayWeight || 'Standard',
                        stock: variation.stockQuantity,
                        status: variation.stockQuantity <= (variation.minStockAlert || 5) ? (variation.stockQuantity === 0 ? 'Out of Stock' : 'Low Stock') : 'In Stock'
                    });
                });
            } else {
                data.push({
                    name: product.name,
                    sku: product.sku,
                    category: product.categoryId ? product.categoryId.name : 'N/A',
                    variation: 'N/A',
                    stock: 0,
                    status: 'Out of Stock'
                });
            }
        });

        const columns = [
            { header: 'Product Name', key: 'name', width: 30 },
            { header: 'SKU', key: 'sku', width: 15 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Variation', key: 'variation', width: 15 },
            { header: 'Stock', key: 'stock', width: 10 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        return exportReport(res, format, 'Inventory', columns, data);
    } catch (error) {
        next(error);
    }
};

exports.getCouponReport = async (req, res, next) => {
    try {
        const { format } = req.query;
        const match = getMatchQuery(req);

        const coupons = await Coupon.find(match).sort({ createdAt: -1 });

        const data = coupons.map(coupon => ({
            code: coupon.code,
            type: coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed',
            discount: coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `£${coupon.discountValue}`,
            usageCount: coupon.usedCount || 0,
            status: coupon.isActive ? 'Active' : 'Inactive'
        }));

        const columns = [
            { header: 'Coupon Code', key: 'code', width: 20 },
            { header: 'Type', key: 'type', width: 15 },
            { header: 'Discount', key: 'discount', width: 15 },
            { header: 'Usage Count', key: 'usageCount', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];

        return exportReport(res, format, 'Coupons', columns, data);
    } catch (error) {
        next(error);
    }
};

exports.getTaxReport = async (req, res, next) => {
    try {
        const { format } = req.query;
        const match = getMatchQuery(req);
        match.paymentStatus = 'completed'; // Only calculate tax on completed sales

        const orders = await Order.find(match).sort({ createdAt: -1 });

        const data = orders.map(order => {
            // Assuming 20% standard VAT on the subTotal (after discount, before shipping)
            // Or just straight 20% on subTotal. Let's do 20% on subTotal.
            const taxableAmount = Math.max(0, order.subTotal - order.discountAmount);
            const taxAmount = (taxableAmount * 0.20).toFixed(2);

            return {
                orderNumber: order.orderNumber,
                date: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
                subTotal: order.subTotal.toFixed(2),
                discount: order.discountAmount.toFixed(2),
                taxableAmount: taxableAmount.toFixed(2),
                tax: taxAmount,
                total: order.totalAmount.toFixed(2)
            };
        });

        const columns = [
            { header: 'Order Number', key: 'orderNumber', width: 20 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'SubTotal (£)', key: 'subTotal', width: 15 },
            { header: 'Discount (£)', key: 'discount', width: 15 },
            { header: 'Taxable (£)', key: 'taxableAmount', width: 15 },
            { header: 'Tax (20% VAT) (£)', key: 'tax', width: 15 },
            { header: 'Total (£)', key: 'total', width: 15 }
        ];

        return exportReport(res, format, 'Tax', columns, data);
    } catch (error) {
        next(error);
    }
};

exports.getDeliveryReport = async (req, res, next) => {
    try {
        const { format } = req.query;
        const match = getMatchQuery(req);
        
        const orders = await Order.find(match)
            .populate('user', 'firstName lastName phone')
            .sort({ createdAt: -1 });

        const data = orders.map(order => ({
            orderNumber: order.orderNumber,
            date: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
            customer: order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest',
            phone: order.user ? order.user.phone : order.shippingAddress.phone,
            address: `${order.shippingAddress.houseNumber} ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.postcode}`,
            status: order.orderStatus,
            deliverySlot: order.deliverySlot || 'N/A'
        }));

        const columns = [
            { header: 'Order Number', key: 'orderNumber', width: 20 },
            { header: 'Date', key: 'date', width: 18 },
            { header: 'Customer', key: 'customer', width: 20 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Address', key: 'address', width: 40 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Delivery Slot', key: 'deliverySlot', width: 15 }
        ];

        return exportReport(res, format, 'Delivery', columns, data);
    } catch (error) {
        next(error);
    }
};

exports.getPaymentReport = async (req, res, next) => {
    try {
        const { format } = req.query;
        const match = getMatchQuery(req);

        const payments = await Payment.find(match)
            .populate('orderId', 'orderNumber')
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        const data = payments.map(payment => ({
            orderNumber: payment.orderId ? payment.orderId.orderNumber : 'N/A',
            date: dayjs(payment.createdAt).format('YYYY-MM-DD HH:mm'),
            customer: payment.userId ? `${payment.userId.firstName} ${payment.userId.lastName}` : 'Guest',
            intentId: payment.stripePaymentIntentId,
            amount: payment.amount.toFixed(2),
            status: payment.status,
            refundAmount: payment.refundAmount ? payment.refundAmount.toFixed(2) : '0.00'
        }));

        const columns = [
            { header: 'Order Number', key: 'orderNumber', width: 20 },
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Customer', key: 'customer', width: 20 },
            { header: 'Intent ID', key: 'intentId', width: 35 },
            { header: 'Amount (£)', key: 'amount', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Refund (£)', key: 'refundAmount', width: 15 }
        ];

        return exportReport(res, format, 'Payment', columns, data);
    } catch (error) {
        next(error);
    }
};
