const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostlink';
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Item.deleteMany();
    await Claim.deleteMany();
    console.log('[Seed] Cleared existing data.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Campus Security Admin',
      email: 'admin@campus.edu',
      password: 'AdminPassword123!',
      phone: '+1 (555) 019-2831',
      department: 'Campus Safety & Administration',
      year: 'Staff',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    });

    const student1 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@campus.edu',
      password: 'StudentPassword123!',
      phone: '+1 (555) 234-5678',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      role: 'student',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    });

    const student2 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.chen@campus.edu',
      password: 'StudentPassword123!',
      phone: '+1 (555) 876-5432',
      department: 'Biomedical Sciences',
      year: '2nd Year',
      role: 'student',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    });

    const student3 = await User.create({
      name: 'Michael Davis',
      email: 'michael.davis@campus.edu',
      password: 'StudentPassword123!',
      phone: '+1 (555) 456-7890',
      department: 'Business Administration',
      year: '4th Year',
      role: 'student',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    });

    console.log('[Seed] Users created successfully.');

    // 2. Create Items
    const items = [
      {
        title: 'Space Gray MacBook Air M2',
        description: 'Left on the 3rd floor study desk in Central Library. Has a sticker of a NASA rocket on the top right corner. Very important for exams!',
        type: 'lost',
        category: 'Electronics',
        location: 'Central Library - 3rd Floor Quiet Zone',
        date: '2025-02-28',
        time: '14:30',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        status: 'active',
        reportedBy: student1._id,
      },
      {
        title: 'Sony WH-1000XM4 Noise Cancelling Headphones',
        description: 'Black Sony over-ear headphones found on a bench near Science Building Hall B. Kept in a hard protective zip case.',
        type: 'found',
        category: 'Electronics',
        location: 'Science Building - Hall B Patio',
        date: '2025-03-01',
        time: '11:15',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        status: 'active',
        reportedBy: student2._id,
      },
      {
        title: 'Brown Leather Fossil Bi-Fold Wallet',
        description: 'Contains Student ID card for Michael Davis, driver license, and campus cafeteria card. Urgent!',
        type: 'lost',
        category: 'Wallet',
        location: 'Campus Dining Hall - East Wing',
        date: '2025-02-27',
        time: '13:00',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
        status: 'claimed',
        reportedBy: student3._id,
      },
      {
        title: 'Set of Dorm Keys with Green Alien Keychain',
        description: 'Found a keychain with 3 metal keys and a rubber neon green alien tag near the Gym locker area.',
        type: 'found',
        category: 'Keys',
        location: 'Student Recreation & Athletic Complex',
        date: '2025-03-01',
        time: '16:45',
        image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
        status: 'active',
        reportedBy: student1._id,
      },
      {
        title: 'Texas Instruments TI-84 Plus CE Calculator',
        description: 'Pink color graphing calculator with handwritten initials "S.C." on the battery back compartment.',
        type: 'lost',
        category: 'Electronics',
        location: 'Mathematics & Statistics Lecture Hall 104',
        date: '2025-02-26',
        time: '09:00',
        image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
        status: 'resolved',
        reportedBy: student2._id,
      },
      {
        title: 'Student ID Card - Emily Watson',
        description: 'Found plastic campus smart ID card lying near the vending machines on the 1st floor.',
        type: 'found',
        category: 'ID Card',
        location: 'Engineering Hub - Ground Floor',
        date: '2025-03-02',
        time: '10:20',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        status: 'active',
        reportedBy: student3._id,
      },
      {
        title: 'Hydro Flask 32oz Water Bottle - Cobalt Blue',
        description: 'Stainless steel water bottle covered in various coding and anime stickers. Dent on bottom rim.',
        type: 'lost',
        category: 'Accessories',
        location: 'Student Union Lounge Area',
        date: '2025-03-01',
        time: '15:10',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
        status: 'active',
        reportedBy: student1._id,
      },
      {
        title: 'Black North Face Windbreaker Jacket (Size M)',
        description: 'Left on chair in Room 204 after evening Data Structures lecture.',
        type: 'found',
        category: 'Clothing',
        location: 'Computer Science Building - Room 204',
        date: '2025-02-25',
        time: '18:00',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
        status: 'active',
        reportedBy: student2._id,
      },
    ];

    const createdItems = await Item.insertMany(items);
    console.log(`[Seed] ${createdItems.length} items created successfully.`);

    // 3. Create Sample Claims
    const claim1 = await Claim.create({
      item: createdItems[1]._id, // Sony headphones reported found by student2
      claimant: student1._id, // Claimed by student1
      message: 'Hi Sarah! I think those are my Sony headphones! The case has a slight scratch on the zipper pull and my phone Bluetooth name is "Alex-XM4". Can we meet at the library to verify?',
      status: 'pending',
    });

    const claim2 = await Claim.create({
      item: createdItems[2]._id, // Brown Leather Wallet
      claimant: student3._id,
      message: 'This is my wallet! Verified with ID card matching my name.',
      status: 'approved',
    });

    console.log('[Seed] Sample claims created successfully.');
    console.log('====================================================');
    console.log(' SEEDING COMPLETE! DEMO CREDENTIALS:');
    console.log(' Admin:   admin@campus.edu       | AdminPassword123!');
    console.log(' Student: alex.rivera@campus.edu | StudentPassword123!');
    console.log(' Student: sarah.chen@campus.edu  | StudentPassword123!');
    console.log(' Student: michael.davis@campus.edu| StudentPassword123!');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
