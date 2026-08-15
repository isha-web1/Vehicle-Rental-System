import { Pool } from "pg";
import config from ".";

//DB
export const pool = new Pool({
  connectionString: `${config.connection_str}`,
});

const initDB = async () => {
  await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL CHECK (email = LOWER(email)),
    password TEXT NOT NULL CHECK (LENGTH(password) >= 6),
    phone VARCHAR(15) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer'))
  )
`);

  
};

export default initDB;