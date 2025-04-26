# Raaahi

---

To set up the database

- Export the environment variable using export command to the bash shell in which the docker is to run.
  `export DB_PASSWORD=<the-super-secret-password>`

- A better practice is to export the environment variable in the .bashrc/.zshrc itself, in order to avoid export again and again.
  `echo 'export DB_PASSWORD=<the-super-secret-password>' >> ~/.path-to-the-rc-file-for-the-terminal`
- Run the following command to get the container started.
  `sudo docker run -d --name database -p 5432:5432 -e POSTGRES_PASSWORD=`$DB_PASSWORD`postgres`
  -When the server.js is run, it automatically instantiates the server, creates the database(if it doesn't exist)
  creates the necessary tables.
  -There is a endpoint /api/addDummyUsers which can be used to add dummy users to the table in order to test.

---
