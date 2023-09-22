const User = require("../models/user")
const bcryptjs = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { validationResult } = require("express-validator")


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'minhtq.22ds@vku.udn.vn',
        pass: 'nmooqhqkhmbcotgr'
    }
})

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie')
    //     // split dùng để tách chuỗi thành mảng dựa vào ;
    //     .split(';')[1]
    //     // trim giúp xóa khoảng trắng 2 đầu
    //     .trim()
    //     .split('=')[1]
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        // set input lần đầu là null
        oldInput: {
            email: '',
            password: '',
        },
        validationErrors: []
    })
}

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationErrors: []
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const ConfirmPassword = req.body.confirmPassword
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors.array())
        //  nếu mình kh set status(422) thì mặc định là bạn đang mặc định trả về mã trạng thái HTTP 200 OK
        // -Sử dụng res.status(422).render(...): Bạn đang rõ ràng thông báo rằng có lỗi xảy ra khi xử lý yêu cầu. 
        //Điều này giúp các trình duyệt, bots, và các ứng dụng khác có thể xử lý tình huống theo cách thích hợp.
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: ConfirmPassword
            },
            validationErrors: errors.array()
        })
    }
    bcryptjs.hash(password, 12)
        .then(hassPassword => {
            const user = new User({
                email: email,
                password: hassPassword,
                cart: { items: [] }
            })
            return user.save()
        })
        .then(result => {
            res.redirect('/login')
            transporter.sendMail({
                from: 'minhtq.22ds@vku.udn.vn',
                to: email,
                subject: 'Sign up success',
                html: '<h1>Hello world</h1>'
            })
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

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            // vì mỗi lần validate xong form input sẽ clear
            // tạo đối tượng và xài req để truyền dữ liệu giữa các middleware
            // để getLogin có thể xài và giữ đc input khi validate xong
            oldInput: {
                email: email,
                password: password,
            },
            validationErrors: errors.array(),
        })
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    // vì mỗi lần validate xong form input sẽ clear
                    // tạo đối tượng và xài req để truyền dữ liệu giữa các middleware
                    // để getLogin có thể xài và giữ đc input khi validate xong
                    oldInput: {
                        email: email,
                        password: password,
                    },
                    validationErrors: [],
                })
            }
            bcryptjs.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true
                        req.session.user = user
                        // hàm save để đảm bảo lưu trữ tất cả các session trước khi chuyển hướng
                        // tránh trường hợp chuyển hướng nhưng dữ liệu vẫn chưa thay đổi
                        //(bỏi vì hàm redirect đc chạy độc lập nên phải chờ lưu sesion xong ms chuyển hướng)
                        return req.session.save(err => {
                            console.log(err)
                            res.redirect('/')
                        })
                    }
                    return res.render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Wrong password',
                        // vì mỗi lần validate xong form input sẽ clear
                        // tạo đối tượng và xài req để truyền dữ liệu giữa các middleware
                        // để getLogin có thể xài và giữ đc input khi validate xong
                        oldInput: {
                            email: email,
                            password: password,
                        },
                        validationErrors: [],
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.redirect('/login')
                })
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

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/')
    })
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error')
    if (message.length > 0) {
        message = message[0]
    } else {
        message = null
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset password',
        errorMessage: message
    })
}
exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/reset')
        }
        // khi random các ký tự byte có thể sẽ xuất hiện các ký tự đặc biệt
        // vì vậy cần chuyển nó về hex để hoàn toàn có thể đọc được 
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found .')
                    return res.redirect('/reset')
                }
                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 3600000
                return user.save()
            })
            .then(result => {
                res.redirect('/')
                transporter.sendMail({
                    from: 'minhtq.22ds@vku.udn.vn',
                    to: req.body.email,
                    subject: 'You request your password',
                    html: `<p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>`
                })
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
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token
    // $gt là viết tắt của "greater than"
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error')
            if (message.length > 0) {
                message = message[0]
            } else {
                message = null
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New password',
                errorMessage: message,
                userId: user._id.toString(),

                // truyền token này vào view để xài để tăng bảo mật 
                passwordToken: token
            })
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

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken
    const userId = req.body.userId
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId
    })
        .then(user => {
            resetUser = user
            //  mã hóa newPassword 12 lần
            return bcryptjs.hash(newPassword, 12)
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword
            resetUser.resetToken = undefined
            resetUser.resetTokenExpiration = undefined
            return resetUser.save();
        })
        .then(result => {
            res.redirect('/login')
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
