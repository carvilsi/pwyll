
export const userCreate = `
  INSERT INTO users (username, secret)
  VALUES ($1, $2)
  RETURNING id;
`;

export const userFindById = `
  SELECT 
    username, secret, created_at 
  FROM users 
  WHERE id = $1;
`;

export const userFindByName = `
  SELECT 
    id 
  FROM users 
  WHERE username = $1;
`;