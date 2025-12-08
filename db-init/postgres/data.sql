-- Initial data for 'specialties' table
INSERT INTO specialties (name) VALUES
('radiology'),
('surgery'),
('dentistry')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Initial data for 'vets' table
INSERT INTO vets (id, "firstName", "lastName") VALUES
(1, 'James', 'Carter'),
(2, 'Helen', 'Leary'),
(3, 'Linda', 'Douglas'),
(4, 'Rafael', 'Ortega'),
(5, 'Henry', 'Stevens'),
(6, 'Sharon', 'Jenkins')
ON CONFLICT (id) DO UPDATE SET "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName";

-- Initial data for 'vet_specialties' table
INSERT INTO vet_specialties (vet_id, specialty_id) VALUES
(2, (SELECT id FROM specialties WHERE name = 'radiology')),
(3, (SELECT id FROM specialties WHERE name = 'surgery')),
(3, (SELECT id FROM specialties WHERE name = 'dentistry')),
(4, (SELECT id FROM specialties WHERE name = 'surgery')),
(5, (SELECT id FROM specialties WHERE name = 'radiology'))
ON CONFLICT (vet_id, specialty_id) DO NOTHING;

-- Initial data for 'types' table
INSERT INTO types (name) VALUES
('cat'),
('dog'),
('lizard'),
('snake'),
('bird'),
('hamster')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;


-- Initial data for 'owners' table
-- NOTE: PostgreSQL requires explicit ID if sequence is already advanced.
-- For a fresh DB, these IDs might conflict if not handled.
-- A better way is to omit ID and let SERIAL generate it.
-- For demo, assume IDs might be managed or table is empty before inserts.
-- The ON CONFLICT clause handles cases where these IDs might already exist
-- which is useful for idempotent seeding.
INSERT INTO owners (id, "firstName", "lastName", address, city, telephone) VALUES
(1, 'George', 'Franklin', '110 W. Liberty St.', 'Madison', '6085551023'),
(2, 'Betty', 'Davis', '638 Cardinal Ave.', 'Sun Prairie', '6085551749'),
(3, 'Eduardo', 'Rodriquez', '2693 Commerce St.', 'McFarland', '6085558763'),
(4, 'Harold', 'Davis', '563 Friendly St.', 'Windsor', '6085553198'),
(5, 'Peter', 'McTavish', '2387 S. Fair Way', 'Madison', '6085552765'),
(6, 'Jean', 'Coleman', '105 N. Lake St.', 'Monona', '6085552654'),
(7, 'Jeff', 'Black', '1450 Oak Blvd.', 'Monona', '6085555387'),
(8, 'Maria', 'Escobito', '345 Maple St.', 'Madison', '6085557683'),
(9, 'David', 'Schroeder', '2749 Blackhawk Trail', 'Madison', '6085559435'),
(10, 'Carlos', 'Estaban', '2335 Independence La.', 'Waunakee', '6085555487')
ON CONFLICT (id) DO UPDATE SET
  "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName",
  address = EXCLUDED.address, city = EXCLUDED.city, telephone = EXCLUDED.telephone;

-- Adjust sequence to ensure future inserts get correct IDs
SELECT setval('owners_id_seq', (SELECT MAX(id) FROM owners));


-- Initial data for 'pets' table
INSERT INTO pets (id, name, birth_date, type_id, owner_id) VALUES
(1, 'Leo', '2000-09-07', (SELECT id FROM types WHERE name = 'cat'), 1),
(2, 'Basil', '2002-08-06', (SELECT id FROM types WHERE name = 'hamster'), 2),
(3, 'Rosy', '2001-04-17', (SELECT id FROM types WHERE name = 'dog'), 3),
(4, 'Jewel', '2000-03-07', (SELECT id FROM types WHERE name = 'dog'), 3),
(5, 'Iggy', '2000-11-30', (SELECT id FROM types WHERE name = 'lizard'), 4),
(6, 'George', '2000-01-20', (SELECT id FROM types WHERE name = 'snake'), 5),
(7, 'Samantha', '1995-09-04', (SELECT id FROM types WHERE name = 'cat'), 6),
(8, 'Max', '1995-09-04', (SELECT id FROM types WHERE name = 'cat'), 6),
(9, 'Lucky', '1999-08-06', (SELECT id FROM types WHERE name = 'bird'), 7),
(10, 'Mulligan', '1997-02-24', (SELECT id FROM types WHERE name = 'dog'), 8),
(11, 'Freddy', '2000-03-09', (SELECT id FROM types WHERE name = 'bird'), 9),
(12, 'Lucky', '2000-06-24', (SELECT id FROM types WHERE name = 'dog'), 10),
(13, 'Sly', '2002-06-08', (SELECT id FROM types WHERE name = 'cat'), 10)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, birth_date = EXCLUDED.birth_date,
  type_id = EXCLUDED.type_id, owner_id = EXCLUDED.owner_id;

SELECT setval('pets_id_seq', (SELECT MAX(id) FROM pets));


-- Initial data for 'visits' table
INSERT INTO visits (id, date, description, pet_id) VALUES
(1, '2010-03-04', 'rabies shot', 7),
(2, '2011-03-04', 'rabies shot', 8),
(3, '2009-06-04', 'neutered', 8),
(4, '2008-09-04', 'spayed', 7)
ON CONFLICT (id) DO UPDATE SET
  date = EXCLUDED.date, description = EXCLUDED.description, pet_id = EXCLUDED.pet_id;

SELECT setval('visits_id_seq', (SELECT MAX(id) FROM visits));

