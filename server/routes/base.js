exports.ensureLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        var returnUrl = req.originalUrl || req.url;
        res.redirect('/signin?returnUrl=' + encodeURIComponent(returnUrl));
    }
};