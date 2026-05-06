const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auctionDB';

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to', MONGO_URI);
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️  Dropped database');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Drop DB error:', err);
    process.exit(1);
  }
})();
