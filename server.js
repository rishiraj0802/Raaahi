const express = require('express')
const nconf = require('nconf')
const { exec } = require('child_process')
const port = nconf.get('port') || 3000
const dbIP = nconf.get('dbIP') || 'localhost'
const { initializeDB, addDummyUsers , userSignup } = require('./db/db.js')
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/addDummyUsers', async(req, res) => {
  try{
    await addDummyUsers(databaseIP).then(()=>res.send('Dummy users added to the db'))
  }
  catch(err){
    console.log(`Error in adding data to the table: ${err}`)
    res.status(501).send("There was an error")
  }
})
app.post('/api/signup', async(req, res) => {
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
        const reply = await userSignup(name, username, password, gender, databaseIP)
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
app.post('/search', (req, res) => {})
app.post('/cleanup', (req, res) => {})
app.listen(port, async(err) => {
  if(err){console.log("Error Starting the server")
    console.log(err)
    process.exit(1)
  }
  try{
    databaseIP = nconf.get('dbIP')
    await initializeDB(databaseIP)
    console.log(`Server running on port ${port}`)
  }
  catch(err){
    console.log(`Error while establishing connection to the database:${err}`)
  }
})
