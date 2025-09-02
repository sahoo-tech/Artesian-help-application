const aiService = require('../services/ai.service');
const dataService = require('../services/data.service');
const { generateResponse } = require('../utils/helpers');

class AIController {
  async mentorChat(req, res) {
    try {
      const { message, category = 'business' } = req.body;
      const userId = req.user.id;

      // Get user context for personalized responses
      const userContext = {
        craftType: req.user.craftType,
        experience: req.user.artisanProfile?.experience,
        location: req.user.location
      };

      // Generate AI response
      const aiResponse = await aiService.chatWithMentor(message, category, userContext);

      // Save conversation (optional - implement conversation storage)
      try {
        await dataService.create('conversations', {
          userId,
          type: 'ai_mentor',
          category,
          userMessage: message,
          aiResponse: aiResponse.response,
          tokensUsed: aiResponse.tokensUsed
        });
      } catch (saveError) {
        console.error('Failed to save conversation:', saveError);
      }

      res.json(
        generateResponse(true, aiResponse, 'AI mentor response generated successfully')
      );

    } catch (error) {
      console.error('AI Mentor error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get AI mentor response: ' + error.message)
      );
    }
  }

  async shopperChat(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user?.id;

      // Get user preferences
      const userPreferences = {
        interests: req.user?.interests || [],
        budget: req.user?.budget,
        style: req.user?.style
      };

      // Generate AI response
      const aiResponse = await aiService.chatWithShopper(message, userPreferences);

      // Save conversation (optional)
      if (userId) {
        try {
          await dataService.create('conversations', {
            userId,
            type: 'ai_shopper',
            userMessage: message,
            aiResponse: aiResponse.response,
            tokensUsed: aiResponse.tokensUsed
          });
        } catch (saveError) {
          console.error('Failed to save conversation:', saveError);
        }
      }

      res.json(
        generateResponse(true, aiResponse, 'AI shopper response generated successfully')
      );

    } catch (error) {
      console.error('AI Shopper error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get AI shopper response: ' + error.message)
      );
    }
  }

  async generateProductDescription(req, res) {
    try {
      const productData = req.body;

      // Ensure user owns the product or is creating it
      if (req.user.role !== 'artisan') {
        return res.status(403).json(
          generateResponse(false, null, 'Only artisans can generate product descriptions')
        );
      }

      // Add artisan name to product data
      productData.artisanName = `${req.user.firstName} ${req.user.lastName}`;

      const result = await aiService.generateProductDescription(productData);

      res.json(
        generateResponse(true, result, 'Product description generated successfully')
      );

    } catch (error) {
      console.error('Product description generation error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to generate product description: ' + error.message)
      );
    }
  }

  async generateArtisanProfile(req, res) {
    try {
      const { name, location, craftType, photo } = req.body;

      if (req.user.role !== 'artisan') {
        return res.status(403).json(
          generateResponse(false, null, 'Only artisans can generate profiles')
        );
      }

      const profileData = await aiService.generateArtisanProfile({
        name: name || `${req.user.firstName} ${req.user.lastName}`,
        location: location || req.user.location,
        craftType: craftType || req.user.craftType,
        photo
      });

      // Update user profile with generated data
      await dataService.update('users', req.user.id, {
        artisanProfile: {
          ...req.user.artisanProfile,
          ...profileData
        }
      });

      res.json(
        generateResponse(true, profileData, 'Artisan profile generated successfully')
      );

    } catch (error) {
      console.error('Artisan profile generation error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to generate artisan profile: ' + error.message)
      );
    }
  }

  async generatePricingSuggestion(req, res) {
    try {
      const productData = req.body;

      if (req.user.role !== 'artisan') {
        return res.status(403).json(
          generateResponse(false, null, 'Only artisans can get pricing suggestions')
        );
      }

      const pricingSuggestion = await aiService.generatePricingSuggestion(productData);

      res.json(
        generateResponse(true, pricingSuggestion, 'Pricing suggestion generated successfully')
      );

    } catch (error) {
      console.error('Pricing suggestion error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to generate pricing suggestion: ' + error.message)
      );
    }
  }

  async getConversationHistory(req, res) {
    try {
      const { type = 'ai_mentor' } = req.query;
      const userId = req.user.id;

      const conversations = await dataService.findAll('conversations', { 
        userId, 
        type 
      });

      // Sort by most recent first
      conversations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json(
        generateResponse(true, { conversations }, 'Conversation history retrieved successfully')
      );

    } catch (error) {
      console.error('Get conversation history error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get conversation history: ' + error.message)
      );
    }
  }

  async getCulturalStories(req, res) {
    try {
      // Sample cultural stories - in production, this might come from a database or AI generation
      const stories = [
        {
          id: 'story_001',
          title: 'The Sacred Art of Block Printing',
          region: 'Rajasthan, India',
          image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
          summary: 'Discover how ancient printing techniques preserve royal traditions',
          content: 'In the royal courts of Rajasthan, master craftsmen developed intricate block printing techniques that told stories of divine beauty and cosmic harmony...',
          duration: '5 min read',
          featured: true
        },
        {
          id: 'story_002',
          title: 'Kente: The Cloth of Kings',
          region: 'Ashanti Kingdom, Ghana',
          image: 'https://images.unsplash.com/photo-1611095790260-b35e67b6a76e?w=800&h=400&fit=crop',
          summary: 'Each thread weaves the wisdom and power of ancient African royalty',
          content: 'Legend says that Kwaku Ananse, the spider trickster, taught humans to weave by watching a spider spin its web...',
          duration: '4 min read',
          featured: true
        },
        {
          id: 'story_003',
          title: 'The Pottery of Ancestral Spirits',
          region: 'Oaxaca, Mexico',
          image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=400&fit=crop',
          summary: 'Clay vessels that bridge the world of the living and the ancestors',
          content: 'In the mountains of Oaxaca, indigenous potters continue traditions that connect them to their ancestors through sacred clay...',
          duration: '6 min read',
          featured: false
        }
      ];

      res.json(
        generateResponse(true, { stories }, 'Cultural stories retrieved successfully')
      );

    } catch (error) {
      console.error('Get cultural stories error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get cultural stories: ' + error.message)
      );
    }
  }
}

module.exports = new AIController();
