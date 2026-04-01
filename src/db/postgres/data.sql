-- Initial data for the PostgreSQL PetClinic database
-- This script contains idempotent inserts, meaning it can be run multiple times
-- without creating duplicate entries if an entry with the same ID or identifying
-- characteristic (like name for specialties/types) already exists.

-- Insert into vets table
INSERT INTO vets (first_name, last_name) SELECT 'James', 'Carter' WHERE NOT EXISTS (SELECT 1 FROM vets WHERE first_name='James' AND last_name='Carter');
INSERT INTO vets (first_name, last_name) SELECT 'Helen', 'Leary' WHERE NOT EXISTS (SELECT 1 FROM vets WHERE first_name='Helen' AND last_name='Leary');
INSERT INTO vets (first_name, last_name) SELECT 'Linda', 'Douglas' WHERE NOT EXISTS (SELECT 1 FROM vets WHERE first_name='Linda' AND last_name='Douglas');
INSERT INTO vets (first_name, last_name) SELECT 'Rafael', 'Ortega' WHERE NOT EXISTS (SELECT 1 FROM vets WHERE first_name='Rafael' AND last_name='Ortega');
INSERT INTO vets (first_name, last_name) SELECT 'Henry', 'Stevens' WHERE NOT EXISTS (SELECT 1 FROM vets WHERE first_name='Henry' AND last_name='Stevens');
INSERT INTO vets (first_name, last_name) SELECT 'Sharon', 'Jenkins' WHERE NOT EXISTS (SELECT 1 FROM vets WHERE first_name='Sharon' AND last_name='Jenkins');

-- Insert into specialties table
INSERT INTO specialties (name) SELECT 'radiology' WHERE NOT EXISTS (SELECT 1 FROM specialties WHERE name='radiology');
INSERT INTO specialties (name) SELECT 'surgery' WHERE NOT EXISTS (SELECT 1 FROM specialties WHERE name='surgery');
INSERT INTO specialties (name) SELECT 'dentistry' WHERE NOT EXISTS (SELECT 1 FROM specialties WHERE name='dentistry');

-- Insert into vet_specialties table (junction table)
-- Use ON CONFLICT DO NOTHING to handle idempotency for the junction table.
INSERT INTO vet_specialties (vet_id, specialty_id)
SELECT v.id, s.id
FROM vets v, specialties s
WHERE v.first_name = 'Helen' AND v.last_name = 'Leary' AND s.name = 'radiology'
ON CONFLICT (vet_id, specialty_id) DO NOTHING;

INSERT INTO vet_specialties (vet_id, specialty_id)
SELECT v.id, s.id
FROM vets v, specialties s
WHERE v.first_name = 'Linda' AND v.last_name = 'Douglas' AND s.name = 'surgery'
ON CONFLICT (vet_id, specialty_id) DO NOTHING;

INSERT INTO vet_specialties (vet_id, specialty_id)
SELECT v.id, s.id
FROM vets v, specialties s
WHERE v.first_name = 'Linda' AND v.last_name = 'Douglas' AND s.name = 'dentistry'
ON CONFLICT (vet_id, specialty_id) DO NOTHING;

INSERT INTO vet_specialties (vet_id, specialty_id)
SELECT v.id, s.id
FROM vets v, specialties s
WHERE v.first_name = 'Rafael' AND v.last_name = 'Ortega' AND s.name = 'surgery'
ON CONFLICT (vet_id, specialty_id) DO NOTHING;

INSERT INTO vet_specialties (vet_id, specialty_id)
SELECT v.id, s.id
FROM vets v, specialties s
WHERE v.first_name = 'Henry' AND v.last_name = 'Stevens' AND s.name = 'radiology'
ON CONFLICT (vet_id, specialty_id) DO NOTHING;

-- Insert into types table
INSERT INTO types (name) SELECT 'cat' WHERE NOT EXISTS (SELECT 1 FROM types WHERE name='cat');
INSERT INTO types (name) SELECT 'dog' WHERE NOT EXISTS (SELECT 1 FROM types WHERE name='dog');
INSERT INTO types (name) SELECT 'lizard' WHERE NOT EXISTS (SELECT 1 FROM types WHERE name='lizard');
INSERT INTO types (name) SELECT 'snake' WHERE NOT EXISTS (SELECT 1 FROM types WHERE name='snake');
INSERT INTO types (name) SELECT 'bird' WHERE NOT EXISTS (SELECT 1 FROM types WHERE name='bird');
INSERT INTO types (name) SELECT 'hamster' WHERE NOT EXISTS (SELECT 1 FROM types WHERE name='hamster');

-- Insert into owners table
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'George', 'Franklin', '110 W. Liberty St.', 'Madison', '6085551023' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='George' AND last_name='Franklin');
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'Betty', 'Davis', '638 Cardinal Ave.', 'Sun Prairie', '6085551749' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='Betty' AND last_name='Davis');
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'Eduardo', 'Rodriquez', '2693 Commerce St.', 'McFarland', '6085558763' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='Eduardo' AND last_name='Rodriquez');
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'Harold', 'Davis', '563 Friendly St.', 'Windsor', '6085553198' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='Harold' AND last_name='Davis');
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'Peter', 'McTavish', '2387 S. Fair Way', 'Madison', '6085552765' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='Peter' AND last_name='McTavish');
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'Jean', 'Coleman', '105 N. Lake St.', 'Monona', '6085552654' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='Jean' AND last_name='Coleman');
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'Jeff', 'Black', '1450 Oak Blvd.', 'Monona', '6085555387' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='Jeff' AND last_name='Black');
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'Maria', 'Escobito', '345 Maple St.', 'Madison', '6085557683' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='Maria' AND last_name='Escobito');
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'David', 'Schroeder', '2749 Blackhawk Trail', 'Madison', '6085559435' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='David' AND last_name='Schroeder');
INSERT INTO owners (first_name, last_name, address, city, telephone) SELECT 'Carlos', 'Estaban', '2335 Independence La.', 'Waunakee', '6085555487' WHERE NOT EXISTS (SELECT 1 FROM owners WHERE first_name='Carlos' AND last_name='Estaban');

-- Insert into pets table
-- Use subqueries to get dynamic IDs for type and owner, making inserts robust against ID changes.
INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Leo', '2000-09-07', (SELECT id FROM types WHERE name='cat'), (SELECT id FROM owners WHERE first_name='George' AND last_name='Franklin')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Leo' AND birth_date='2000-09-07' AND owner_id=(SELECT id FROM owners WHERE first_name='George' AND last_name='Franklin'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Basil', '2002-08-06', (SELECT id FROM types WHERE name='hamster'), (SELECT id FROM owners WHERE first_name='Betty' AND last_name='Davis')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Basil' AND birth_date='2002-08-06' AND owner_id=(SELECT id FROM owners WHERE first_name='Betty' AND last_name='Davis'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Rosy', '2001-04-17', (SELECT id FROM types WHERE name='dog'), (SELECT id FROM owners WHERE first_name='Eduardo' AND last_name='Rodriquez')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Rosy' AND birth_date='2001-04-17' AND owner_id=(SELECT id FROM owners WHERE first_name='Eduardo' AND last_name='Rodriquez'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Jewel', '2000-03-07', (SELECT id FROM types WHERE name='dog'), (SELECT id FROM owners WHERE first_name='Eduardo' AND last_name='Rodriquez')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Jewel' AND birth_date='2000-03-07' AND owner_id=(SELECT id FROM owners WHERE first_name='Eduardo' AND last_name='Rodriquez'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Iggy', '2000-11-30', (SELECT id FROM types WHERE name='lizard'), (SELECT id FROM owners WHERE first_name='Harold' AND last_name='Davis')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Iggy' AND birth_date='2000-11-30' AND owner_id=(SELECT id FROM owners WHERE first_name='Harold' AND last_name='Davis'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'George', '2000-01-20', (SELECT id FROM types WHERE name='snake'), (SELECT id FROM owners WHERE first_name='Peter' AND last_name='McTavish')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='George' AND birth_date='2000-01-20' AND owner_id=(SELECT id FROM owners WHERE first_name='Peter' AND last_name='McTavish'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Samantha', '1995-09-04', (SELECT id FROM types WHERE name='cat'), (SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Samantha' AND birth_date='1995-09-04' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Max', '1995-09-04', (SELECT id FROM types WHERE name='cat'), (SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Max' AND birth_date='1995-09-04' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Lucky', '1999-08-06', (SELECT id FROM types WHERE name='bird'), (SELECT id FROM owners WHERE first_name='Jeff' AND last_name='Black')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Lucky' AND birth_date='1999-08-06' AND owner_id=(SELECT id FROM owners WHERE first_name='Jeff' AND last_name='Black'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Mulligan', '1997-02-24', (SELECT id FROM types WHERE name='dog'), (SELECT id FROM owners WHERE first_name='Maria' AND last_name='Escobito')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Mulligan' AND birth_date='1997-02-24' AND owner_id=(SELECT id FROM owners WHERE first_name='Maria' AND last_name='Escobito'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Freddy', '2000-03-09', (SELECT id FROM types WHERE name='bird'), (SELECT id FROM owners WHERE first_name='David' AND last_name='Schroeder')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Freddy' AND birth_date='2000-03-09' AND owner_id=(SELECT id FROM owners WHERE first_name='David' AND last_name='Schroeder'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Lucky', '2000-06-24', (SELECT id FROM types WHERE name='dog'), (SELECT id FROM owners WHERE first_name='Carlos' AND last_name='Estaban')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Lucky' AND birth_date='2000-06-24' AND owner_id=(SELECT id FROM owners WHERE first_name='Carlos' AND last_name='Estaban'));

INSERT INTO pets (name, birth_date, type_id, owner_id)
SELECT 'Sly', '2002-06-08', (SELECT id FROM types WHERE name='cat'), (SELECT id FROM owners WHERE first_name='Carlos' AND last_name='Estaban')
WHERE NOT EXISTS (SELECT 1 FROM pets WHERE name='Sly' AND birth_date='2002-06-08' AND owner_id=(SELECT id FROM owners WHERE first_name='Carlos' AND last_name='Estaban'));

-- Insert into visits table
INSERT INTO visits (pet_id, visit_date, description)
SELECT (SELECT id FROM pets WHERE name='Samantha' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')), '2010-03-04', 'rabies shot'
WHERE NOT EXISTS (SELECT 1 FROM visits WHERE pet_id=(SELECT id FROM pets WHERE name='Samantha' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')) AND visit_date='2010-03-04' AND description='rabies shot');

INSERT INTO visits (pet_id, visit_date, description)
SELECT (SELECT id FROM pets WHERE name='Max' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')), '2011-03-04', 'rabies shot'
WHERE NOT EXISTS (SELECT 1 FROM visits WHERE pet_id=(SELECT id FROM pets WHERE name='Max' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')) AND visit_date='2011-03-04' AND description='rabies shot');

INSERT INTO visits (pet_id, visit_date, description)
SELECT (SELECT id FROM pets WHERE name='Max' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')), '2009-06-04', 'neutered'
WHERE NOT EXISTS (SELECT 1 FROM visits WHERE pet_id=(SELECT id FROM pets WHERE name='Max' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')) AND visit_date='2009-06-04' AND description='neutered');

INSERT INTO visits (pet_id, visit_date, description)
SELECT (SELECT id FROM pets WHERE name='Samantha' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')), '2008-09-04', 'spayed'
WHERE NOT EXISTS (SELECT 1 FROM visits WHERE pet_id=(SELECT id FROM pets WHERE name='Samantha' AND owner_id=(SELECT id FROM owners WHERE first_name='Jean' AND last_name='Coleman')) AND visit_date='2008-09-04' AND description='spayed');
