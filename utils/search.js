const { createPool } = require('./db')
const nconf = require('nconf')
const ip_address = nconf.get('dbIP') || 'localhost'

let pool = createPool('mydb', ip_address)

const searchNearbyUsers = async (userID, geoHashSource, geoHashDest, timestamp, radius) => {
    const client = await pool.connect()
    const query = `SELECT userIDs FROM raasta WHERE routeID = $1;`
    const routeID = `${geoHashSource}${geoHashDest}`
    const res = await client.query(query, [routeID])
    if (res.rowCount === 0) {
        console.log('No users found for this route')
        return []
    }
    const userIDs = res.rows[0].userIDs
    const nearbyUsers = userIDs.filter(user => {
        const [id, time] = user
        return id !== userID && Math.abs(new Date(time) - new Date(timestamp)) <= 30 * 60 * 1000
    })
    const validUsers = userIDs.filter(user => {
        const [id, time] = user
        return id !== userID && new Date(time) > new Date()
    })
    
    await addUsersToRasta(geoHashSource, geoHashDest, timestamp, validUsers)
    await addUserToRasta(geoHashSource, geoHashDest, timestamp, userID)
    return nearbyUsers.map(user => user[0])
}

async function addUserToRasta(geoHashSource, geoHashDest, timestamp, userID) {
  const client = await pool.connect()
  try {
    const insertQuery = `
      INSERT INTO rasta (routeID, userIDs)
      VALUES ($1, $2)
      ON CONFLICT (routeID) DO UPDATE
      SET userIDs = array_append(rasta.userIDs, ROW($3, $4))
    `
    const routeID = `${geoHashSource}${geoHashDest}`
    const userIDs = [userID, timestamp]
    await client.query(insertQuery, [routeID, userIDs])
  } catch (err) {
    console.error('[-]Error adding user to rasta:', err)
  } finally {
    client.release()
  }
}

async function addUsersToRasta(geoHashSource, geoHashDest, timestamp, userIDs) {
  const client = await pool.connect()
  try {
    const insertQuery = `
      INSERT INTO rasta (routeID, userIDs)
      VALUES ($1, $2)
      ON CONFLICT (routeID) DO UPDATE
      SET userIDs = ROW($3, $4)
    `
    const routeID = `${geoHashSource}${geoHashDest}`
    for (const userID of userIDs) {
      const userIDs = [userID, timestamp]
      await client.query(insertQuery, [routeID, userIDs])
    }
  } catch (err) {
    console.error('[-]Error adding users to rasta:', err)
  } finally {
    client.release()
  }
}

module.exports = {
    searchNearbyUsers
}
