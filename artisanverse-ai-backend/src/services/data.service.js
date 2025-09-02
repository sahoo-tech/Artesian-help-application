const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class DataService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.collections = {
      users: 'users.json',
      products: 'products.json',
      orders: 'orders.json',
      conversations: 'conversations.json',
      artisans: 'artisans.json',
      reviews: 'reviews.json',
      workshops: 'workshops.json'
    };
    this.data = {};
  }

  async initialize() {
    try {
      // Ensure data directory exists
      await fs.mkdir(this.dataDir, { recursive: true });

      // Initialize collections
      for (const [collection, filename] of Object.entries(this.collections)) {
        await this.ensureCollection(collection, filename);
      }

      console.log('✅ Data service initialized with file-based storage');
    } catch (error) {
      console.error('❌ Data service initialization failed:', error);
    }
  }

  async ensureCollection(collection, filename) {
    const filePath = path.join(this.dataDir, filename);

    try {
      const data = await fs.readFile(filePath, 'utf8');
      this.data[collection] = JSON.parse(data);
    } catch (error) {
      // File doesn't exist, create with sample data
      this.data[collection] = this.getInitialData(collection);
      await this.saveCollection(collection);
    }
  }

  getInitialData(collection) {
    const initialData = {
      users: [
        {
          id: 'user_buyer_001',
          email: 'sarah@example.com',
          password: '$2a$10$rOzJqW6tLGXYGDnlNwPr..PgHgXvxgNZ8J8hQiUzQgHi', // password123
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'buyer',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5b4?w=150&h=150&fit=crop&crop=face',
          location: 'San Francisco, CA',
          interests: ['textiles', 'jewelry', 'home decor'],
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          culturalPassport: {
            points: 245,
            regionsExplored: ['South Asia', 'West Africa'],
            achievements: ['Cultural Explorer', 'Textile Enthusiast']
          }
        },
        {
          id: 'user_artisan_001',
          email: 'meera@example.com',
          password: '$2a$10$rOzJqW6tLGXYGDnlNwPr..PgHgXvxgNZ8J8hQiUzQgHi', // password123
          firstName: 'Meera',
          lastName: 'Sharma',
          role: 'artisan',
          avatar: 'https://images.unsplash.com/photo-1594736797933-d0c4e9e6bf43?w=150&h=150&fit=crop&crop=face',
          location: 'Jaipur, India',
          craftType: 'Block Printing',
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          artisanProfile: {
            heritage: '5th generation block printer preserving 300-year-old family techniques',
            experience: 15,
            specialties: ['Natural Dyes', 'Bagru Printing', 'Traditional Motifs'],
            rating: 4.9,
            totalOrders: 347
          }
        },
        {
          id: 'user_admin_001',
          email: 'admin@example.com',
          password: '$2a$10$rOzJqW6tLGXYGDnlNwPr..PgHgXvxgNZ8J8hQiUzQgHi', // admin123
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          isVerified: true,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      products: [
        {
          id: 'product_001',
          title: 'Royal Peacock Mandala Block Print Saree',
          description: 'Hand-block printed on pure silk with natural indigo and turmeric dyes. Features traditional peacock motifs symbolizing grace and beauty in Indian culture.',
          price: 285,
          originalPrice: 350,
          currency: 'USD',
          category: 'Textiles',
          subcategory: 'Sarees',
          region: 'South Asia',
          country: 'India',
          artisanId: 'user_artisan_001',
          images: [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=600&fit=crop',
            'https://images.unsplash.com/photo-1594736797933-d0c4e9e6bf43?w=600&h=600&fit=crop'
          ],
          inStock: 5,
          rating: 4.9,
          reviewCount: 47,
          tags: ['handmade', 'sustainable', 'traditional', 'royal', 'ceremonial'],
          culturalStory: 'The peacock has been sacred in Indian culture for millennia, representing the divine beauty of creation.',
          materials: ['Pure Silk', 'Natural Indigo', 'Turmeric Dye'],
          techniques: ['Hand Block Printing', 'Natural Dyeing', 'Sun Drying'],
          timeToMake: '15 days',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ],
      orders: [],
      conversations: [],
      artisans: [],
      reviews: []
    };

    return initialData[collection] || [];
  }

  async saveCollection(collection) {
    const filePath = path.join(this.dataDir, this.collections[collection]);
    await fs.writeFile(filePath, JSON.stringify(this.data[collection], null, 2));
  }

  // CRUD operations
  async create(collection, data) {
    if (!this.data[collection]) {
      throw new Error(`Collection ${collection} not found`);
    }

    const newItem = {
      ...data,
      id: data.id || this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data[collection].push(newItem);
    await this.saveCollection(collection);
    return newItem;
  }

  async findAll(collection, query = {}) {
    if (!this.data[collection]) {
      return [];
    }

    let items = [...this.data[collection]];

    // Apply basic filtering
    Object.keys(query).forEach(key => {
      if (query[key] !== undefined) {
        items = items.filter(item => {
          if (typeof query[key] === 'string') {
            return item[key]?.toString().toLowerCase().includes(query[key].toLowerCase());
          }
          return item[key] === query[key];
        });
      }
    });

    return items;
  }

  async findOne(collection, query) {
    const items = await this.findAll(collection, query);
    return items[0] || null;
  }

  async findById(collection, id) {
    return await this.findOne(collection, { id });
  }

  async update(collection, id, data) {
    if (!this.data[collection]) {
      throw new Error(`Collection ${collection} not found`);
    }

    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }

    this.data[collection][index] = {
      ...this.data[collection][index],
      ...data,
      updatedAt: new Date().toISOString()
    };

    await this.saveCollection(collection);
    return this.data[collection][index];
  }

  async delete(collection, id) {
    if (!this.data[collection]) {
      throw new Error(`Collection ${collection} not found`);
    }

    const index = this.data[collection].findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }

    const deletedItem = this.data[collection].splice(index, 1)[0];
    await this.saveCollection(collection);
    return deletedItem;
  }

  generateId() {
    return crypto.randomUUID();
  }

  // Helper methods for common operations
  async findUserByEmail(email) {
    return await this.findOne('users', { email });
  }

  async getProductsByArtisan(artisanId) {
    return await this.findAll('products', { artisanId, isActive: true });
  }

  async getUserOrders(userId) {
    return await this.findAll('orders', { buyerId: userId });
  }

  // Analytics helpers
  async getAnalytics() {
    const users = await this.findAll('users');
    const products = await this.findAll('products', { isActive: true });
    const orders = await this.findAll('orders');

    return {
      totalUsers: users.length,
      totalBuyers: users.filter(u => u.role === 'buyer').length,
      totalArtisans: users.filter(u => u.role === 'artisan').length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
    };
  }
}

module.exports = new DataService();
