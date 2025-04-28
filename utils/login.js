// utils/login.js
const { createPool } = require('../db/db.js')
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const nconf = require('nconf');

nconf.env();

const dbPassword = nconf.get('DB_PASSWORD');
const ip = nconf.get('dbIP');

const pool = createPool('mydb', ip, { password: dbPassword });

const loginUser = async (username, password) => {
    const client = await pool.connect();
    try {
        const user = await client.query(
            'SELECT id, password_hash FROM users WHERE username = $1',
            [username]
        );

        if (user.rowCount === 0) {
            console.log("User doesn't exist");
            throw new Error("User Doesn't exist");
        }

        const usr = user.rows[0];
        const passwordMatch = await bcrypt.compare(password, usr.password_hash);

        if (!passwordMatch) {
            console.log("Password didn't match");
            throw new Error("Invalid Password");
        }

        const sessionId = uuidv4();
        console.log({ sessionId });

        await client.query(
            `INSERT INTO sessions (session_id, user_id) VALUES ($1, $2)`,
            [sessionId, usr.id]
        );

        return sessionId;
    } catch (err) {
        console.error(err);
        throw new Error("server error");
    } finally {
        client.release(); // Always release the connection
    }
};

const authCheck = async (req, res, next) => {
    const sessionId = req.body.session_id;
    console.log(sessionId);

    if (!sessionId) {
        return res.status(401).send("Login to continue");
    }

    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT * FROM sessions WHERE session_id = $1 AND expires_at > now()',
            [sessionId]
        );

        if (result.rowCount === 0) {
            return res.status(401).send("Session expired");
        }

        next();
    } catch (err) {
        console.error(err);
        return res.status(500).send("Something went wrong");
    } finally {
        client.release(); // Release connection
    }
};

module.exports = { authCheck, loginUser };
