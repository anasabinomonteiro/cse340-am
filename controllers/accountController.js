/* ****************************************
*  Account Controller
* *************************************** */
const utilities = require('../utilities/')
const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    const messages = req.flash();
    res.render("account/login", {
        title: "Login",
        nav,
        messages

    })
}

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", "Sorry, there was an error processing the regisrtation.")
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            messages: req.flash('notice') // Pass the flash message to the view
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
        })
    }
}

/* ****************************************
*  Process Login request
* *************************************** */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("error", "Please, check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if (process.env.NODE_ENV === 'development') {
                res.cookie('jwt', accessToken, {
                    httpOnly: true,
                    maxAge: 3600 * 1000
                })
            } else {
                res.cookie('jwt', accessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 3600 * 1000
                })
            }

            res.locals.loggedIn = true;
            res.locals.accountData = accountData;

            return res.redirect('/account')
        }
        else {
            req.flash(" message notice", "Please, check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error("Access Forbidden")
    }
}

/* ****************************************
*  Deliver Account Management view  
* *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    const messages = req.flash();
    const accountData = res.locals.accountData

    res.render("account/management", {
        title: "Account Management",
        nav,
        messages,
        accountData,
        loggedIn: res.locals.loggedIn,
    });
}

/* ****************************************
*  Deliver Account Update view
* *************************************** */
async function buildUpdateAccount(req, res, next) {
    let nav = await utilities.getNav()
    const messages = req.flash();
    const accountId = parseInt(req.params.account_id)
    const accountData = await accountModel.getAccountById(accountId)

    if (!accountData) {
        req.flash("error", "Account not found.")
        return res.redirect('/account')
    }

    res.render("account/update", {
        title: "Update Account",
        nav,
        messages,
        accountData,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
    })
}

/* ****************************************
*  Deliver Account Update view  
* *************************************** */
async function buildUpdateAccountView(req, res, next) {
    let nav = await utilities.getNav()
    const messages = req.flash();
    const accountId = parseInt(req.params.account_id)

    if (isNaN(accountId)) {
        throw new Error("Invalid account ID")
    }

    const accountData = await accountModel.getAccountById(accountId)

    res.render("account/update", {
        title: "Update Account",
        nav,
        messages,
        accountData,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,

    })
}

/* ****************************************
*   Update  Account Data 
* *************************************** */
async function updateAccount(req, res, next) {
    const { account_firstname, account_lastname, account_email, account_id } = req.body

    const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)

    if (updateResult) {
        req.flash("success", "Account updated successfully!")
        res.redirect("/account/management")
    } else {
        req.flash("error", "Sorry, the update failed.Try again")
        res.redirect(`/account/update/${account_id}`)
    }
}

/* ****************************************
*   Update  Password    
* *************************************** */
async function updatePassword(req, res, next) {
    const { account_password, account_id } = req.body

    const hashedPassword = await bcrypt.hash(account_password, 10)

    const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

    if (updateResult) {
        req.flash("success", "Password updated successfully!")
        res.redirect("/account/management")
    } else {
        req.flash("error", "Sorry, the password update failed. Try again")
        res.redirect(`/account/update/${account_id}`)
    }
}

/* *************************************************************************************
*   Logout Process to  deletes the token cookie and returns the client to the home view
* ************************************************************************************* */
async function logout(req, res) {
    res.clearCookie('jwt')
    req.flash("sucess", "You have been logged out.")
    res.redirect('/')
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, buildUpdateAccountView, updateAccount, updatePassword, logout }