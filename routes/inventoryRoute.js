// Needed Resources
const express = require('express')
const router = new express.Router()
const invController = require('../controllers/invController')

//Route to build inventory by classification view
router.get('/type/:classificationId', invController.buildByClassificationId);

//Route to build inventory by specific detail view
router.get('/detail/:inventoryId', invController.getVehicleById);

//Route to trigger intentional error (500)
router.get('/intentional-error', invController.triggerIntentionalError);

module.exports = router;