const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product', [
    body('title')
        //  ở đây kh xài isAlphanumeric vì title xài được ký tự tự do và cả khoảng trắng 
        //  nên đổi thành isNumber
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('price').isFloat(),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
], isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
    body('title')
        //  ở đây kh xài isAlphanumeric vì title xài được ký tự tự do và cả khoảng trắng 
        //  nên đổi thành isNumber
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description')
        .isLength({ min: 5, max: 400 })
        .trim()
], isAuth, adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
