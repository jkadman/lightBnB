/*
Select the id, title, cost_per_night, and an average_rating from the properties table for properties located in Vancouver.
Order the results from lowest cost_per_night to highest cost_per_night.
Limit the number of results to 10.
Only show listings that have a rating >= 4 stars.
*/

SELECT properties.id AS id, properties.title as title, properties.cost_per_night as price, AVG(property_reviews.rating) as rating
FROM properties
JOIN property_reviews ON property_id = properties.id
WHERE properties.city LIKE '%Vancouver%'
GROUP BY properties.id
HAVING AVG(rating) >= 4
ORDER BY price 
LIMIT 10 