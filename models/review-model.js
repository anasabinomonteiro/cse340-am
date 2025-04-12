const pool = require('../database/');

/* *****************************************************
*   Register new review
* **************************************************** */
async function addReview(review_text, inv_id, account_id) {
    try {
        const sql = `INSERT INTO review (review_text, inv_id, account_id) VALUES ($1, $2, $3) RETURNING *`
        const result = await pool.query(sql, [review_text, inv_id, account_id])
        return result.rows[0]
    } catch (error) {
        return { error: error.message }
    }
}

/* *****************************************************
*  Get reviews of a specific inventory itemreviewModel 
* **************************************************** */
async function getReviewsByInventoryId(inv_id) {
    try {
        const sql = `
        SELECT review.*, account.account_firstname, account.account_lastname 
        FROM review INNER JOIN account ON review.account_id = account.account_id
        WHERE inv_id = $1 
        ORDER BY review_date DESC
        `
        const result = await pool.query(sql, [inv_id])
        return result.rows || []
    } catch (error) {
        return { error: error.message }
    }
}

/* *****************************************************
*  Get reviews of a specific account (user)    
* **************************************************** */
async function getReviewsByAccountId(account_id) {
    try {
        const sql = `
        SELECT review.*, account.account_firstname, account.account_lastname 
        FROM review
        INNER JOIN account ON review.account_id = account.account_id 
        WHERE review.account_id = $1
        ORDER BY review.review_date DESC
        `
        const result = await pool.query(sql, [account_id])
        return result.rows || []
    } catch (error) {
        console.error("Error fetching reviews by account ID:", error.message)
        return { error: error.message }
    }
}

/* *****************************************************    
*  Get reviews of a specific review Id
* **************************************************** */
async function getReviewById(review_id) {
    try {
        const sql = `SELECT * FROM review WHERE review_id = $1`
        const result = await pool.query(sql, [review_id])
        return result.rows
    } catch (error) {
        return { error: error.message }
    }
}

/* *****************************************************    
*  Update review data
* **************************************************** */
async function updateReview(review_text, review_id) {
    try {
        const sql = `UPDATE review SET review_text = $1 WHERE review_id = $2 RETURNING *`
        const result = await pool.query(sql, [review_text, review_id])
        return result.rows[0] || null
    } catch (error) {
        return { error: error.message }
    }
}

/* *****************************************************
*  Delete review data   
* **************************************************** */
async function deleteReview(review_id) {
    try {
        const sql = `DELETE FROM review WHERE review_id = $1 RETURNING *`
        const result = await pool.query(sql, [review_id])
        return result.rows[0]
    } catch (error) {
        return { error: error.message }
    }
}

module.exports = { addReview, getReviewsByInventoryId, getReviewsByAccountId, getReviewById, updateReview, deleteReview }
