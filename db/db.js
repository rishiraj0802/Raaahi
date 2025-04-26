const { Client } = require('pg');
const nconf = require('nconf')
nconf.env();
const password = nconf.get('DB_PASSWORD')
// Function to initialize the database and tables
async function initializeDB(ip) {
  // PostgreSQL connection configuration
  const client = new Client({
    host: ip,                   
    port: 5432,                 
    user: 'postgres',           
    password: password,        
    database: 'postgres'        
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    await client.query(`
SELECT 1 FROM pg_database WHERE datname = 'mydb';
`).then(async (res) => {
      if (res.rowCount === 0) {
        console.log('Database "mydb" not found. Creating the database...');
        await client.query('CREATE DATABASE mydb;');
      }
      console.log('Database "mydb" is ready.');
    });

    await client.end();
    const dbClient = new Client({
      host: ip,
      port: 5432,
      user: 'postgres',
      password: password,
      database: 'mydb'  
    });

    await dbClient.connect();
    console.log('Connected to "mydb" database');

    await dbClient.query(`
CREATE TABLE IF NOT EXISTS users (
id SERIAL PRIMARY KEY,
name VARCHAR(100),
username VARCHAR(100) UNIQUE,
password_hash VARCHAR(255),
gender VARCHAR(10)
);
`);
    console.log('Table "users" is ready.');

    await dbClient.query(`
CREATE TABLE IF NOT EXISTS rasta (
queryID SERIAL PRIMARY KEY,
search_id INTEGER,
timeofArrival TIMESTAMP NOT NULL,
lat_lon DOUBLE PRECISION[],
assigned_cell VARCHAR(100),
fellowraahi INTEGER,
FOREIGN KEY (search_id) REFERENCES users(id),
FOREIGN KEY (fellowraahi) REFERENCES users(id)
);
`);
    console.log('Table "rasta" is ready.');

    await dbClient.end();
    console.log('Database initialization complete.');

  } catch (err) {
    console.error('Error during DB initialization:', err.stack);
  }
}
const addDummyUsers = async(ip)=>{

  const dbClient = new Client({
    host: ip,
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'mydb'  
  });

  const query=`INSERT INTO users(id,name,username,password_hash,gender) values (1,'Rishav Raj','rishavD','$2a$10$Abvd1Ps2VHjaA3PrILY5COs6PGavVSVXvad4vc35xiFKxMQef5bOS', 'Female'),('2','Suman Mandal', 'mondal','$2a$10$Tqp7idi8ax8uQzUihZbIy.mNacowv91HPkmWI.PH.IFIbrO.PxnM.', 'Other');`;
  try{
    await dbClient.connect();
    console.log('Connected to "mydb" database');
    await dbClient.query(query)
    await dbClient.end();
    console.log("Dummy Users inserted into the database")
  }
  catch(err){
    console.log(`Error: ${err} during adding users!`)
  }
}
module.exports = { initializeDB, addDummyUsers};

