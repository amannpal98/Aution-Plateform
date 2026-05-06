const { MongoClient } = require('mongodb');
require('dotenv').config({ path: __dirname + '/.env' });

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/';
(async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const admin = client.db().admin();
    const { databases } = await admin.listDatabases();
    console.log('Databases:');
    databases.forEach(db => console.log(' -', db.name));
    await client.close();
  } catch (err) {
    console.error('List DBs error:', err);
    process.exit(1);
  }
})();
