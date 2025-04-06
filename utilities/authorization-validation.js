const e = require("connect-flash");
const validateAuthorization = {}

validateAuthorization.authorizeEmployeeorAdmin = (req, res, next) => {
    const accountType = res.locals.accountData?.account_type

    if (accountType === "Employee" || accountType === "Admin") {
        return next()
    } else {
        req.flash("error", "You are not authorized to access this page.")
        return res.redirect("/account/login")
    }
}

module.exports = validateAuthorization