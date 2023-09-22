module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        // mã 401 là Yêu cầu cần xác thực.
        return res.status(401).redirect('/login')
    }
    next();
}