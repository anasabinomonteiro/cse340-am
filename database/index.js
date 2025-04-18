const { Pool } = require('pg')
require('dotenv').config()
/* **********************************************************************
* Connection Pool
* SSl Object needed for local testing of app
* But will cause problems in production environment
* If - else will make determination which to use
* ********************************************************************** */
let pool
if (process.env.NODE_ENV === 'development') {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    })

    // Added fr troubleshooting queries during development
    module.exports = {
        async query(text, params) {
            try {
                const res = await pool.query(text, params)
                console.log('executed query', { text })
                return res
            } catch (error) {
                console.error('Error in query', { text })
                throw error
            }
        },
    }
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: true,
        },
    })
    module.exports = pool
}
