const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    // ref: 'User' nghĩa là trường userId tham chiếu đến một document trong collection User. 
    //Điều này cho phép bạn sử dụng các phương thức như populate 
    //để tự động thay thế giá trị ObjectId trong trường userId 
    //bằng dữ liệu chi tiết từ document liên quan trong collection User.
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Product', productSchema)





















// 2. mongoDB

// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb')

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       // Update the product
//       dbOp = db.collection('products')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
//   static fetchAll() {
//     const db = getDb();
//     return db.collection('products').find().toArray()
//       .then(products => {
//         console.log(products)
//         return products
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }
//   static findById(prodId) {
//     const db = getDb();
//     return db.collection('products').find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then(product => {
//         return product
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }
//   static deleteById(prodId) {
//     const db = getDb();
//     return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then(product => {
//         return product
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }
// }



// 1. SEQUELIZE

// const Sequelize = require('sequelize');

// const sequelize = require('../util/database');
// const Product = sequelize.define('product', {
//   id: {
//     type: Sequelize.INTEGER,
//     autoIncrement: true,
//     allowNull: false,
//     primaryKey: true
//   },
//   title: Sequelize.STRING,
//   price: {
//     type: Sequelize.DOUBLE,
//     allowNull: false
//   },
//   imageUrl: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   description: {
//     type: Sequelize.STRING,
//     allowNull: false
//   }
// });

// module.exports = Product;
