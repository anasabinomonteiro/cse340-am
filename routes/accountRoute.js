// Needed Resources
const express = require('express')
const router = new express.Router()
const accountController = require('../controllers/accountController')
const utilities = require('../utilities/')
const regValidate = require('../utilities/account-validation')
const accountValidation = require('../utilities/account-validation')
const revController = require('../controllers/reviewController')

// Route to handle My Account link click
router.get('/login', utilities.handleErrors(accountController.buildLogin))

router.get('/register', utilities.handleErrors(accountController.buildRegister))

// Route to Account Home
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Route to handle My Account view afteR UPDATE account data
router.get('/management', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

// Update account data
router.get('/update/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))

// Process the update account data view(form)
router.get('/update/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccountView))

//Logout  and delete cookie jwt 
router.get('/logout', utilities.checkLogin, utilities.handleErrors(accountController.logout))

// Display user reviews
router.get('/reviews', utilities.checkLogin, utilities.handleErrors(revController.buildGetReviewsByAccountId))

// Process the registration data
router.post('/register',
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
    '/login',
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

//Route to update account data
router.post('/update',
    accountValidation.updateAccountRules(),
    utilities.handleErrors(accountController.updateAccount)
)

//Route to update password
router.post('/update-password',
    accountValidation.updatePasswordRules(),
    utilities.handleErrors(accountController.updatePassword)
)

module.exports = router;
