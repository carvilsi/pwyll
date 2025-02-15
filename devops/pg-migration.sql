SELECT * FROM commands;
DROP TABLE commands;

-- \c pwyllpoc;

CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	username TEXT,
	secret TEXT
);

-- DROP TABLE users ;


CREATE TABLE commands(
	id SERIAL PRIMARY KEY,
	command TEXT,
	description TEXT,
	command_tsv TSVECTOR,
	description_tsv TSVECTOR,
	user_id INT,
	CONSTRAINT fk_user_id FOREIGN KEY (user_id)
	REFERENCES users(id)
);

-- DROP TABLE commands ;

INSERT INTO users(username, secret) 
VALUES ('peter', '$argon2i$v=19$m=4096,t=3,p=1$c2FsdHRoaW5neQ$jvLtc2u6/AzavXlzxtmvSX9mgzTKYwXzaq6oQS/i1Ac');

SELECT * FROM users u ;

INSERT INTO commands (command, description, command_tsv, description_tsv, user_id) 
VALUES (
	'docker-compose up -d', 
	'docker start composition detached', 
	to_tsvector('docker-compose up -d'), 
	to_tsvector('english',  'docker start composition detached'),
	1
);

INSERT INTO commands (command, description, command_tsv, description_tsv, user_id) 
VALUES (
	'docker-compose up', 
	'docker start composition attached', 
	to_tsvector('docker-compose up'), 
	to_tsvector('english', 'docker start composition attached'),
	1
);

INSERT INTO commands (command, description, command_tsv, description_tsv, user_id) 
VALUES (
	'docker-compose up', 
	'arrancar docker connectado al container', 
	to_tsvector('docker-compose up'), 
	to_tsvector('spanish', 'arrancar docker connectado al container'),
	1
);

SELECT * FROM commands;

SELECT 
	command,
	description
FROM commands
WHERE commands.description_tsv @@ to_tsquery('english', 'docker & detached')
OR commands.command_tsv @@ to_tsquery('docker & detached');


SELECT 'docker & detached' AS query;

WITH query AS (SELECT 'dock:* & attac:*' AS query)
(
	SELECT 
		command,
		description
	FROM commands
	WHERE commands.description_tsv @@ to_tsquery('english', (SELECT * FROM query))
	OR commands.command_tsv @@ to_tsquery((SELECT * FROM query))
);



WITH query AS (SELECT 'dock:* & arrancad:*' AS query)
(
	SELECT 
		command,
		description
	FROM commands
	WHERE commands.description_tsv @@ to_tsquery('spanish', (SELECT * FROM query))
	OR commands.command_tsv @@ to_tsquery((SELECT * FROM query))
);




CREATE TABLE dates_stuff(
	dates DATE DEFAULT NOW(),
	timestamps TIMESTAMP DEFAULT NOW(),
	id SERIAL PRIMARY KEY
);

DROP TABLE dates_stuff ;

INSERT INTO dates_stuff (id) VALUES (1);

SELECT * FROM dates_stuff;

CREATE OR REPLACE FUNCTION fn_update_at_on_update()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
	BEGIN
		NEW.updated_at = current_timestamp;
		RETURN NEW;
    END;
$$;

CREATE TRIGGER trgr_update_at_on_update
BEFORE INSERT OR UPDATE
ON commands
FOR EACH ROW 
EXECUTE PROCEDURE fn_update_at_on_update();

DROP function fn_update_at_on_update() cascade;


SELECT * FROM commands;


UPDATE
	commands
SET description = 'this is a newer description'
WHERE commands.id = 10;


CREATE OR REPLACE FUNCTION fn_create_tsvectors()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS
$$
	BEGIN
		NEW.command_tsv = to_tsvector(NEW.command);
		NEW.description_tsv = to_tsvector(NEW.description);
		RETURN NEW;
    END;
$$;

CREATE TRIGGER trgrfn_create_tsvectors
BEFORE INSERT OR UPDATE
ON commands
FOR EACH ROW 
EXECUTE PROCEDURE fn_create_tsvectors();

DROP function fn_create_tsvectors() cascade;

INSERT INTO commands (command, description, user_id) 
VALUES ('ls -lh .', 'list current directory with details and human sizes', 2);

SELECT * FROM commands;

UPDATE commands c 
SET description = 'list current directory with details and hidden stuff'
WHERE c.id = 12;

SELECT * FROM users;


WITH query AS (SELECT 'dock:* & arrancad:*' AS query)
(
	SELECT 
		c.command,
		c.description,
		u.username
	FROM commands c, users u
	--INNER JOIN users u ON u.id = 2
	WHERE c.user_id = 1
	AND c.description_tsv @@ to_tsquery('spanish', (SELECT * FROM query))
	OR c.command_tsv @@ to_tsquery((SELECT * FROM query))
);




-- search command from any user
WITH query AS (SELECT 'l:*' AS query)
(
	SELECT
		c.command,
		c.description,
		u.username 
	FROM commands c 
	JOIN users u ON c.user_id = u.id
	WHERE c.description_tsv @@ to_tsquery('spanish', (SELECT * FROM query))
	OR c.command_tsv @@ to_tsquery((SELECT * FROM query))
);


-- search command for specific user
WITH query AS (SELECT 'l:*' AS query)
(
	SELECT
		c.command,
		c.description,
		u.username 
	FROM commands c 
	JOIN users u ON c.user_id = u.id
	WHERE c.description_tsv @@ to_tsquery('l:*')
	AND u.id = 2
);