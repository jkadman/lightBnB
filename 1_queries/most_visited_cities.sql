/*
Select the name of the city and the number of reservations for that city.
Order the results from highest number of reservations to lowest number of reservations.
*/

SELECT properties.city as city, COUNT(reservations.id) as reservations
FROM properties
JOIN reservations ON property_id = properties.id
GROUP BY properties.city
ORDER BY reservations DESC;