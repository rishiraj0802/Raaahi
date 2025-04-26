const express = require('express')
const nconf = require('nconf')
const { exec } = require('child_process')
const port = nconf.get('port') || 3000
const dbIP = nconf.get('dbIP') || 'localhost'
const { initializeDB, addDummyUsers , userSignup , getUser } = require('./db/db.js')
const { searchNearbyUsers } = require('./search/index.js')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/addDummyUsers', async (req, res) => {
  try{
    await addDummyUsers(dbIP).then(()=>res.send('Dummy users added to the db'))
  }
  catch(err){
    console.log(`Error in adding data to the table: ${err}`)
    res.status(501).send("There was an error")
  }
})
app.post('/api/signup', async (req, res) => {
  try{
    const {name, username, password, gender} = req.body
    if(!name || !username || !password || !gender){
      return res.status(400).json({
        success: false,
        message: 'Name, username, password and gender are mandatory fields'
      })
    }
    else{
      try{
        const reply = await userSignup(name, username, password, gender, dbIP)
        console.log(reply)
        res.status(201).json(reply)
      }
      catch(err){
        console.log(err)
        return res.status(500).json({success:false, error:err.message})
      }
    }
  }
  catch(err){
    console.error(err)
  }

})

app.delete('/removeUser', (req, res) => {})
app.post('/api/searchNearbyUsers', async (req, res) => {
    const { latitude, longitude } = req.body
    if (!latitude || !longitude) {
        return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are mandatory fields'
        })
    }
    const radius = req.body.radius || 1 // Default radius
    const response = await searchNearbyUsers(latitude, longitude, radius)
    res.json(response)
})

app.get('/api/getUser', async (req, res) => {
    const { username } = req.body
    if (!username) {
        return res.status(400).json({
        success: false,
        message: 'Username is a mandatory field'
        })
    }
    response = await getUser(username, dbIP)
    res.json(response)
})

app.post('/cleanup', (req, res) => {})
app.listen(port, async(err) => {
  if(err){console.log("Error Starting the server")
    console.log(err)
    process.exit(1)
  }
  try{
    await initializeDB(dbIP)
    console.log(`Server running on port ${port}`)
  }
  catch(err){
    console.log(`Error while establishing connection to the database:${err}`)
  }
})
