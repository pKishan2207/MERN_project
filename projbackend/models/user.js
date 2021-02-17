const mongoose = require('mongoose');
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true
    },
    last_name: {
        type: String,
        maxlength: 32,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    user_info: {
        type: String,
        trim: true
    },
    encry_password: {
        type: String,
        required: true
    },
    salt: String,
    role: {
        type: Number,
        default: 0
    },
    purchases: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
});

userSchema.virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = uuidv1();
        this.encry_password = this.securePassword(password);
    })
    .get(function () {
        return this._password;
    })

userSchema.methods = {
    securePassword: function (text) {
        if (!text) return "";
        try {
            return crypto.createHmac('sha256', this.salt)
                .update(text)
                .digest('hex');
        } catch (err) {
            return "";
        }
    },
    authenticate: function (text) {
        return (this.securePassword(text) === this.encry_password);
    }
}



module.exports = mongoose.model("User", userSchema);