const reviewModel = require("../models/review-model")
const utilities = require('../utilities/')
const reviewCont = {}

/* *************************************************************
 *  Add a new review
 * *********************************************************** */
reviewCont.addReview = async (req, res, next) => {
    const inv_id = req.params.inv_id
    const { review_text } = req.body
    const account_id = res.locals.accountData.account_id

    try {
        const result = await reviewModel.addReview(review_text, inv_id, account_id)
        if (result) {
            req.flash("success", "Review added successfully.")
        } else {
            req.flash("error", "Error adding review.")
        }

        res.redirect("/account/management")

    } catch (error) {
        console.error("Error adding review:", error)
        req.flash("error", "Error adding review.")
        res.redirect("/account/management")
    }
}



/*  *************************************************************
 *  Get the reviews and add to the vehicle detail view
 * *********************************************************** */
reviewCont.buildGetReviewsByInventoryId = async (req, res, next) => {
    const inv_id = req.params.inventoryId
    const reviewsResult = await reviewModel.getReviewsByInventoryId(inv_id)

    if (reviewsResult && reviewsResult.error) {
        return next(reviewsResult.error)
    }

    const reviews = reviewsResult || []

    res.render("inventory/details", {
        title: "Inventory Detail",
        reviews: reviews,
        vehicle: res.locals.vehicle,
        generateScreenName: utilities.generateScreenName,
    })
}

/* *************************************************************
 *  Get user reviews and add to the account management view
 * *********************************************************** */
reviewCont.buildGetReviewsByAccountId = async (req, res, next) => {
    const account_id = req.user.account_id
    const reviewsResult = await reviewModel.getReviewsByAccountId(account_id)

    if (reviewsResult && reviewsResult.error) {
        return next(reviewsResult.error)
    }
    const reviews = reviewsResult || []
    const accountData = res.locals.accountData

    res.render("account", {
        title: "Account Management",
        displayName: utilities.generateScreenName(accountData.account_firstname, accountData.account_lastname),
        reviews: reviews,
        account_id: req.user.account_id,

    })
}

/* *************************************************************
 *  Display the review editing form
 * *********************************************************** */
reviewCont.editReview = async (req, res, next) => {
    const review_id = req.params.review_id
    const reviewResult = await reviewModel.getReviewById(review_id)

    if (reviewResult && reviewResult.error) {
        return next(reviewResult.error)
    }
    const review = reviewResult ? reviewResult[0] : null

    if (review) {
        const nav = await utilities.getNav()
        const accountData = res.locals.accountData
        res.render("review/update-review", {
            title: "Edit Review",
            nav,
            displayName: utilities.generateScreenName(accountData.account_firstname, accountData.account_lastname),
            review: review,
        })
    } else {
        req.flash("error", "Review not found.")
        res.redirect("/account")
    }
}

/* *************************************************************
 *  Update review 
 * *********************************************************** */
reviewCont.updateReview = async (req, res, next) => {
    const review_id = req.params.review_id
    const review_text = req.body.review_text
    const result = await reviewModel.updateReview(review_text, review_id)

    if (result) {
        req.flash("success", "Review updated successfully.")
        res.redirect("/account")
    }
    else {
        req.flash("error", "Error updating review.")
        res.redirect("/account")
    }
}

/* *************************************************************
 * Delete review
 * *********************************************************** */
reviewCont.deleteReview = async (req, res, next) => {
    const review_id = req.params.review_id
    const result = await reviewModel.deleteReview(review_id)

    if (result) {
        req.flash("success", "Review deleted successfully.")
        res.redirect("/account")
    } else {
        req.flash("error", "Error deleting review.")
        res.redirect("/account")
    }
}

/* *************************************************************
 *  Confirm delete review
 * *********************************************************** */
reviewCont.buildDeleteReviewConfirmation = async (req, res, next) => {
    const review_id = req.params.review_id
    const reviewResult = await reviewModel.getReviewById(review_id)

    if (reviewResult && reviewResult.error) {
        return next(reviewResult.error)
    }
    const review = reviewResult ? reviewResult[0] : null

    if (review) {
        const nav = await utilities.getNav()
        const accountData = res.locals.accountData
        res.render("review/delete-review", {
            title: "Delete Review",
            nav,
            displayName: utilities.generateScreenName(accountData.account_firstname, accountData.account_lastname),
            review: review,
        })
    } else {
        req.flash("error", "Review not found.")
        res.redirect("/account")
    }
}


module.exports = reviewCont
