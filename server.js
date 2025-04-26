const app = require('express')()
const nconf = require('nconf')
const { exec } = require('child_process')
const port = nconf.get('port')
const { initializeDB, addDummyUsers } = require('./db/db.js');
var databaseIP;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/addDummyUsers', async(req, res) => {
  try{
  await addDummyUsers(databaseIP).then(()=>res.send('Dummy users added to the db'));
  }
  catch(err){
    console.log(`Error in adding data to the table: ${err}`)
    res.status(501).send("There was an error")
  }
})
app.post('/addUser', (req, res) => {})
app.delete('/removeUser', (req, res) => {})
app.post('/search', (req, res) => {})
app.post('/cleanup', (req, res) => {})
app.listen(3000, async(err) => {
  if(err){console.log("Error Starting the server");
      console.log(err)
      process.exit(1)
  }
  try{
    exec("sudo docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' database",async (err,ip,stderr)=>{
      if(err){
        console.log(`ERROR: ${err} while trying to fetch docker ip, make sure the instance is running!`)
      }
      else{
        databaseIP = ip.trim()
        await initializeDB(databaseIP)   
        console.log(`Server running on port ${port || 3000}`)
      }
    })
  }
  catch(err){
    console.log(`Error while establishing connection to the database:${err}`)
  }
})
