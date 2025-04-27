const { Client } = require('pg')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcryptjs')
const dbClient = new Client({
    host: ip,
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'mydb'
})

const loginUser = async(username, password)=>{
    try {
        await dbClient.connect()
        const user = await dbClient.query('SELECT id, password_hash FROM users WHERE username = $1',
            [username])
        if(user.rowCount === 0){
            console.log("User doesn't exist")
            throw new Error("User Doesn't exist")
        }
        const usr = user.rows[0]
        const passwordMatch = await bcrypt.compare(password, usr.password_hash)
        if(!passwordMatch){
            console.log("Password didn't match")
            throw new Error("Invalid Password")
        }

        const sessionId = uuidv4();
        await dbClient.query(`INSERT INTO sessions (session_id, user_id) VALUES ($1, $2)`,
            [sessionId, usr.id])
        dbClient.end();
        return sessionId
} 
catch(err){
    console.error(err);
    throw new Error("server error")
}
}


const authCheck = async(req,res,next)=>{
    const sessionId = req.cookies.session_id;
    if (!sessionId){throw new Error("Login to continue")} 
    try{
        await dbClient.connect();
        const result = await dbClient.query('SELECT * FROM sessions WHERE session_id = $1 AND expires_at > now()',
            [sessionId])
        if (result.rowCount === 0) {
            throw new Error("Session expired")
        }
        next();
    }
    catch(err){
        console.log(err)
        return res.status(500).send("Something went wrong")
    }
}
module.exports = {authCheck, login}
