const jwt = require('jsonwebtoken')
require('dotenv').config()

const checkJWTToken = (req, res, next) => {
    const token = req.cookies.jwt

    if (!token) {
        res.locals.accountData = null
        res.locals.loggedin = false
        return next()
    }

    try {
        const accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        res.locals.accountData = accountData
        res.locals.loggedIn = true
    }
    catch (err) {
        res.locals.accountData = null
        res.locals.loggedin = false
    }
    next()
}

module.exports = checkJWTToken