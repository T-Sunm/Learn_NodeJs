const { default: mongoose } = require('mongoose');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit')
// const Cart = require('../models/cart');

const ITEM_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  // dùng + để chuyển string thành int
  const page = +req.query.page || 1
  let totalItems;
  Product.find().countDocuments()
    .then(NumberItem => {
      totalItems = NumberItem
      return Product.find()
        // skip để biết muốn bắt đầu từ record thứ mấy
        // limit là giới hạn record đc truy vấn ra
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEM_PER_PAGE)
      });
    })
    .catch(err => {
      // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500
      // next(error) được sử dụng khi bạn muốn chuyển tiếp yêu cầu đến error-handling middleware đầu tiên 
      // và truyền thông tin lỗi đi kèm.
      return next(error)
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  //2 .NOSQL
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      });
      console.log(product)
    })
    .catch(err => {
      // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500
      // next(error) được sử dụng khi bạn muốn chuyển tiếp yêu cầu đến error-handling middleware đầu tiên 
      // và truyền thông tin lỗi đi kèm.
      return next(error)
    });


  // 1. SQL
  // Product.findAll({
  //   where: {
  //     id: prodId
  //   }
  // })
  //   .then(product => {
  //     res.render('shop/product-detail', {
  //       product: product[0],
  //       pageTitle: product[0].title,
  //       path: '/products'
  //     });
  //     console.log(product)
  //   })
  //   .catch(err => console.log(err));
  // Product.findById(prodId)
  //   .then(([product]) => {
  //     res.render('shop/product-detail', {
  //       product: product[0],
  //       pageTitle: product.title,
  //       path: '/products'
  //     });
  //   })
  //   .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  // dùng + để chuyển string thành int
  const page = +req.query.page || 1
  let totalItems;
  Product.find().countDocuments()
    .then(NumberItem => {
      totalItems = NumberItem
      return Product.find()
        // skip để biết muốn bắt đầu từ record thứ mấy
        // limit là giới hạn record đc truy vấn ra
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEM_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEM_PER_PAGE)
      });
    })
    .catch(err => {
      // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500
      // next(error) được sử dụng khi bạn muốn chuyển tiếp yêu cầu đến error-handling middleware đầu tiên 
      // và truyền thông tin lỗi đi kèm.
      return next(error)
    });
  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     res.render('shop/index', {
  //       prods: rows,
  //       pageTitle: 'Shop',
  //       path: '/'
  //     });
  //   })
  //   .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId')
    // khi populate nó sẽ lấy thông tin chi tiết từ tường Id sản phẩm
    // thay thế cho ProductID
    // visual:
    // --- trước khi populate:
    // {
    //   _id: 123,
    //   name: "Tuan",
    //   books: [456, 789]
    // }
    // --- sau khi populate:
    // {
    //   books: [
    //     {
    //       _id: 456,
    //       title: "Cuốn sách thứ nhất"
    //     },
    //     {
    //       _id: 789,
    //       title: "Cuốn sách thứ hai"
    //     }
    //   ]
    // }
    .then(user => {
      const products = user.cart.items
      console.log(products)
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(err => {
      // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500
      // next(error) được sử dụng khi bạn muốn chuyển tiếp yêu cầu đến error-handling middleware đầu tiên 
      // và truyền thông tin lỗi đi kèm.
      return next(error)
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500
      // next(error) được sử dụng khi bạn muốn chuyển tiếp yêu cầu đến error-handling middleware đầu tiên 
      // và truyền thông tin lỗi đi kèm.
      return next(error)
    });

};
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // tuyệt đối kh xài User.deleteItemsfromCart
  req.user.deleteItemsfromCart(prodId)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch(err => {
      // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500
      // next(error) được sử dụng khi bạn muốn chuyển tiếp yêu cầu đến error-handling middleware đầu tiên 
      // và truyền thông tin lỗi đi kèm.
      return next(error)
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user })
    .then(orders => {
      console.log(orders)
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(err => {
      // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500
      // next(error) được sử dụng khi bạn muốn chuyển tiếp yêu cầu đến error-handling middleware đầu tiên 
      // và truyền thông tin lỗi đi kèm.
      return next(error)
    });
};
exports.postOrder = (req, res, next) => {
  console.log(req.user.populate('cart.items.productId'))
  req.user.populate('cart.items.productId')
    .then(user => {
      const productsOrder = user.cart.items.map(prod => {
        // khi mình populate thì thuộc tính productId sẽ biến thành object chưa toàn thông tin của sản phẩm đó
        // nếu kh .toObject thì khi prod.productId thì nó sẽ tự động lấy mối productId để lưu , 
        //phải chuyển dữ liệu đó về Object nếu muốn lưu in4 chi tiết
        return { product: prod.productId.toObject(), quantity: prod.quantity }
      })
      const order = new Order({
        products: productsOrder,
        user: {
          email: req.user.email,
          userId: req.user
        }
      })
      return order.save()
    })
    .then(result => {
      return req.user.clearCart()
    })
    .then(result => {
      res.redirect('/orders')
    })
    .catch(err => {
      // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
      // res.redirect('/500')
      const error = new Error(err)
      error.httpStatusCode = 500
      // next(error) được sử dụng khi bạn muốn chuyển tiếp yêu cầu đến error-handling middleware đầu tiên 
      // và truyền thông tin lỗi đi kèm.
      return next(error)
    });
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found'))
      } else if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorize'))
      } else {
        const invoiceName = orderId + '.pdf'
        const invoicePath = path.join('data', 'invoices', invoiceName)
        // // khi gửi dữ liệu về cho trình duyệt , bạn phải set Content-Type cho nó
        // // để trình duyệt biết dữ liệu gì đc gửi về mà xử lý nó
        // res.setHeader('Content-Type', 'application/pdf');
        // // set attachment nếu muốn cho user tải xuống
        // res.setHeader('Content-Disposition', 'attachment; filename=' + invoiceName);
        // res.send(data)


        const pdfDoc = new PDFDocument();
        // khi gửi dữ liệu về cho trình duyệt , bạn phải set Content-Type cho nó
        // để trình duyệt biết dữ liệu gì đc gửi về mà xử lý nó
        res.setHeader('Content-Type', 'application/pdf');
        // set attachment nếu muốn cho user tải xuống
        res.setHeader('Content-Disposition', 'inline; filename=' + invoiceName);
        // sử dụng pipe để chuyển dữ liệu từ readable sang writeable
        // readable ở đây là pdfDoc , writeable là fs.createWriteStream(invoicePath)
        // viết file vào res để chuyển lên cho trình duyệt
        pdfDoc.pipe(fs.createWriteStream(invoicePath))
        pdfDoc.pipe(res)
        pdfDoc.fontSize(26).text('Invoice', {
          underline: true
        })
        pdfDoc.text('-----------------------')
        let totalPrice = 0;
        order.products.forEach(prod => {
          totalPrice += prod.quantity * prod.product.price;
          pdfDoc.fontSize(14).text(
            prod.product.title + ' - ' +
            prod.quantity +
            ' x ' +
            '$' +
            prod.product.price
          )
        });
        pdfDoc.text('------')
        pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
        pdfDoc.end()
      }
    })
    .catch(err => {
      return next(err)
    })
}

// exports.postCart = (req, res, next) => {
//   const prodId = req.body.productId;
//   let fetchedCart;
//   let newQuantity = 1
//   req.user.getCart()
//     .then(cart => {
//       fetchedCart = cart
//       return cart.getProducts({
//         where: { id: prodId }
//       })
//     })
//     .then(products => {
//       let product;
//       if (products.length > 0) {
//         product = products[0]
//       }
//       if (product) {
//         const oldQuantity = product.cartItem.quantity;
//         newQuantity = oldQuantity + 1
//         return product;
//       }
//       return Product.findByPk(prodId)
//     })
//     .then((product => {
//       return fetchedCart.addProduct(product, {
//         through: { quantity: newQuantity }
//       })
//     }))
//     .then(() => {
//       res.redirect('/cart');
//     })
//     .catch(err => console.log(err))

// };

// exports.postCartDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   req.user.getCart()
//     .then(cart => {
//       return cart.getProducts({ where: { id: prodId } })
//     })
//     .then(products => {
//       const product = products[0];
//       return product.cartItem.destroy()
//     })
//     .then(() => {
//       res.redirect('/cart');
//     })
//     .catch(err => console.log(err))
// };
//Vì mối quan hệ là "Mỗi đơn hàng có nhiều sản phẩm thông qua bảng trung gian OrderItem",
//thì việc sử dụng include: ['products'] trong getOrders sẽ tự động lấy thông tin sản phẩm 
//từ bảng trung gian và kết hợp chúng với kết quả truy vấn đơn hàng.
// exports.getOrders = (req, res, next) => {
//   req.user.getOrders({ include: ['products'] })
//     .then(orders => {
//       res.render('shop/orders', {
//         path: '/orders',
//         pageTitle: 'Your Orders',
//         orders: orders
//       });
//     })

// };
// exports.postOrder = (req, res, next) => {
//   req.user.getCart()
//     .then(cart => {
//       return cart.getProducts();
//     })
//     .then(products => {
//       return req.user.createOrder()
//         .then(order => {
//           order.addProducts(
//             products.map(product => {
//               product.orderItem = { quantity: product.cartItem.quantity }
//               return product
//             })
//           )
//         })
//     })
//     .then(() => {
//       res.redirect('/orders')
//     })
//     .catch(err => console.log(err))
// }

