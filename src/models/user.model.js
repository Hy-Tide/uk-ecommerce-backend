const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: [true, 'Please provide your first name'],
            trim: true,
        },
        last_name: {
            type: String,
            required: [true, 'Please provide your last name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
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
            select: false, // Don't return password by default
        },
        phone_number: {
            type: String,
            trim: true,
        },
        is_active: {
            type: Boolean,
            default: true,
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
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
