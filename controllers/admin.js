const mongodb = require('mongodb')
const { ObjectId } = require('mongodb');
const Product = require('../models/product');
const { validationResult } = require('express-validator');
const { deleteFile } = require('../util/file');



exports.getProducts = (req, res, next) => {

  //1. SQL
  // req.user.getProducts()

  //2. NOSQL  
  Product.find({
    userId: req.user._id
  })
    // .select('title price -_id') lấy trường title  price id khi tìm đc kết quả
    // .populate('userId', 'name') chỉ lấy trường name từ kết quả của userId."
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
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

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const Title = req.body.title;
  const Price = req.body.price;
  const Image = req.file;
  const Desc = req.body.description;
  const errors = validationResult(req)

  if (!Image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title: Title,
        price: Price,
        description: Desc
      },
      errorMessage: 'Attached file is not an image',
      validationErrors: [],
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: {
        title: Title,
        price: Price,
        description: Desc
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const imageUrl = Image.path;

  const product = new Product({
    title: Title,
    price: Price,
    imageUrl: imageUrl,
    description: Desc,
    // Trong Mongoose, khi bạn thiết lập một trường dưới dạng tham chiếu (ref) 
    //đến một model khác và trường này có kiểu dữ liệu là ObjectId, 
    //Mongoose cung cấp tính năng thông minh: bạn có thể gán một đối tượng Mongoose 
    //(ví dụ, một instance của model User) vào trường đó và Mongoose sẽ tự động lấy _id từ đối tượng đó để lưu trữ.
    userId: req.user
  });
  product
    // hàm save là hàm có sẵn trong mongoose
    .save()
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
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

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        imageUrl: updatedImageUrl,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),

    });
  }

  Product.findById(prodId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/')
      }

      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageUrl = updatedImageUrl;
      product.description = updatedDesc;

      return product.save()  // Lưu lại sản phẩm sau khi đã cập nhật
        .then(result => {
          console.log('UPDATED PRODUCT!');
          res.redirect('/admin/products');
        })
    })
    // vì có 1đk if ở trên nên then ở đây phải bỏ vào trong 
    // tránh trường hợp redirect ở trên xong xuống then này redirect lần nữa
    // .then(result => {
    //   console.log('UPDATED PRODUCT!');
    //   res.redirect('/admin/products');
    // })
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

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      console.log(product)
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        errorMessage: null,
        validationErrors: []
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
exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(prod => {
      if (!prod) {
        return next(new Error('Product not found'))
      }
      deleteFile(prod.imageUrl)
      // thêm đk user.id để chỉ có những user nào tạo mới có quyền xóa
      return Product.deleteOne({ _id: prodId, userId: req.user.id })
    })
    .then(result => {
      console.log('PRODUCT DELETED!');
      res.status(200).json({ message: 'Deleting Success' })
    })
    .catch(err => {
      // // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
      // // res.redirect('/500')
      // const error = new Error(err)
      // error.httpStatusCode = 500
      // // next(error) được sử dụng khi bạn muốn chuyển tiếp yêu cầu đến error-handling middleware đầu tiên 
      // // và truyền thông tin lỗi đi kèm.
      // return next(error)
      res.status(500).json({ message: 'Deleting product failed' })
    });
};

// 1 . Dành cho SQL
//Nếu bạn đã thiết lập mối quan hệ "belongsTo" giữa User và Product trong Sequelize,
//thì Sequelize sẽ tự động thêm các phương thức để tạo sản phẩm liên quan đến người dùng.
//Hàm createProduct có thể là một phương thức tự động được thêm vào mô hình User
//thông qua việc sử dụng các phương thức tạo mối quan hệ trong Sequelize
//   req.user.createProduct({
//     title: title,
//     price: price,
//     imageUrl: imageUrl,
//     description: description
//   })
//     .then(result => {
//       // console.log(result);
//       // console.log('Created Product');
//       res.redirect('/admin/products');
//     })
//     .catch(err => {
//       console.log(err);
//     });
// };

// exports.getEditProduct = (req, res, next) => {
//   const editMode = req.query.edit;
//   if (!editMode) {
//     return res.redirect('/');
//   }
//   const prodId = req.params.productId;
//   req.user.getProducts({ where: { id: prodId } })
//     // Product.findByPk(prodId)
//     .then(product => {
//       console.log(product[0])
//       if (!product) {
//         return res.redirect('/');
//       }
//       res.render('admin/edit-product', {
//         pageTitle: 'Edit Product',
//         path: '/admin/edit-product',
//         editing: editMode,
//         product: product[0]
//       });
//     })
//     .catch(err => console.log(err))

// };

// exports.postEditProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   const updatedTitle = req.body.title;
//   const updatedPrice = req.body.price;
//   const updatedImageUrl = req.body.imageUrl;
//   const updatedDesc = req.body.description;
//   Product.findByPk(prodId)
//     .then(product => {
//       product.title = updatedTitle
//       product.price = updatedPrice
//       product.imageUrl = updatedImageUrl
//       product.description = updatedDesc
//       return product.save()
//     })
//     .then(result => {
//       res.redirect('/admin/products');
//     })
//     .catch(err => console.log(err))
//   res.redirect('/admin/products');
// };


// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.destroy({
//     where: {
//       id: prodId
//     }
//   });
//   res.redirect('/admin/products');
// };
