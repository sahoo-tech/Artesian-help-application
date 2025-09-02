const dataService = require('../services/data.service');
const aiService = require('../services/ai.service');
const { generateResponse, paginate, parseSearchQuery, generateSKU } = require('../utils/helpers');

class ProductController {
  async createProduct(req, res) {
    try {
      if (req.user.role !== 'artisan') {
        return res.status(403).json(
          generateResponse(false, null, 'Only artisans can create products')
        );
      }

      const productData = {
        ...req.body,
        artisanId: req.user.id,
        artisanName: `${req.user.firstName} ${req.user.lastName}`,
        sku: generateSKU(req.body.title, req.body.category),
        isActive: true,
        rating: 0,
        reviewCount: 0,
        views: 0,
        likes: 0
      };

      // Generate AI description if not provided
      if (!productData.description && productData.title) {
        try {
          const aiResult = await aiService.generateProductDescription(productData);
          productData.description = aiResult.description;
          productData.aiGenerated = {
            description: true,
            seoTitle: aiResult.seoTitle,
            tags: aiResult.tags,
            culturalStory: aiResult.culturalStory
          };
        } catch (aiError) {
          console.error('AI description generation failed:', aiError);
        }
      }

      // Generate pricing suggestion if not provided
      if (!productData.price && productData.materials) {
        try {
          const pricingSuggestion = await aiService.generatePricingSuggestion(productData);
          productData.suggestedPrice = pricingSuggestion.suggestedPrice;
          productData.pricingFactors = pricingSuggestion.factors;
        } catch (pricingError) {
          console.error('Pricing suggestion failed:', pricingError);
        }
      }

      const product = await dataService.create('products', productData);

      res.status(201).json(
        generateResponse(true, { product }, 'Product created successfully')
      );

    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to create product: ' + error.message)
      );
    }
  }

  async getProducts(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        category, 
        region, 
        country,
        minPrice, 
        maxPrice, 
        search, 
        artisan,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filters
      const filters = { isActive: true };

      if (category) filters.category = category;
      if (region) filters.region = region;
      if (country) filters.country = country;
      if (artisan) filters.artisanId = artisan;

      // Get all products with filters
      let products = await dataService.findAll('products', filters);

      // Apply price filter
      if (minPrice || maxPrice) {
        products = products.filter(product => {
          const price = product.price;
          if (minPrice && price < parseFloat(minPrice)) return false;
          if (maxPrice && price > parseFloat(maxPrice)) return false;
          return true;
        });
      }

      // Apply search filter
      if (search) {
        const searchQuery = parseSearchQuery(search);
        products = products.filter(product => {
          const searchText = `${product.title} ${product.description} ${product.category} ${product.tags?.join(' ') || ''}`.toLowerCase();
          return searchQuery.regex.test(searchText);
        });
      }

      // Sort products
      products.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === 'createdAt') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }

        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });

      // Paginate results
      const paginatedResult = paginate(products, parseInt(page), parseInt(limit));

      // Get artisan info for products
      const productsWithArtisans = await Promise.all(
        paginatedResult.items.map(async (product) => {
          const artisan = await dataService.findById('users', product.artisanId);
          return {
            ...product,
            artisan: artisan ? {
              id: artisan.id,
              name: `${artisan.firstName} ${artisan.lastName}`,
              avatar: artisan.avatar,
              craftType: artisan.craftType,
              location: artisan.location,
              rating: artisan.artisanProfile?.rating
            } : null
          };
        })
      );

      res.json(
        generateResponse(true, {
          products: productsWithArtisans,
          pagination: paginatedResult.pagination
        }, 'Products retrieved successfully')
      );

    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get products: ' + error.message)
      );
    }
  }

  async getProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await dataService.findById('products', id);
      if (!product || !product.isActive) {
        return res.status(404).json(
          generateResponse(false, null, 'Product not found')
        );
      }

      // Get artisan information
      const artisan = await dataService.findById('users', product.artisanId);

      // Increment view count
      await dataService.update('products', id, {
        views: (product.views || 0) + 1
      });

      // Get reviews for this product (if any)
      const reviews = await dataService.findAll('reviews', { productId: id });

      const productWithDetails = {
        ...product,
        views: (product.views || 0) + 1,
        artisan: artisan ? {
          id: artisan.id,
          name: `${artisan.firstName} ${artisan.lastName}`,
          avatar: artisan.avatar,
          craftType: artisan.craftType,
          location: artisan.location,
          rating: artisan.artisanProfile?.rating,
          totalOrders: artisan.artisanProfile?.totalOrders,
          heritage: artisan.artisanProfile?.heritage,
          specialties: artisan.artisanProfile?.specialties
        } : null,
        reviews: reviews || []
      };

      res.json(
        generateResponse(true, { product: productWithDetails }, 'Product retrieved successfully')
      );

    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get product: ' + error.message)
      );
    }
  }

  async updateProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await dataService.findById('products', id);
      if (!product) {
        return res.status(404).json(
          generateResponse(false, null, 'Product not found')
        );
      }

      // Check if user owns this product
      if (product.artisanId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json(
          generateResponse(false, null, 'Not authorized to update this product')
        );
      }

      const updates = {
        ...req.body,
        updatedAt: new Date().toISOString()
      };

      // Remove fields that shouldn't be updated directly
      delete updates.artisanId;
      delete updates.views;
      delete updates.rating;
      delete updates.reviewCount;

      const updatedProduct = await dataService.update('products', id, updates);

      res.json(
        generateResponse(true, { product: updatedProduct }, 'Product updated successfully')
      );

    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to update product: ' + error.message)
      );
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      const product = await dataService.findById('products', id);
      if (!product) {
        return res.status(404).json(
          generateResponse(false, null, 'Product not found')
        );
      }

      // Check if user owns this product
      if (product.artisanId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json(
          generateResponse(false, null, 'Not authorized to delete this product')
        );
      }

      // Soft delete - mark as inactive instead of actual deletion
      await dataService.update('products', id, {
        isActive: false,
        deletedAt: new Date().toISOString()
      });

      res.json(
        generateResponse(true, null, 'Product deleted successfully')
      );

    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to delete product: ' + error.message)
      );
    }
  }

  async getArtisanProducts(req, res) {
    try {
      const { page = 1, limit = 20, status = 'active' } = req.query;
      const artisanId = req.user.id;

      const filters = { artisanId };
      if (status === 'active') {
        filters.isActive = true;
      } else if (status === 'inactive') {
        filters.isActive = false;
      }
      // If status is 'all', don't add isActive filter

      const products = await dataService.findAll('products', filters);

      // Sort by creation date (newest first)
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const paginatedResult = paginate(products, parseInt(page), parseInt(limit));

      res.json(
        generateResponse(true, {
          products: paginatedResult.items,
          pagination: paginatedResult.pagination
        }, 'Artisan products retrieved successfully')
      );

    } catch (error) {
      console.error('Get artisan products error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get artisan products: ' + error.message)
      );
    }
  }

  async toggleWishlist(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (req.user.role !== 'buyer') {
        return res.status(403).json(
          generateResponse(false, null, 'Only buyers can add items to wishlist')
        );
      }

      const product = await dataService.findById('products', id);
      if (!product || !product.isActive) {
        return res.status(404).json(
          generateResponse(false, null, 'Product not found')
        );
      }

      const user = await dataService.findById('users', userId);
      let wishlist = user.wishlist || [];

      let message;
      let isWishlisted;

      if (wishlist.includes(id)) {
        // Remove from wishlist
        wishlist = wishlist.filter(productId => productId !== id);
        message = 'Product removed from wishlist';
        isWishlisted = false;

        // Decrease likes count on product
        await dataService.update('products', id, {
          likes: Math.max(0, (product.likes || 0) - 1)
        });
      } else {
        // Add to wishlist
        wishlist.push(id);
        message = 'Product added to wishlist';
        isWishlisted = true;

        // Increase likes count on product
        await dataService.update('products', id, {
          likes: (product.likes || 0) + 1
        });
      }

      // Update user wishlist
      await dataService.update('users', userId, { wishlist });

      res.json(
        generateResponse(true, { isWishlisted }, message)
      );

    } catch (error) {
      console.error('Toggle wishlist error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to update wishlist: ' + error.message)
      );
    }
  }

  async getCategories(req, res) {
    try {
      const products = await dataService.findAll('products', { isActive: true });

      // Extract unique categories
      const categories = [...new Set(products.map(product => product.category))];

      // Count products per category
      const categoryCounts = categories.map(category => ({
        name: category,
        count: products.filter(product => product.category === category).length
      }));

      res.json(
        generateResponse(true, { categories: categoryCounts }, 'Categories retrieved successfully')
      );

    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get categories: ' + error.message)
      );
    }
  }

  async getFeaturedProducts(req, res) {
    try {
      const { limit = 8 } = req.query;

      const products = await dataService.findAll('products', { isActive: true });

      // Sort by views and likes to get featured products
      const featuredProducts = products
        .sort((a, b) => ((b.views || 0) + (b.likes || 0)) - ((a.views || 0) + (a.likes || 0)))
        .slice(0, parseInt(limit));

      // Get artisan info for each product
      const productsWithArtisans = await Promise.all(
        featuredProducts.map(async (product) => {
          const artisan = await dataService.findById('users', product.artisanId);
          return {
            ...product,
            artisan: artisan ? {
              id: artisan.id,
              name: `${artisan.firstName} ${artisan.lastName}`,
              avatar: artisan.avatar,
              craftType: artisan.craftType
            } : null
          };
        })
      );

      res.json(
        generateResponse(true, { products: productsWithArtisans }, 'Featured products retrieved successfully')
      );

    } catch (error) {
      console.error('Get featured products error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get featured products: ' + error.message)
      );
    }
  }
}

module.exports = new ProductController();
