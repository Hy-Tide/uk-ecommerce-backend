const Role = require('../models/role.model');
const AdminUser = require('../models/admin_user.model');

const seedRoles = async () => {
    try {
        const roles = [
            {
                name: 'Admin',
                description: 'Super Administrator with full access',
                permissions: ['*'],
                isSystem: true
            },
            {
                name: 'Sales',
                description: 'Can manage orders, products, customers, and view reports',
                permissions: [
                    'manage_orders', 'manage_products', 'manage_customers', 'view_reports'
                ],
                isSystem: true
            },
            {
                name: 'Warehouse',
                description: 'Can manage inventory and prepare orders',
                permissions: [
                    'manage_inventory', 'manage_orders'
                ],
                isSystem: true
            },
            {
                name: 'Delivery',
                description: 'Can manage delivery assignments',
                permissions: [
                    'manage_deliveries'
                ],
                isSystem: true
            }
        ];

        let adminRole = null;

        for (const roleData of roles) {
            let role = await Role.findOne({ name: roleData.name });
            if (!role) {
                role = await Role.create(roleData);
                console.log(`Role created: ${role.name}`);
            }
            
            if (role.name === 'Admin') {
                adminRole = role;
            }
        }

        // Ensure all existing admin users have a role (fallback to Admin to prevent lockout)
        if (adminRole) {
            const adminUsersWithoutRole = await AdminUser.find({ role_id: { $exists: false } });
            for (const admin of adminUsersWithoutRole) {
                admin.role_id = adminRole._id;
                await admin.save({ validateBeforeSave: false }); // Skip validation in case password is empty
                console.log(`Assigned Admin role to user: ${admin.email}`);
            }
        }

    } catch (error) {
        console.error('Error seeding roles:', error);
    }
};

module.exports = { seedRoles };
