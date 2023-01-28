require('dotenv').config();


const { query } = require('express');
const { Pool } = require('pg');

const config = {
  user: process.env.DB_user,
  password: process.env.DB_pass,
  host: process.env.DB_host,
  database: process.env.DB_data
}

const pool = new Pool(config)

const properties = require('./json/properties.json');
const users = require('./json/users.json');

pool.connect();

// pool.query('SELECT * FROM users LIMIT 5')
//   .then((user) => {
//     console.log(user.rows)
//   })

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// old function
// const getUserWithEmail = function(email) {
//   let user;
//   for (const userId in users) {
//     user = users[userId];
//     if (user.email.toLowerCase() === email.toLowerCase()) {
//       break;
//     } else {
//       user = null;
//     }
//   }
//   return Promise.resolve(user);
// }

// test email 1: allisonjackson@mail.com
//test email 2: tristanjacobs@gmail.com

const getUserWithEmail = function(email) {
  const text = `SELECT * FROM users WHERE users.email = $1`;
  const values = [`${email}`];

  return pool
    .query(text, values)
    .then((result) => {
      return result.rows[0];
    })
}

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// old function
// const getUserWithId = function(id) {
  // return Promise.resolve(users[id]);
// }

const getUserWithId = function(id) {
  const text = `SELECT * FROM users WHERE users.id = $1`;
  const values = [`${id}`];
  console.log(values)

  return pool
    .query(text, values)
    .then((result) => {
      console.log('result:', result)
      return result.rows[0]
    })
    // .then((result) => {
    //   conosole.log('query:', query)
    //   console.log('result:', result)
    //   return result.rows[0].id;
    // })
    .catch((err) => {
      console.log(err)
    })
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
// const addUser =  function(user) {
//   const userId = Object.keys(users).length + 1;
//   user.id = userId;
//   users[userId] = user;
//   return Promise.resolve(user);
// }

  const addUser = function(user) {
    const text = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
    const values = [`${user.name}`, `${user.email}`, `${user.password}`]

    return pool
      .query(text, values)
      .then((result) => {
        console.log(result.rows[0]);
        return result.rows[0];
      })
      .catch((err) => {
        console.log(err);
      })
  }
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
// const getAllReservations = function(guest_id, limit = 10) {
  // return getAllProperties(null, 2);
// }
// exports.getAllReservations = getAllReservations;

const getAllReservations = function(guest_id, limit = 10) {
  const text = `SELECT reservations.*, properties.*, AVG(property_reviews.rating) AS average_rating
  FROM reservations
  JOIN properties ON property_id = properties.id
  JOIN property_reviews ON reservation_id = reservations.id
  JOIN users ON users.id = reservations.guest_id
  WHERE users.id = $1
  GROUP BY reservations.id, properties.id
  ORDER BY start_date
  LIMIT $2;`
  const values = [`${guest_id}`, limit]

  return pool
    .query(text, values)
    .then((result) => { 
      console.log('result:', result.rows[0])
      return result.rows;
    })
    .catch((err) => {
      console.log(err);
    })
}

exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
// const getAllProperties = function(options, limit = 10) {
//   const limitedProperties = {};
//   for (let i = 1; i <= limit; i++) {
//     limitedProperties[i] = properties[i];
//   }
//   return Promise.resolve(limitedProperties);
// }
// exports.getAllProperties = getAllProperties;

// 
const getAllProperties = function(options, limit = 10) {

  const queryParams = [];

  let text = `SELECT properties.*, AVG(property_reviews.rating) AS average_rating 
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // show listings if an owner
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    text += `AND owner_id = $${queryParams.length}`;
  }

  // searching for a city
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    text += `WHERE city LIKE $${queryParams.length}`;
  }

  //search for a minimum price
  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`*100);
    text += `AND cost_per_night >= $${queryParams.length}`;
  }

  //search for maximum price
  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night}`*100);
    text += `AND cost_per_night <= $${queryParams.length}`;
  }
  
  //search for a particular rating
  if (options.minimum_rating) {
    queryParams.push(Number(`${options.minimum_rating}`));
    text += `AND property_reviews.rating >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  text += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

// why is limit always returning 20?

  console.log(text, queryParams);

  // const values = [limit];
  return pool
  .query(text, queryParams)
  .then((result) => {
    // console.log('results:', result.rows);
    return result.rows;
  })
  .catch((err) => {
      console.log(err.message);
  });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
