export const userCreate = `
  INSERT INTO users (username, secret)
  VALUES ($1, $2)
  RETURNING id;
`;

export const userFindById = `
  SELECT 
    username, secret, id 
  FROM users 
  WHERE id = $1;
`;

export const userFindByName = `
  SELECT 
    id 
  FROM users 
  WHERE username = $1;
`;

export const snippetCreate = `
  INSERT INTO commands (command, description, user_id) 
  VALUES ($1, $2, $3)
  RETURNING id;
`;

export const snippetFindAnyUser = `
  SELECT
    c.id,
		c.command,
		c.description,
		u.username 
	FROM commands c 
	JOIN users u ON c.user_id = u.id
	WHERE c.description_tsv @@ to_tsquery($1)
	OR c.command_tsv @@ to_tsquery($1)
  LIMIT $2;
`;

export const snippetFindById = `
  SELECT
    c.id,
		c.command,
		c.description,
		u.username,
    u.id AS "userId"
	FROM commands c 
	JOIN users u ON c.user_id = u.id
  WHERE c.id = $1;
`;

export const snippetFindForUser = `
  SELECT
    c.id,
		c.command,
		c.description,
		u.username 
	FROM commands c 
	JOIN users u ON c.user_id = u.id
	WHERE (
    c.description_tsv @@ to_tsquery($1)
	  OR c.command_tsv @@ to_tsquery($1)
  )
  AND u.id = $2
  LIMIT $3;
`;

export const allSnippetsForUser = `
  SELECT
  	c.id,
  	c.command,
  	c.description,
  	c.stars,
  	c.created_at,
  	c.updated_at
  FROM commands c
  WHERE c.user_id = $1;
`;

export const snippetDelete = `
  DELETE FROM commands 
  WHERE id = $1;
`;

export const snippetUpdate = `
  UPDATE commands
  SET 
    command = $1, 
    description = $2
  WHERE id = $3;
`;
