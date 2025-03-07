CREATE DATABASE pwyll;

\c pwyll

-- table creations

CREATE TABLE IF NOT EXISTS public.users (
	id serial4 NOT NULL,
	username text NOT NULL,
	secret text NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.commands (
	id serial4 NOT NULL,
	command text NOT NULL,
	description text NOT NULL,
	command_tsv tsvector NOT NULL,
	description_tsv tsvector NOT NULL,
	user_id int4 NOT NULL,
	stars int4 DEFAULT 0 NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	updated_at timestamp NOT NULL,
	CONSTRAINT commands_pkey PRIMARY KEY (id)
);

ALTER TABLE public.commands ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);

CREATE TABLE IF NOT EXISTS public.pwyll_meta (
	id serial4 NOT NULL,
	server_version text NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT pwyll_meta_pkey PRIMARY KEY (id)
);

INSERT INTO pwyll_meta (server_version) VALUES ('6.0.0');

-- function and triggers

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

CREATE TRIGGER trgr_create_tsvectors
BEFORE INSERT OR UPDATE
ON commands
FOR EACH ROW 
EXECUTE PROCEDURE fn_create_tsvectors();
