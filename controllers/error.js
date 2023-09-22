exports.get404 = (req, res, next) => {
  res.status(404).render('404', { pageTitle: 'Page Not Found', path: '/404', isAuthenticated: req.session.isLoggedin });

};

exports.get500 = (req, res, next) => {
  // Mã 500 thể hiện có lỗi từ phía máy chủ, không phải do client. 
  res.status(500).render('500',
    { pageTitle: 'Error!', path: '/500', isAuthenticated: req.session.isLoggedin });

};
