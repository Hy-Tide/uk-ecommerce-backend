const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: 8,
            select: false,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        role_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'Role',
            // required: true // Can be added once Roles are implemented
        },
        last_login: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to hash password
adminUserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to check password
adminUserSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const AdminUser = mongoose.model('AdminUser', adminUserSchema);
module.exports = AdminUser;
