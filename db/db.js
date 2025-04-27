const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const nconf = require('nconf')
nconf.env()
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
  })

  try {
    await client.connect()
    console.log('Connected to PostgreSQL server')

    await client.query(`
SELECT 1 FROM pg_database WHERE datname = 'mydb'
`).then(async (res) => {
      if (res.rowCount === 0) {
        console.log('Database "mydb" not found. Creating the database...')
        await client.query('CREATE DATABASE mydb')
      }
      console.log('Database "mydb" is ready.')
    })

    await client.end()
    const dbClient = new Client({
      host: ip,
      port: 5432,
      user: 'postgres',
      password: password,
      database: 'mydb'  
    })

    await dbClient.connect()
    console.log('Connected to "mydb" database')

    await dbClient.query(`
CREATE TABLE IF NOT EXISTS users (
id SERIAL PRIMARY KEY,
name VARCHAR(100),
username VARCHAR(100) UNIQUE,
password_hash VARCHAR(255),
gender VARCHAR(10)
)
`)
    console.log('Table "users" is ready.')

    await dbClient.query(`
CREATE TABLE IF NOT EXISTS rasta (
queryID SERIAL PRIMARY KEY,
search_id INTEGER,
timeofArrival TIMESTAMP NOT NULL,
lat DOUBLE PRECISION,
lon DOUBLE PRECISION,
assigned_cell VARCHAR(100),
fellowraahi INTEGER,
FOREIGN KEY (search_id) REFERENCES users(id),
FOREIGN KEY (fellowraahi) REFERENCES users(id)
)
`)
    console.log('Table "rasta" is ready.')

    await dbClient.query(`CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    user_id UUID NOT NULL,                                  
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),          
    expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '2 hours', 
    ip_address TEXT,                                        
    user_agent TEXT,                                        
    session_data JSONB DEFAULT '{}'                         
);
`)
    console.log("Login Table Ready")
    await dbClient.end()
    console.log('Database initialization complete.')

  } catch (err) {
    console.error('Error during DB initialization:', err.stack)
  }
}
const addDummyUsers = async(ip)=>{
  await userSignup('Rishav Raj', 'rishavD', 'password','female', ip)
  await userSignup('Suman Mandal', 'mondal', 'password','other', ip)
}
const userSignup = async(name, username, userPassword, gender, ip)=>{
  const dbClient = new Client({
    host: ip,
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'mydb'  
  })

  try{
    await dbClient.connect()
    const checkUser = await dbClient.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    ) 
    if (checkUser.rowCount > 0) {
      await dbClient.end()
      throw new Error("User already exists") 
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(userPassword, saltRounds)
    const insertQuery = `
INSERT INTO users (name, username, password_hash, gender) 
VALUES ($1, $2, $3, $4) 
RETURNING id, name, username, gender
`
    const result = await dbClient.query(insertQuery, [
      name, 
      username, 
      passwordHash,
      gender 
    ])
    await dbClient.end()
    return({
      success: true,
      message: 'User created successfully',
      user: result.rows[0]
    })
  }catch(err){
    throw err
  }
}

const getUser = async(username, ip)=>{
  const dbClient = new Client({
    host: ip,
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'mydb'
  })
  try{
    await dbClient.connect()
    const checkUser = await dbClient.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    ) 
    if (checkUser.rowCount > 0) {
      await dbClient.end()
      delete checkUser.rows[0].password_hash
      // Remove password_hash from the result
      // We can also use a library like lodash to omit the field in the future
      return({
        success: true,
        message: 'User found',
        user: checkUser.rows[0]
      })
    }
    else{
      await dbClient.end()
      return({
        success: false,
        message: 'User not found'
      })
    }
  }
  catch(err){
    await dbClient.end()
    throw err
  }
}
module.exports = { initializeDB, addDummyUsers, userSignup , getUser }

