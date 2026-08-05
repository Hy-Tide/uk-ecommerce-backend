const Role = require('../../models/role.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const { logAdminAction } = require('../../utils/audit.util');

exports.getAllRoles = async (req, res, next) => {
    try {
        const roles = await Role.find();
        res.status(200).json(new ApiResponse(200, { roles }, 'Roles retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.createRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;
        
        if (await Role.findOne({ name })) {
            return next(new ApiError(400, 'Role name already exists'));
        }

        const role = await Role.create({ name, description, permissions });

        await logAdminAction(req.user._id, 'CREATE_ROLE', role._id, 'Role', { name }, req.ip);

        res.status(201).json(new ApiResponse(201, { role }, 'Role created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const { name, description, permissions } = req.body;
        
        const role = await Role.findById(req.params.id);
        if (!role) return next(new ApiError(404, 'Role not found'));

        if (role.isSystem) {
            return next(new ApiError(403, 'Cannot edit a core system role'));
        }

        if (name) role.name = name;
        if (description !== undefined) role.description = description;
        if (permissions) role.permissions = permissions;

        await role.save();

        await logAdminAction(req.user._id, 'UPDATE_ROLE', role._id, 'Role', { name }, req.ip);

        res.status(200).json(new ApiResponse(200, { role }, 'Role updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteRole = async (req, res, next) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) return next(new ApiError(404, 'Role not found'));

        if (role.isSystem) {
            return next(new ApiError(403, 'Cannot delete a core system role'));
        }

        await role.deleteOne();

        await logAdminAction(req.user._id, 'DELETE_ROLE', role._id, 'Role', { name: role.name }, req.ip);

        res.status(200).json(new ApiResponse(200, null, 'Role deleted successfully'));
    } catch (error) {
        next(error);
    }
};
