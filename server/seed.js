const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/.env' });

const User    = require('./models/User');
const Auction = require('./models/Auction');
const Bid     = require('./models/Bid');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auctionDB';

const seed = async () => {
  await mongoose.connect(MONGO_URI, { dbName: 'auctionDB' });
  console.log('✅ Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), Auction.deleteMany(), Bid.deleteMany()]);
  console.log('🧹 Cleared existing data');

  // Create users
  const password = await bcrypt.hash('password123', 12);

  const [admin, seller, user1, user2] = await User.insertMany([
    { name: 'Admin User',   email: 'admin@demo.com',  password, role: 'admin'  },
    { name: 'Demo Seller',  email: 'seller@demo.com', password, role: 'seller' },
    { name: 'Alice Bidder', email: 'user@demo.com',   password, role: 'user'   },
    { name: 'Bob Smith',    email: 'bob@demo.com',    password, role: 'user'   },
  ]);
  console.log('👥 Created 4 users');

  // Create auctions
  const now = new Date();
  const future = (hours) => new Date(now.getTime() + hours * 3600 * 1000);

  const auctions = await Auction.insertMany([
    {
      title: 'Apple MacBook Pro 16" M3 Max',
      description: 'Brand new sealed MacBook Pro with M3 Max chip, 36GB RAM, 1TB SSD. Includes charger and documentation.',
      category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop'],
      startingPrice: 2500,
      currentBid: 2750,
      minIncrement: 50,
      endTime: future(48),
      seller: seller._id,
      highestBidder: user1._id,
      totalBids: 3,
      status: 'active',
      featured: true,
    },
    {
      title: 'Vintage Rolex Submariner 1967',
      description: 'Rare vintage Submariner in excellent condition. Original dial, hands and bracelet. Full service history.',
      category: 'Jewelry',
      images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop'],
      startingPrice: 8000,
      currentBid: 9200,
      minIncrement: 200,
      endTime: future(6),
      seller: seller._id,
      highestBidder: user2._id,
      totalBids: 7,
      status: 'active',
    },
    {
      title: 'Abstract Oil Painting "Blue Horizon"',
      description: 'Original large-format oil on canvas (120x90cm) by emerging artist Sarah Chen. Certificate of authenticity included.',
      category: 'Art',
      images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'],
      startingPrice: 500,
      currentBid: 680,
      minIncrement: 20,
      endTime: future(72),
      seller: seller._id,
      highestBidder: user1._id,
      totalBids: 9,
      status: 'active',
    },
    {
      title: '2019 Porsche 911 Carrera S',
      description: 'Low mileage (18,000 mi), PDK transmission, Sport Chrono package, full Porsche service history. Pristine condition.',
      category: 'Vehicles',
      images: ['https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&h=600&fit=crop'],
      startingPrice: 75000,
      currentBid: 82000,
      minIncrement: 500,
      endTime: future(96),
      seller: seller._id,
      highestBidder: user2._id,
      totalBids: 5,
      status: 'active',
      featured: true,
    },
    {
      title: 'Rare Pokémon Card Collection',
      description: 'Complete Base Set (Shadowless), PSA graded. Includes holographic Charizard (PSA 9), Blastoise, Venusaur.',
      category: 'Collectibles',
      images: ['https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&h=600&fit=crop'],
      startingPrice: 1000,
      currentBid: 1450,
      minIncrement: 50,
      endTime: future(24),
      seller: seller._id,
      highestBidder: user1._id,
      totalBids: 12,
      status: 'active',
    },
    {
      title: 'Sony A7R V Mirrorless Camera',
      description: '61MP BSI-CMOS sensor, 8K video capability, includes 24-70mm f/2.8 G Master lens. Barely used (200 shutter count).',
      category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop'],
      startingPrice: 3200,
      currentBid: 0,
      minIncrement: 100,
      endTime: future(120),
      seller: seller._id,
      totalBids: 0,
      status: 'active',
    },
    {
      title: 'Signed Michael Jordan Jersey',
      description: 'Authentic game-worn Chicago Bulls jersey signed by Michael Jordan. LOA from JSA Authentication included.',
      category: 'Sports',
      images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop'],
      startingPrice: 5000,
      currentBid: 6500,
      minIncrement: 250,
      endTime: future(-2),  // Already ended
      seller: seller._id,
      highestBidder: user2._id,
      winner: user2._id,
      totalBids: 8,
      status: 'ended',
    },
  ]);
  console.log(`🏷️  Created ${auctions.length} auctions`);

  // Create some bids
  const bidDocs = [
    { user: user1._id, auction: auctions[0]._id, amount: 2600, createdAt: new Date(now - 3600000 * 3) },
    { user: user2._id, auction: auctions[0]._id, amount: 2700, createdAt: new Date(now - 3600000 * 2) },
    { user: user1._id, auction: auctions[0]._id, amount: 2750, createdAt: new Date(now - 3600000 * 1) },
    { user: user1._id, auction: auctions[1]._id, amount: 8500, createdAt: new Date(now - 3600000 * 5) },
    { user: user2._id, auction: auctions[1]._id, amount: 9200, createdAt: new Date(now - 3600000 * 2) },
  ];
  await Bid.insertMany(bidDocs);
  console.log(`🔨 Created ${bidDocs.length} bids`);

  console.log('\n✅ Seed complete! Demo accounts:');
  console.log('   👤 Admin:  admin@demo.com  / password123');
  console.log('   🏷️  Seller: seller@demo.com / password123');
  console.log('   👋 User:   user@demo.com   / password123\n');

  await mongoose.disconnect();
};

seed().catch((err) => { console.error('Seed error:', err); process.exit(1); });
