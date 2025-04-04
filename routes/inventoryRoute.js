// Needed Resources
const express = require('express')
const router = new express.Router()
const invController = require('../controllers/invController')
const utilities = require('../utilities/')
const validateClassification = require('../utilities/classification-validation')
const validateInventory = require('../utilities/inventory-validation');

//Route to build inventory by classification view
router.get('/type/:classificationId', invController.buildByClassificationId);

//Route to build inventory by specific detail view
router.get('/detail/:inventoryId', invController.getVehicleById);

//Route to trigger intentional error (500)
router.get('/intentional-error', invController.triggerIntentionalError);

//Route to inventory management page
router.get('/', utilities.handleErrors(invController.buildManagement));

//Route to add new classification
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassification));

//Route to add new inventory(vehicle)
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory));

router.get('/getInventory/:classification_id', utilities.handleErrors(invController.getInventoryJSON));

// Route to edit invenoty item
router.get('/edit/:inventoryId', utilities.handleErrors(invController.buildEditInventory));

// Route to edit the delete action in database
router.get('/delete/:inventoryId', utilities.handleErrors(invController.buildDeleteInventory));

// Route to process the submission of the add classification form
router.post('/add-classification', validateClassification.checkAddClassificationData, validateClassification.addClassificationRules, utilities.handleErrors(invController.addClassification));

// Route for processing the submission of the add item to inventory form
router.post('/add-inventory', validateInventory.checkAddInventoryData, validateInventory.addInventoryRules(), utilities.handleErrors(invController.addInventory));

// Route for processing the submission of the edit inventory form
router.post('/edit-inventory', validateInventory.checkUpdateData, utilities.handleErrors(invController.updateInventory));

// Route for processing the submission of the delete inventory form
router.post('/delete-confirm', utilities.handleErrors(invController.deleteInventory));

module.exports = router;