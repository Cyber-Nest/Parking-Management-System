require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parksmart',
  });
  const [rows] = await c.query(
    `SELECT a.id, a.email, a.full_name, a.is_active, r.name AS role
     FROM admins a
     LEFT JOIN roles r ON r.id = a.role_id
     WHERE a.email IN ('admin@parksmart.com', 'owner@sample.parksmart.test')
        OR (a.is_active = 1 AND a.email LIKE 'admin1@%')
     ORDER BY a.email
     LIMIT 15`,
  );
  console.log(JSON.stringify(rows, null, 2));
  await c.end();
})();
