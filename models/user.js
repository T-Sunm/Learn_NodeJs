const mongoose = require('mongoose');
const Order = require('./order');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }

})

userSchema.methods.addToCart = function (product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    })
    let updatedQuantity = 1;
    const updatedCartItems = [...this.cart.items]
    if (cartProductIndex >= 0) {
        updatedQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = updatedQuantity
    }
    else {
        // mongoose sẽ tự bọc ObjectId cho productId
        updatedCartItems.push({ productId: product._id, quantity: updatedQuantity })
    }
    const updateCart = { items: updatedCartItems }
    this.cart = updateCart;
    return this.save();
}
userSchema.methods.deleteItemsfromCart = function (prodId) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === prodId.toString()
    })
    this.cart.items.splice(cartProductIndex, 1);
    return this.save()
}
userSchema.methods.clearCart = function () {
    this.cart = { items: [] }
    return this.save();
}

module.exports = mongoose.model('User', userSchema)


























//  2. MONGODB

// const { ObjectId } = require("mongodb");
// const { getDb } = require("../util/database");
// const { fetchAll } = require("./product");

// class User {
//     constructor(username, email, cart, id) {
//         this.username = username;
//         this.email = email
//         this.cart = cart;
//         this._id = id;
//     }


//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this)
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString()
//         })
//         let updatedQuantity = 1;
//         const updatedCartItems = [...this.cart.items]
//         if (cartProductIndex >= 0) {
//             updatedQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = updatedQuantity
//         }
//         else {
//             updatedCartItems.push({ productId: new ObjectId(product._id), quantity: updatedQuantity })
//         }
//         const updateCart = { items: updatedCartItems }
//         const db = getDb();
//         db.collection('users').updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: updateCart } }
//         )
//     }
//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(product => {
//             return product.productId
//         })
//         //{ $in: productIds }: Là một toán tử trong MongoDB dùng để tìm tất cả các bản ghi
//         // mà giá trị của trường (_id ở đây) nằm trong một danh sách nào đó
//         //(mảng productIds trong trường hợp này).
//         return db.collection('products').find({ _id: { $in: productIds } }).toArray()
//             .then(products => {
//                 return products.map(product => {
//                     const cartItem = this.cart.items.find(item => {
//                         return item.productId.toString() === product._id.toString();
//                         // tìm thấy rồi thì .quantity để lấy giá trị của quantity
//                     })
//                     const quantity = cartItem.quantity

//                     return {
//                         ...product,
//                         quantity: quantity
//                     }
//                 })
//             })
//             .catch(err => console.log(err))
//     }
//     deleteItemsfromCart(prodId) {
//         const db = getDb();
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === prodId.toString()
//         })
//         this.cart.items.splice(cartProductIndex, 1);
//         return db.collection('users').updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: this.cart } }
//         )
//     }

//     addOrder() {
//         const db = getDb();
//         // xây dựng quan hệ cho order
//         // ** lúc nào cx phải có return trong mỗi hàm để hàm khác gọi tới kh bị lỗi:
//         // Cannot read properties of undefined (reading 'then')
//         return this.getCart().then(products => {
//             const orders = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     name: this.username
//                 }
//             };
//             return db.collection('orders').insertOne(orders);
//         }).then(result => {
//             return db.collection('users').updateOne(
//                 { _id: new ObjectId(this._id) },
//                 { $set: { cart: { items: [] } } }
//             )
//         }).catch(err => console.log(err))
//     }
//     getOrders() {
//         const db = getDb()
//         return db.collection('orders').find({ 'user._id': new ObjectId(this._id) }).toArray()
//             .then(orders => {
//                 return orders
//             })
//             .catch(err => console.log(err))
//     }
//     static deleteProductById(prodId) {
//         const db = getDb();
//         return db.collection('users').findOne({ '_id': { $in: prodId } })
//             .then()
//             .catch()
//     }
//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne({ _id: new ObjectId(userId) })
//             .then(user => {
//                 console.log(user)
//                 return user;
//             })
//             .catch(err => console.log(err))

//     }
// }


// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');

// const User = sequelize.define('user', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     name: Sequelize.STRING,
//     email: Sequelize.STRING
// })

// module.exports = User