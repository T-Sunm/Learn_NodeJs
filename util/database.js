const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient;

// tạo biến '_db' cho phép bạn sử dụng _db để truy cập 
//và thao tác với cơ sở dữ liệu MongoDB 
//thông qua các hàm khác trong mã của bạn.
let _db;

const mongoConnect = callback => {
  MongoClient.connect('mongodb+srv://root:123@cluster0.rsl64jc.mongodb.net/?retryWrites=true&w=majority')
    .then(client => {
      console.log('Connected')
      _db = client.db();
      callback(client)
    })
    .catch(err => {
      console.log(err)
      throw err;
    })
}

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw 'No database found'
}
exports.mongoConnect = mongoConnect;
exports.getDb = getDb;










// 1. SQL

// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-complete', 'root', '', {
//   dialect: 'mariadb',
//   host: '127.0.0.1'
// });

// module.exports = sequelize;


