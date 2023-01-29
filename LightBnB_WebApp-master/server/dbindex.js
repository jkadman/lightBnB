const { Pool } = require('pg')
 
const pool = new Pool()
 
module.exports = {
  query: (text, values)
  .then((result) => {
    return pool.query(text, values);
  })
}