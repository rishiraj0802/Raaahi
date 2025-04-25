const app = require('express')()
const nconf = require('nconf')
const port = nconf.get('port')
const { initializeDB } = require('./db/db.js');
nconf.env();
const password = nconf.get('DB_PASSWORD')   //Make sure to export the password using export DB_PASSWORD=thedesiredpassword in your bash shell/add this line in your .bashrc
console.log(password)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/addDummyUsers', (req, res) => {
  //add dummy users logic here!
  res.send('Dummy users added to the db')
})
app.post('/addUser', (req, res) => {})
app.delete('/removeUser', (req, res) => {})
app.post('/search', (req, res) => {})
app.post('/cleanup', (req, res) => {})
app.listen(3000, () => {
  initializeDB('172.17.0.2', password)   //Ensure that the ip is same
  console.log(`Server running on port ${port}`)
})
