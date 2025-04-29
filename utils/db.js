const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const nconf = require('nconf')
nconf.env()
const ip_address = nconf.get('dbIP') || 'localhost'
const password = nconf.get('DB_PASSWORD')

// Create a global Pool
const createPool = (database = 'postgres', ip = ip_address) => {
  return new Pool({
    host: ip,
    port: 5432,
    user: 'postgres',
    password: password,
    database: database,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  })
}

// Default pool (for 'postgres' db)
let pool = createPool()

async function initializeDB(ip = ip_address) {
  try {
    pool = createPool('postgres', ip)
    const client = await pool.connect()
    console.log('[+]Connected to PostgreSQL server')

    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = 'mydb'`)
    if (res.rowCount === 0) {
      console.log('[+]Database "mydb" not found. Creating...')
      await client.query('CREATE DATABASE mydb')
    }
    console.log('[+]Database "mydb" is ready.')
    client.release() // Release the connection back to pool

    // Switch to 'mydb'
    pool = createPool('mydb', ip)
    const dbClient = await pool.connect()
    console.log('[+]Connected to "mydb" database')

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        username VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255),
        gender VARCHAR(10)
      )
    `)
    console.log('[+]Table "users" ready.')

    await dbClient.query(`
      CREATE TYPE expiryID AS (
        id INT,
        expires_at TIMESTAMP
      );
    `)
    await dbClient.query(`CREATE TABLE IF NOT EXISTS rasta (
    routeID VARCHAR(15) PRIMARY KEY,
    userIDs expiryID[]
);
`)
    console.log('[+]Table "rasta" ready.')

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '2 hours',
        ip_address TEXT,
        user_agent TEXT,
        session_data JSONB DEFAULT '{}'
      )
    `)
    console.log('[+]Table "sessions" ready.')

    dbClient.release()

  } catch (err) {
    console.error('[-]Error during DB initialization:', err.stack)
  }
}

const addDummyUsers = async (ip = ip_address) => {
  await userSignup('Rishav Raj', 'rishavD', 'password', 'female', ip)
  await userSignup('Suman Mandal', 'mondal', 'password', 'other', ip)
}

const userSignup = async (name, username, userPassword, gender, ip = ip_address) => {
  if (pool.options.host !== ip || pool.options.database !== 'mydb') {
    pool = createPool('mydb', ip)
  }
  const client = await pool.connect()
  try {
    const { rowCount } = await client.query(
      'SELECT 1 FROM users WHERE username = $1',
      [username]
    )

    if (rowCount > 0) {
      throw new Error('User already exists')
    }

    const passwordHash = await bcrypt.hash(userPassword, 10)

    const insertQuery = `
      INSERT INTO users (name, username, password_hash, gender) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, username, gender
    `
    const { rows } = await client.query(insertQuery, [name, username, passwordHash, gender])
    
    return {
      success: true,
      message: 'User created successfully',
      user: rows[0]
    }
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}

const getUser = async (username, ip = ip_address) => {
  if (pool.options.host !== ip || pool.options.database !== 'mydb') {
    pool = createPool('mydb', ip)
  }

  const client = await pool.connect()
  try {
    const { rows, rowCount } = await client.query(
      'SELECT id, name, username, gender FROM users WHERE username = $1',
      [username]
    )

    if (rowCount > 0) {
      return {
        success: true,
        message: 'User found',
        user: rows[0]
      }
    } else {
      return {
        success: false,
        message: 'User not found'
      }
    }
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
}

module.exports = { initializeDB, addDummyUsers, userSignup, getUser, createPool}
