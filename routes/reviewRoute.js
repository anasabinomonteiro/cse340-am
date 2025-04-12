const express = require('express')
const router = new express.Router()
const reviewController = require('../controllers/reviewController')
const utilities = require('../utilities/')

// Route to add a new review
router.post('/add-review/:inv_id', utilities.checkLogin, utilities.handleErrors(reviewController.addReview))

// Route to display edit-review form
router.get('/edit-review/:review_id', utilities.checkLogin, utilities.handleErrors(reviewController.editReview))

// Route to update a review
router.post('/update-review/:review_id', utilities.handleErrors(reviewController.updateReview))

router.get('/delete-review/:review_id', utilities.checkLogin, utilities.handleErrors(reviewController.buildDeleteReviewConfirmation))

// Route to delete a review
router.post('/delete-review/:review_id', utilities.checkLogin, utilities.handleErrors(reviewController.deleteReview))

// Route to Delete confirmation page
router.get('/delete-review/:review_id', utilities.checkLogin, utilities.handleErrors(reviewController.confirmDeleteReview))

module.exports = router