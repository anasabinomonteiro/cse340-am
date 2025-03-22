const invModel = require('../models/inventory-model')
const utilities = require('../utilities/')

const invCont = {}

/* ****************************************
 *Build inventory by classification view
 * ************************************* */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationgrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render('inventory/classification', {
        title: className + ' vehicles',
        nav,
        grid,
    })
});

/* ****************************************
 *Build inventory detail view
 * ************************************* */
invCont.getVehicleById = utilities.handleErrors(async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.inventoryId)
        if (isNaN(inv_id)) {
            return res.status(400).send('Invalid vehicle ID');
        }

        const vehicle = await invModel.getVehicleById(inv_id)
        let nav = await utilities.getNav()

        if (!vehicle) {
            return res.status(404).send('Vehicle not found')
        }

        res.render('inventory/details', {
            title: `${vehicle.inv_make} ${vehicle.inv_model}`,
            nav,
            vehicle,
            formatCurrency: utilities.formatCurrency,
            formatNumber: utilities.formatNumber
        })
    } catch (error) {
        console.error('Error fetching vehicle details:', error);
        res.status(500).send('Internal Server Error');
    }
});

//Intentional Error (500 - trigger)
invCont.triggerIntentionalError = async function (req, res, next) {
    try {
        //Error Simulation
        throw new Error('Intentional error triggered- 500');
    } catch (error) {
        next(error);
    }
};

module.exports = invCont