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

    // Add Classification List
    const classificationSelect = await utilities.buildClassificationList();

    res.render('inventory/management', {
        title: 'Inventory Management',
        nav,
        classificationSelect,
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

/* ****************************************
 *Controller for adding new classification  
 ***************************************** */
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
 *Controller for adding new inventory
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
}

/* ****************************************
 * Inventory management view
 * ************************************* */
invCont.buildInventoryManagement = async function (req, res, next) {
    let nav = await utilities.getNav()

    const classificationSelect = await utilities.buildClassificationList();

    res.render('inventory/management', {
        title: 'Inventory Management',
        nav,
        classificationSelect,
        messages: req.flash()
    })
}

/* ****************************************
 *  Add Inventory JSON data
 *  This function returns the inventory data in JSON format based on the classification_id
 * ************************************* */
invCont.getInventoryJSON = async function (req, res, next) {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (!invData || invData.length === 0) {
        return res.status(404).json({ message: 'No inventory found for this classification.' })
    } else {
        return res.json(invData);
    }
}

/* ****************************************
 *  Build Edit Inventory view
 * ************************************* */
invCont.buildEditInventory = async function (req, res, next) {
    const inv_id = parseInt(req.params.inventoryId)
    let nav = await utilities.getNav()
    const vehicle = await invModel.getVehicleById(inv_id)
    const classificationList = await utilities.buildClassificationList(vehicle.classification_id)
    const vehicleName = `${vehicle.inv_make} ${vehicle.inv_model}`
    res.render('./inventory/edit-inventory', {
        title: 'Edit' + vehicleName,
        nav,
        classificationList: classificationList,
        errors: null,
        inv_id: vehicle.inv_id,
        inv_make: vehicle.inv_make,
        inv_model: vehicle.inv_model,
        inv_year: vehicle.inv_year,
        inv_description: vehicle.inv_description,
        inv_image: vehicle.inv_image,
        inv_thumbnail: vehicle.inv_thumbnail,
        inv_price: vehicle.inv_price,
        inv_miles: vehicle.inv_miles,
        inv_color: vehicle.inv_color,
        classification_id: vehicle.classification_id
    })
}

/* ****************************************
 * Update Inventory Data
 * ************************************* */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

    const updateResult = await invModel.updateInventory(
        inv_id,
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

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("success", `The ${itemName} was successfully updated.`)
        res.redirect('/inv/');
    } else {
        const classificationList = await utilities.buildClassificationList(classification_id)
        const vehicleName = `${inv_make} ${inv_model}`
        req.flash("error", 'Sorry, the insert failed.')
        res.status(501).render('inventory/edit-inventory', {
            title: 'Edit ' + vehicleName,
            nav,
            classificationList: classificationList,
            errors: null,
            inv_id,
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
        })
    }
}

/* ****************************************
 * Build Delete Inventory Data View
 * ************************************* */
invCont.buildDeleteInventory = async function (req, res, next) {
    const inv_id = parseInt(req.params.inventoryId)
    let nav = await utilities.getNav()

    try {
        const itemData = await invModel.getVehicleById(inv_id)
        const vehicleName = `${itemData.inv_make} ${itemData.inv_model}`

        res.render('./inventory/delete-confirm', {
            title: 'Delete ' + vehicleName,
            nav,
            errors: null,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_price: itemData.inv_price,
        })
    } catch (error) {
        console.error('Error building delete view:', error);
        req.flash("error", 'Sorry, the vehicle could not be found.');
        res.redirect('/inv/');
    }
}

/* ****************************************
 * Delete Inventory Data
 * ************************************* */
invCont.deleteInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const inv_id = parseInt(req.body.inv_id)

    try {
        const deleteResult = await invModel.deleteInventory(inv_id)

        if (deleteResult) {
            req.flash("success", 'The inventory item was successfully deleted.')
            res.redirect('/inv/');
        } else {
            req.flash("error", 'Sorry, the delete failed.')
            res.redirect(`/inv/delete-confirm/${inv_id}`) // redirect to confirmation page
        }
    } catch (error) {
        next(error)
    }
}

module.exports = invCont