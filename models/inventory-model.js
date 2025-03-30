const pool = require('../database/');

/* ********************************************************************
 *  Get all classification data
*  *******************************************************************/
async function getClassifications() {
    return await pool.query('SELECT * FROM public.classification ORDER BY classification_name')
}

/* ********************************************************************
 *  Get all inventory items and classification_name by classification_id
*  *******************************************************************/
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
          JOIN public.classification AS c 
          ON i.classification_id = c.classification_id 
          WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}

/* ********************************************************************
 *  Get specific vehicle in inventory by inv_id
*  *******************************************************************/
async function getVehicleById(inv_id) {
    try {
        const result = await pool.query(
            `SELECT * FROM public.inventory 
          WHERE inv_id = $1`,
            [inv_id]
        );

        if (result.rows.length === 0) {
            return null; // No vehicle found with the given inv_id
        }
        return result.rows[0]
    } catch (error) {
        console.error("getVehicleById error:", error)
        return null;
    }
}

/* ********************************************************************
 *  Register a new classification
*  *******************************************************************/
async function addClassification(classification_name) {
    try {
        const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING classification_id`;
        const data = await pool.query(sql, [classification_name]);
        return data.rows[0].classification_id; // Return the new classification ID
    } catch (error) {
        console.error('Add classification error ' + error);
        return null;
    }
}

/* ********************************************************************
 *  Add a new inventory item
*  *******************************************************************/
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
    try {
        inv_year = inv_year.toString().padStart(4, '0');

        const sql = `INSERT INTO public.inventory 
        (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING inv_id`;

        const data = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        ]);
        return data.rows[0].inv_id;
    } catch (error) {
        console.error('Add inventory error ', error);
        return null;
    }
}
module.exports = { getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory };
