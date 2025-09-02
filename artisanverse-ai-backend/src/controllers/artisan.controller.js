const dataService = require('../services/data.service');
const { generateResponse, paginate, calculateRating } = require('../utils/helpers');

class ArtisanController {
  async getArtisans(req, res) {
    try {
      const { page = 1, limit = 20, craftType, region, country, sortBy = 'rating' } = req.query;

      // Build filters
      const filters = { role: 'artisan', isActive: true };
      if (craftType) filters.craftType = craftType;
      if (region) filters.location = new RegExp(region, 'i');
      if (country) filters.location = new RegExp(country, 'i');

      let artisans = await dataService.findAll('users', filters);

      // Sort artisans
      artisans.sort((a, b) => {
        if (sortBy === 'rating') {
          const aRating = a.artisanProfile?.rating || 0;
          const bRating = b.artisanProfile?.rating || 0;
          return bRating - aRating;
        } else if (sortBy === 'orders') {
          const aOrders = a.artisanProfile?.totalOrders || 0;
          const bOrders = b.artisanProfile?.totalOrders || 0;
          return bOrders - aOrders;
        } else if (sortBy === 'newest') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });

      // Remove sensitive information
      const sanitizedArtisans = artisans.map(artisan => {
        const { password, email, ...publicArtisan } = artisan;
        return {
          ...publicArtisan,
          fullName: `${artisan.firstName} ${artisan.lastName}`,
          email: req.user && (req.user.role === 'admin' || req.user.id === artisan.id) ? email : undefined
        };
      });

      const paginatedResult = paginate(sanitizedArtisans, parseInt(page), parseInt(limit));

      res.json(
        generateResponse(true, {
          artisans: paginatedResult.items,
          pagination: paginatedResult.pagination
        }, 'Artisans retrieved successfully')
      );

    } catch (error) {
      console.error('Get artisans error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get artisans: ' + error.message)
      );
    }
  }

  async getArtisan(req, res) {
    try {
      const { id } = req.params;

      const artisan = await dataService.findById('users', id);
      if (!artisan || artisan.role !== 'artisan' || !artisan.isActive) {
        return res.status(404).json(
          generateResponse(false, null, 'Artisan not found')
        );
      }

      // Get artisan's products
      const products = await dataService.findAll('products', { 
        artisanId: id, 
        isActive: true 
      });

      // Get reviews for artisan (from product reviews)
      const productIds = products.map(p => p.id);
      const reviews = [];
      for (const productId of productIds) {
        const productReviews = await dataService.findAll('reviews', { productId });
        reviews.push(...productReviews);
      }

      // Calculate overall rating
      const overallRating = calculateRating(reviews);

      // Remove sensitive information
      const { password, ...publicArtisan } = artisan;

      const artisanWithDetails = {
        ...publicArtisan,
        fullName: `${artisan.firstName} ${artisan.lastName}`,
        products: products.slice(0, 8), // Latest 8 products
        totalProducts: products.length,
        reviews: reviews.slice(0, 10), // Latest 10 reviews
        overallRating,
        totalReviews: reviews.length,
        email: req.user && (req.user.role === 'admin' || req.user.id === artisan.id) ? artisan.email : undefined
      };

      res.json(
        generateResponse(true, { artisan: artisanWithDetails }, 'Artisan retrieved successfully')
      );

    } catch (error) {
      console.error('Get artisan error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get artisan: ' + error.message)
      );
    }
  }

  async getArtisanDashboard(req, res) {
    try {
      const artisanId = req.user.id;

      if (req.user.role !== 'artisan') {
        return res.status(403).json(
          generateResponse(false, null, 'Only artisans can access dashboard')
        );
      }

      // Get artisan's products
      const products = await dataService.findAll('products', { artisanId });
      const activeProducts = products.filter(p => p.isActive);

      // Get orders for artisan's products
      const orders = await dataService.findAll('orders');
      const artisanOrders = orders.filter(order => 
        order.items.some(item => item.artisanId === artisanId)
      );

      // Calculate analytics
      const totalRevenue = artisanOrders.reduce((sum, order) => {
        const artisanItems = order.items.filter(item => item.artisanId === artisanId);
        return sum + artisanItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      }, 0);

      const totalViews = products.reduce((sum, product) => sum + (product.views || 0), 0);
      const totalLikes = products.reduce((sum, product) => sum + (product.likes || 0), 0);

      // Recent activity
      const recentProducts = products
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const recentOrders = artisanOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Low stock products
      const lowStockProducts = activeProducts.filter(product => 
        (product.inStock || 0) <= (product.lowStockThreshold || 5)
      );

      const dashboard = {
        analytics: {
          totalProducts: products.length,
          activeProducts: activeProducts.length,
          totalOrders: artisanOrders.length,
          totalRevenue,
          totalViews,
          totalLikes,
          averageRating: req.user.artisanProfile?.rating || 0
        },
        recentProducts,
        recentOrders,
        lowStockProducts,
        performance: {
          monthlyOrders: this.getMonthlyData(artisanOrders),
          monthlyRevenue: this.getMonthlyRevenue(artisanOrders, artisanId),
          topProducts: activeProducts
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5)
        }
      };

      res.json(
        generateResponse(true, { dashboard }, 'Dashboard data retrieved successfully')
      );

    } catch (error) {
      console.error('Get artisan dashboard error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get dashboard data: ' + error.message)
      );
    }
  }

  async getCraftTypes(req, res) {
    try {
      const artisans = await dataService.findAll('users', { 
        role: 'artisan', 
        isActive: true 
      });

      // Extract unique craft types
      const craftTypes = [...new Set(
        artisans
          .filter(artisan => artisan.craftType)
          .map(artisan => artisan.craftType)
      )];

      // Count artisans per craft type
      const craftTypeCounts = craftTypes.map(craftType => ({
        name: craftType,
        count: artisans.filter(artisan => artisan.craftType === craftType).length
      }));

      res.json(
        generateResponse(true, { craftTypes: craftTypeCounts }, 'Craft types retrieved successfully')
      );

    } catch (error) {
      console.error('Get craft types error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get craft types: ' + error.message)
      );
    }
  }

  async getFeaturedArtisans(req, res) {
    try {
      const { limit = 6 } = req.query;

      const artisans = await dataService.findAll('users', { 
        role: 'artisan', 
        isActive: true 
      });

      // Sort by rating and total orders
      const featuredArtisans = artisans
        .sort((a, b) => {
          const aScore = (a.artisanProfile?.rating || 0) + (a.artisanProfile?.totalOrders || 0) * 0.1;
          const bScore = (b.artisanProfile?.rating || 0) + (b.artisanProfile?.totalOrders || 0) * 0.1;
          return bScore - aScore;
        })
        .slice(0, parseInt(limit));

      // Remove sensitive information
      const sanitizedArtisans = featuredArtisans.map(artisan => {
        const { password, email, ...publicArtisan } = artisan;
        return {
          ...publicArtisan,
          fullName: `${artisan.firstName} ${artisan.lastName}`
        };
      });

      res.json(
        generateResponse(true, { artisans: sanitizedArtisans }, 'Featured artisans retrieved successfully')
      );

    } catch (error) {
      console.error('Get featured artisans error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get featured artisans: ' + error.message)
      );
    }
  }

  // Helper methods
  getMonthlyData(orders) {
    const months = {};
    const now = new Date();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = 0;
    }

    // Count orders per month
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      if (months[monthKey] !== undefined) {
        months[monthKey]++;
      }
    });

    return Object.entries(months).map(([month, count]) => ({
      month,
      orders: count
    }));
  }

  getMonthlyRevenue(orders, artisanId) {
    const months = {};
    const now = new Date();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = 0;
    }

    // Calculate revenue per month
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      if (months[monthKey] !== undefined) {
        const artisanItems = order.items.filter(item => item.artisanId === artisanId);
        const monthRevenue = artisanItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        months[monthKey] += monthRevenue;
      }
    });

    return Object.entries(months).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue * 100) / 100
    }));
  }
}

module.exports = new ArtisanController();
