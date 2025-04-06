const invModel = require('../models/inventory-model')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const Util = {}


/* **********************************
 * Constructs the nav HTML unordered list
******************************************* */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    // console.log(data)
    let list = '<ul>'
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += '<li>'
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See your inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            '</a>'
        list += '</li>'
    })
    list += '</ul>'
    return list
}

/* **********************************
 * Build the classification view HTML       
******************************************* */
Util.buildClassificationgrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **********************************
 * Build the HTML structure for details views (specific vehicle)
******************************************* */
Util.buildVehicleDetailHTML = function (vehicle) {
    if (!vehicle) {
        return '<p>Sorry, no matching vehicles could be found.</p>';
    }
    return `
        <div class="vehicle-detail-container">
            <div class="vehicle-image">
                <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}" />        
        </div>
        <div class="vehicle-info">
            <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} </h2>
            <p><strong>Price:</strong> ${formatCurrency(vehicle.inv_price)}</p>   
            <p><strong>Mileage:</strong> ${formatNumber(vehicle.inv_miles)}</p>   
            <p><strong>Description:</strong> ${vehicle.inv_description}</p>  
            <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        </div>
        </div>
        `;
}

/*
*Format price U.S dollars
*/
Util.formatCurrency = function (amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

/*
*Format numbers with commas
*/
Util.formatNumber = function (number) {
    return new Intl.NumberFormat('en-US').format(number);
}

/* ****************************************
 * Build the <select> classification list in add new inventory item
/* **************************************** */
Util.buildClassificationList = async function (selectId = "") {
    let data = await invModel.getClassifications();
    let classificationList = "<select id='classification_id' name='classification_id' required>";
    classificationList += "<option value=''>Choose a Classification</option>";

    data.rows.forEach((classification) => {
        let selected = classification.classification_id == selectId ? " selected" : "";
        classificationList += `<option value="${classification.classification_id}"${selected}>${classification.classification_name}</option>`;
    });

    classificationList += "</select>";
    return classificationList;
};

/* Middleware For Handling Errors
* Wrap other function in this for 
* General Error Handling
**************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/*  ***************************************
 *  Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash('Please log in')
                    res.clearCookie('jwt')
                    return res.redirect('/account/login')
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            })
    } else {
        next()
    }
}

/* ***************************************
 *  Check Login
**************************************** */
Util.checkLogin = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
            if (err) {
                req.flash('error', 'Please log in.')
                res.clearCookie('jwt')
                return res.redirect('/account/login')
            } else {
                res.locals.loggedin = true;
                res.locals.accountData = accountData;
                return next();
            }          
        })
     } else {
        req.flash('error', 'Please log in.')
        return res.redirect('/account/login')
    }
}

/* ***************************************
 *  Middleware to Check Account Type
**************************************** */
Util.checkAccountType = (req, res, next) => {
    const accountType = res.locals.accountData?.accountType
    if (accountType === 'Admin' || accountType === 'Employee') {
        next()
    } else {
        req.flash('notice', 'You do not have permission to access this page.')
        return res.redirect('/')
    }
}

module.exports = Util;