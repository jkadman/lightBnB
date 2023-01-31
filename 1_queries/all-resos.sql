/*
Select the reservation id, property title, reservation start_date, property cost_per_night and the average rating of the property. You'll need data from both the reservations and properties tables.
The reservations will be for a single user, so just use 1 for the user_id.
Order the results from the earliest start_date to the most recent start_date.
Limit the results to 10.
*/
SELECT reservations.id as reso_id, properties.title as title, reservations.start_date as start_date, properties.cost_per_night as cost, AVG(property_reviews.rating) as rating
FROM properties
JOIN reservations ON property_id = properties.id
JOIN property_reviews ON reservation_id = reservations.id
JOIN users ON users.id = reservations.guest_id
WHERE users.id = 1
GROUP BY reservations.id, properties.id
ORDER BY start_date
LIMIT 10;