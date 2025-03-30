const e = require("connect-flash");
const { body, validationResult } = require("express-validator")
const utilities = require("../utilities")
const validateInventory = {}

/* ******************************************
 * Validation Rules for Inventory data
 * *************************************** */
validateInventory.addInventoryRules = () => {
    return [
        // Make is required and should be a string
        body("inv_make")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a make.")
            .isAlpha()
            .withMessage("Make should only contain letters."),

        // Model is required and should be a string
        body("inv_model")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a model."),

        //Year must be a valid year             
        body("inv_year")
            .trim()
            .isLength({ min: 4, max: 4 })
            .withMessage("Year must be 4 digits.")
            .matches(/^\d{4}$/)
            .withMessage("Year must be a number.")
            .isInt({ min: 1900, max: new Date().getFullYear() })
            .withMessage("Year must be between 1900 and the current year."),

        // Description is required and should be a string
        body("inv_description")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a description."),

        // Image is required and should be a string
        body("inv_image")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide an image URL."),

        // Thumbnail is required and should be a string
        body("inv_thumbnail")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a thumbnail URL."),

        // Price must be a positive number
        body("inv_price")
            .isInt({ gt: 0 })
            .withMessage("Please provide a price.")
            .custom((value) => {
                if (value <= 0) {
                    throw new Error("Price must be a positive number.");
                }
                return true;
            }),

        //Miles mus be a number
        body("inv_miles")
            .isInt()
            .withMessage("Miles must be a number."),

        //Color is required and should be a string
        body("inv_color")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Please provide a color.")
            .isAlpha()
            .withMessage("Color should only contain letters.")
    ];
}

/* ******************************************
 * Check data inventory and handle errors
 * *************************************** */
validateInventory.checkAddInventoryData = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            let nav = await utilities.getNav()
            let classificationList = await utilities.buildClassificationList(req.body.classification_id)

            return res.render("inventory/add-inventory", {
                title: "Add Inventory",
                nav,
                classificationList,
                errors: errors.array(),
                messages: { error: "Please correct the errors below and try again." },
                locals: req.body, // Pass the original input back to the form
            });
        }
        return next();
    } catch (error) {
        console.error("Error in checkAddInventoryData:", error);
        return res.status(500).send("Internal Server Error");
    }
};

module.exports = validateInventory