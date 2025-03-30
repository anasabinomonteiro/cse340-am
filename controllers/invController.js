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

/* ****************************************
 *Intentional Error (500 - trigger)
 * ************************************* */
invCont.triggerIntentionalError = async function (req, res, next) {
    try {
        //Error Simulation
        throw new Error('Intentional error triggered- 500');
    } catch (error) {
        next(error);
    }
};

/* ****************************************
 *Inventory management view
 * ************************************* */
invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render('inventory/management', {
        title: 'Inventory Management',
        nav,
        messages: req.flash()
    });
}

/* ****************************************
 *Add Classification view
 * ************************************* */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render('inventory/add-classification', {
        title: 'Add Classification',
        nav
    });
}

/* ****************************************
 *Add Inventory (Vehicle) view
 * ************************************* */
invCont.buildAddInventory = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList();
        res.render('inventory/add-inventory', {
            title: 'Add Inventory',
            nav,
            classificationList,
            messages: req.flash(),
        });
    } catch (error) {
        console.error('Error building Add Inventory page:', error);
        res.status(500).send('Internal Server Error');
    }
};

invCont.addClassification = async function (req, res, next) {
    const { classification_name } = req.body

    const regResult = await invModel.addClassification(classification_name)
    if (regResult) {
        req.flash("success", "Classification added successfully.")
        let nav = await utilities.getNav()
        res.render('inventory/management', {
            title: 'Inventory Management',
            nav,
            messages: req.flash()
        });
    } else {
        req.flash("error", "Sorry, there was an error processing the classification.")
        res.redirect('inventory/add-classification');
    }
}

/* ****************************************
 *Controller for adding inventory (vehicle)
 * ************************************* */
invCont.addInventory = async function (req, res, next) {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

    try {
        const addResult = await invModel.addInventory(
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        );

        if (addResult) {
            req.flash("success", "Vehicle added successfully.")
            res.redirect('/inv/');
        } else {
            req.flash("error", "Sorry, there was an error adding the vehicle. Please try again.");
            res.redirect('/inv/add-inventory');
        }
    } catch (error) {
        console.error('Error adding vehicle:', error);
        req.flash("error", "Internal server error.");
        res.redirect('/inv/add-inventory');
    }
};

module.exports = invCont