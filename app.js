const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer');



const MONGODB_URI = 'mongodb+srv://root:123@cluster0.rsl64jc.mongodb.net/?retryWrites=true&w=majority'

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'session'
})
const csrfProtection = csrf()

app.set('view engine', 'ejs');
app.set('views', 'views');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});

// lọc tệp file được chọn
// fileFilter nhận vào 3 tham số req: Đối tượng request từ Express.
// file: Thông tin về tệp tin đang được xử lý.
// cb: Callback function để xác định liệu tệp tin có nên được chấp nhận hay không.
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')
const mongoConnect = require('./util/database').mongoConnect;

// const Product = require('./models/product');
const User = require('./models/user');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/orderItem');


// bodyParse giúp xử lý dữ liệu gửi từ client
// Khi client gửi dữ liệu đến server, 
//body-parser sẽ phân tích cú pháp dữ liệu và đưa chúng vào trong object req.body
app.use(bodyParser.urlencoded({ extended: false }));

//single là tên input chọn ảnh 
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
  // secret: Đây là một chuỗi bí mật được sử dụng để ký và giải mã ID session. 
  //Điều này giúp đảm bảo tính bảo mật của ID session.
  secret: 'my secret',
  // resave: Thuộc tính này quyết định xem mỗi lần có một yêu cầu được gửi đến máy chủ, 
  //session sẽ được lưu lại vào lưu trữ session hay không, 
  //ngay cả khi session không hề bị thay đổi trong quá trình yêu cầu đó.
  resave: false,
  // saveUninitialized:Thuộc tính này quyết định xem một session mới 
  //(được khởi tạo nhưng chưa được sửa đổi) sẽ được lưu vào lưu trữ session hay không.
  saveUninitialized: false,
  store: store
}))
app.use(csrfProtection)

app.use(flash())


app.use((req, res, next) => {
  // khi tạo biến isAuthenticated và csrfToken đặt trong locals
  // thì có thể sử dụng chúng mà không cần truyền chúng qua từng controller
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

// middleware này phải đặt sau hàm use Session lúc đó mới fetch đc session
app.use((req, res, next) => {
  // nếu throw lỗi ngoài then thì nó sẽ kh đc catch bắt lại
  // như vậy chương trình sẽ bị đơ và loop vô hạn
  // throw new Error('Sync Dummt')
  if (!req.session.user) {
    return next()
  }
  //2 NoSql
  User.findById(req.session.user._id)
    .then(user => {
      // throw lỗi trong then thì nó sẽ đc catch bắt lại
      // throw new Error('Sync Dummt')
      if (!user) {
        return next();
      }
      req.user = user
      next()
    })
    .catch(err => {
      // xử lý lỗi bây h là phải next cho middleware xử lý lỗi nó xử lý
      next(new Error(err));
    })

  // 1 SQL
  // User.findByPk(1)
  //   .then(user => {
  //     req.user = user;
  //     next();
  //   })
  //   .catch(err => {
  //     console.log(err)
  //     next();
  //   })
})


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500)

app.use(errorController.get404);

// khi gặp lỗi sẽ chạy đến middlewware này vì mình có tham số err
app.use((error, req, res, next) => {
  res.status(500).render('500',
    {
      pageTitle: 'Error!',
      path: '/500',
      isAuthenticated: req.session.isLoggedIn
    });
})

// mongoConnect((client) => {
//   console.log('http://localhost:3000/')
//   app.listen(3000)
// })

mongoose.connect(MONGODB_URI)
  .then(result => {
    app.listen(3000)
    console.log('http://localhost:3000/')
  })
  .catch(err => console.log(err))









// 1 . SQL

// // 1. constraints: true nghĩa là Sequelize sẽ áp đặt các ràng buộc "Khóa Ngoại" trên mối quan hệ này trong cơ sở dữ liệu
// // 2. onDelete: 'CASCADE' có nghĩa là khi một người dùng bị xóa, tất cả các sản phẩm thuộc về người dùng đó cũng sẽ bị tự động xóa
// Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
// User.hasMany(Product)
// User.hasOne(Cart)
// Cart.belongsTo(User)
// //Một giỏ hàng (Cart) có thể chứa nhiều sản phẩm (Product) thông qua một bảng trung gian là CartItem.
// // định nghĩa cả 2 phía là 1 - nhiều => nhiều - nhiều
// Cart.belongsToMany(Product, { through: CartItem })
// Product.belongsToMany(Cart, { through: CartItem })

// Order.belongsTo(User)
// User.hasMany(Order)
// Order.belongsToMany(Product, { through: OrderItem })



// sequelize
//   // { force: true } sẽ làm cho Sequelize xoá các bảng nếu chúng đã tồn tại, sau đó tạo lại chúng. 
//   // .sync({ force: true })
//   .sync()
//   .then(result => {
//     return User.findByPk(1)
//   })
//   .then(user => {
//     if (!user) {
//       return User.create({
//         name: 'Minh',
//         email: 'Minhdeptrai@gmail.com'
//       })
//     }
//     return user;
//   })
//   .then(user => {
//     return user.createCart();
//   })
//   .then(result => {
//     // console.log(result);
//     console.log('http://localhost:3000/')
//     app.listen(3000);
//   })
//   .catch(err => {
//     console.log(err);
//   });
