const User = require("../models/users")

module.exports.loginGet = (req, res) => {
    res.render("users/login.ejs");
}
module.exports.loginPost = async (req, res) => {
    req.flash("success", "welcome to wanderlust, you are logged in!");
    const redirectUrl = res.locals.redirectUrl || "/listings";
    console.log(res.locals.redirectUrl);
    console.log(req.session.redirectUrl);
    res.redirect(redirectUrl);
}
module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out now");
        res.redirect("/listings")
    })
}

module.exports.signup = (req, res) => {
    res.render("users/signup.ejs")
}

module.exports.signupPost = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "user was registered successfully");
            res.redirect("/listings");
        })

    } catch (e) {
        req.flash("error", e.message)
        res.redirect("/signup")
    }

}