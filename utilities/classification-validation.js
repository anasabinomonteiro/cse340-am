const { body, validationResult } = require("express-validator")
const validateClassification = {}

/* ******************************************
 * Validation Rules for Classification data
 * *************************************** */
validateClassification.addClassificationRules = [
    // classification name is required and must be string
    body("classification_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please, provide a classification name.")
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage("The classification name cannot contain spaces or special characters.")
];

/* ******************************************
 * Check data classification and handle errors
 * *************************************** */
validateClassification.checkAddClassificationData = async (req, res, next) => {
    try {
        const { classification_name } = req.body
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            let nav = await utilities.getNav()
            return res.render("inventory/add-classification", {
                title: "Add Classification",
                nav,
                errors: errors.array(),
                classification_name,
            });
        }
        console.log('Classification successfully! Calling next()..');
        return next();
    } catch (error) {
        console.error("Error in checkAddClassificationData:", error);
        return res.status(500).send("Internal Server Error");
    }
};

module.exports = validateClassification