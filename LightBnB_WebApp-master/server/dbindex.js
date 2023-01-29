const { Pool } = require('pg')
 
const config = {
  user: process.env.DB_user,
  password: process.env.DB_pass,
  host: process.env.DB_host,
  database: process.env.DB_data
}

const pool = new Pool(config)
 
// let text;
// let values;

// module.exports = {
//   query: (text, values) => {
//   return pool.query(text, values)
//   .then((result) => {
//     return result.rows
//   })
//   }
// }

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  },
}