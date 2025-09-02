const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    }) : null;

    this.mentorPersonalities = {
      business: {
        role: "You are Guru Vishwanath, an experienced business mentor who has helped traditional artisans build successful global businesses for over 30 years. You speak with wisdom, compassion, and practical experience.",
        expertise: ["pricing strategies", "market analysis", "customer service", "business growth"]
      },
      marketing: {
        role: "You are Maya, a digital marketing expert who specializes in authentic storytelling for cultural artisans. You help preserve tradition while reaching modern audiences.",
        expertise: ["storytelling", "social media", "content creation", "brand building"]
      },
      pricing: {
        role: "You are Rajesh, a pricing strategist who understands the true value of handmade cultural items. You help artisans price their work fairly while staying competitive.",
        expertise: ["cost analysis", "market pricing", "value proposition", "profit margins"]
      }
    };

    this.shopperPersonality = {
      role: "You are Aria, a cultured shopping assistant who deeply appreciates traditional crafts and their stories. You help buyers discover authentic pieces that resonate with their style and values.",
      expertise: ["cultural knowledge", "style advice", "authenticity verification", "gift recommendations"]
    };
  }

  async generateArtisanProfile(basicInfo) {
    const { name, location, craftType, photo } = basicInfo;

    if (!this.openai) {
      return this.getFallbackProfile(basicInfo);
    }

    try {
      const prompt = `Create an inspiring artisan profile for ${name}, a ${craftType} craftsperson from ${location}. 
      Include:
      1. A compelling heritage story (2-3 paragraphs)
      2. Their craft specialty and techniques
      3. Cultural significance of their work
      4. Personal journey and passion

      Keep it authentic, respectful, and inspiring. Focus on cultural heritage and traditional skills.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const story = completion.choices[0].message.content;

      return {
        heritage: story,
        craftTwin: {
          personality: `Wise ${craftType.toLowerCase()} master sharing ancient knowledge`,
          voice: "Warm, knowledgeable, culturally proud",
          catchphrase: `Every ${craftType.toLowerCase()} piece tells a story of our ancestors`
        },
        specialties: this.extractSpecialties(craftType),
        culturalContext: this.getCulturalContext(location, craftType)
      };

    } catch (error) {
      console.error('AI Profile Generation Error:', error);
      return this.getFallbackProfile(basicInfo);
    }
  }

  async generateProductDescription(productData) {
    if (!this.openai) {
      return this.getFallbackProductDescription(productData);
    }

    try {
      const prompt = `Create a compelling product description for this handmade item:

      Product: ${productData.title}
      Category: ${productData.category}
      Materials: ${(productData.materials || []).join(', ')}
      Artisan: ${productData.artisanName}
      Region: ${productData.region}

      Include:
      1. Compelling opening that captures attention
      2. Cultural significance and story
      3. Crafting process and techniques
      4. Materials and quality
      5. Perfect for what occasions/uses

      Make it 150-200 words, engaging but respectful of the cultural heritage.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      const description = completion.choices[0].message.content;

      return {
        description,
        seoTitle: this.generateSEOTitle(productData),
        tags: this.generateTags(productData),
        culturalStory: this.generateCulturalStory(productData)
      };

    } catch (error) {
      console.error('Product Description Generation Error:', error);
      return this.getFallbackProductDescription(productData);
    }
  }

  async chatWithMentor(message, category = 'business', userContext = {}) {
    const personality = this.mentorPersonalities[category] || this.mentorPersonalities.business;

    if (!this.openai) {
      return this.getFallbackMentorResponse(category, message);
    }

    try {
      const contextPrompt = `${personality.role}

      User Context:
      - Craft: ${userContext.craftType || 'traditional crafts'}
      - Experience: ${userContext.experience || 'beginner'}
      - Location: ${userContext.location || 'various'}

      Respond to this question with practical, actionable advice in a warm, mentoring tone.
      Keep responses between 100-200 words.

      Question: ${message}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: contextPrompt }],
        max_tokens: 250,
        temperature: 0.7,
      });

      return {
        response: completion.choices[0].message.content,
        category,
        suggestions: this.generateMentorSuggestions(category),
        tokensUsed: completion.usage?.total_tokens || 0
      };

    } catch (error) {
      console.error('AI Mentor Error:', error);
      return this.getFallbackMentorResponse(category, message);
    }
  }

  async chatWithShopper(message, userPreferences = {}) {
    if (!this.openai) {
      return this.getFallbackShopperResponse();
    }

    try {
      const contextPrompt = `${this.shopperPersonality.role}

      User Preferences:
      - Interests: ${(userPreferences.interests || []).join(', ')}
      - Budget: ${userPreferences.budget || 'flexible'}
      - Style: ${userPreferences.style || 'eclectic'}

      Help the user with their shopping question. Be knowledgeable about cultural crafts
      and their significance. Provide specific recommendations when possible.

      Question: ${message}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: contextPrompt }],
        max_tokens: 250,
        temperature: 0.7,
      });

      return {
        response: completion.choices[0].message.content,
        recommendations: this.generateShopperRecommendations(message),
        tokensUsed: completion.usage?.total_tokens || 0
      };

    } catch (error) {
      console.error('AI Shopper Error:', error);
      return this.getFallbackShopperResponse();
    }
  }

  async generatePricingSuggestion(productData) {
    // Simple pricing algorithm based on materials, complexity, and market factors
    const baseFactors = {
      materials: this.getMaterialValue(productData.materials),
      complexity: this.getComplexityScore(productData.techniques),
      cultural: this.getCulturalValue(productData.region),
      time: this.getTimeValue(productData.timeToMake)
    };

    const basePrice = Object.values(baseFactors).reduce((sum, val) => sum + val, 50);
    const marketMultiplier = 1.2; // Global market premium

    const suggestedPrice = Math.round(basePrice * marketMultiplier);

    return {
      suggestedPrice,
      priceRange: {
        min: Math.round(suggestedPrice * 0.8),
        max: Math.round(suggestedPrice * 1.4)
      },
      factors: baseFactors,
      reasoning: "Based on materials, cultural significance, crafting complexity, and global market demand"
    };
  }

  // Helper methods
  getFallbackProfile(basicInfo) {
    return {
      heritage: `${basicInfo.name} is a skilled ${basicInfo.craftType} artisan from ${basicInfo.location}, carrying forward generations of traditional craftsmanship. Their work represents the rich cultural heritage of their region, blending time-honored techniques with contemporary artistry.`,
      craftTwin: {
        personality: "Wise craftsperson sharing traditional knowledge",
        voice: "Warm and knowledgeable",
        catchphrase: "Every piece tells a story"
      },
      specialties: this.extractSpecialties(basicInfo.craftType),
      culturalContext: this.getCulturalContext(basicInfo.location, basicInfo.craftType)
    };
  }

  getFallbackProductDescription(productData) {
    return {
      description: `This beautiful ${productData.title} represents the finest in traditional craftsmanship. Carefully handcrafted using time-honored techniques, each piece tells a story of cultural heritage and artistic skill. Made from premium materials with attention to every detail, this unique item brings authenticity and beauty to any collection.`,
      seoTitle: `Authentic ${productData.title} - Traditional Handcrafted Art`,
      tags: ['handmade', 'traditional', 'authentic', 'cultural'],
      culturalStory: "This piece represents generations of traditional craftsmanship and cultural storytelling."
    };
  }

  getFallbackMentorResponse(category, message) {
    const responses = {
      business: "Focus on quality over quantity, build relationships with customers, and price your work fairly considering your skills and materials. Consider online marketplaces to reach global customers.",
      marketing: "Tell your story authentically. Share your process, cultural background, and passion. Use social media to showcase your work and connect with people who appreciate traditional crafts.",
      pricing: "Calculate your material costs, add fair compensation for your time and skill, then consider market demand. Don't undervalue your expertise and cultural knowledge."
    };

    return {
      response: responses[category] || responses.business,
      category,
      suggestions: this.generateMentorSuggestions(category),
      tokensUsed: 0
    };
  }

  getFallbackShopperResponse() {
    return {
      response: "I'd be happy to help you discover authentic handcrafted items! Each piece in our marketplace comes with its cultural story and represents genuine traditional craftsmanship. What type of items are you most interested in?",
      recommendations: [],
      tokensUsed: 0
    };
  }

  extractSpecialties(craftType) {
    const specialtyMap = {
      'Block Printing': ['Natural Dyes', 'Traditional Motifs', 'Hand Carving'],
      'Weaving': ['Traditional Looms', 'Pattern Design', 'Natural Fibers'],
      'Pottery': ['Hand Throwing', 'Traditional Glazing', 'Cultural Patterns'],
      'Jewelry': ['Metalwork', 'Stone Setting', 'Traditional Designs'],
      'Woodwork': ['Hand Carving', 'Traditional Joinery', 'Natural Finishes']
    };

    return specialtyMap[craftType] || ['Traditional Techniques', 'Handcrafting', 'Cultural Patterns'];
  }

  getCulturalContext(location, craftType) {
    return `${craftType} from ${location} represents a rich tradition of cultural expression and skilled craftsmanship passed down through generations.`;
  }

  generateSEOTitle(productData) {
    return `Authentic ${productData.title} - Traditional ${productData.category} from ${productData.region}`;
  }

  generateTags(productData) {
    const baseTags = ['handmade', 'traditional', 'authentic', 'cultural'];
    const craftTags = (productData.category || '').toLowerCase().split(' ');
    const regionTags = (productData.region || '').toLowerCase().split(' ');

    return [...baseTags, ...craftTags, ...regionTags].filter(tag => tag.length > 0);
  }

  generateCulturalStory(productData) {
    return `This ${productData.category} represents the rich cultural heritage of ${productData.region}, showcasing traditional techniques and meaningful craftsmanship.`;
  }

  generateMentorSuggestions(category) {
    const suggestions = {
      business: [
        "How do I calculate fair pricing?",
        "What platforms are best for selling online?",
        "How do I handle international shipping?",
        "Building customer relationships"
      ],
      marketing: [
        "Creating engaging social media content",
        "Photography tips for handmade items",
        "Writing compelling product descriptions",
        "Building an authentic brand story"
      ],
      pricing: [
        "Understanding material costs",
        "Pricing for different markets",
        "Seasonal pricing strategies",
        "Handling price negotiations"
      ]
    };

    return suggestions[category] || suggestions.business;
  }

  generateShopperRecommendations(query) {
    // Simple recommendation logic based on query keywords
    const keywords = query.toLowerCase();
    const recommendations = [];

    if (keywords.includes('textile') || keywords.includes('fabric')) {
      recommendations.push({
        type: 'product',
        title: 'Hand-woven Traditional Textiles',
        reason: 'Based on your interest in textiles'
      });
    }

    if (keywords.includes('home') || keywords.includes('decor')) {
      recommendations.push({
        type: 'category',
        title: 'Home Decor Collection',
        reason: 'Perfect for home decoration'
      });
    }

    return recommendations;
  }

  // Pricing calculation helpers
  getMaterialValue(materials = []) {
    const valueMap = {
      'silk': 50, 'cotton': 20, 'wool': 30, 'metal': 40, 'wood': 25,
      'ceramic': 15, 'stone': 35, 'glass': 20
    };

    return materials.reduce((sum, material) => {
      const found = Object.keys(valueMap).find(key => 
        material.toLowerCase().includes(key)
      );
      return sum + (valueMap[found] || 10);
    }, 0);
  }

  getComplexityScore(techniques = []) {
    const complexityMap = {
      'hand': 30, 'traditional': 25, 'intricate': 40, 'detailed': 35,
      'carved': 45, 'painted': 30, 'woven': 35
    };

    return techniques.reduce((sum, technique) => {
      const found = Object.keys(complexityMap).find(key => 
        technique.toLowerCase().includes(key)
      );
      return sum + (complexityMap[found] || 20);
    }, 0);
  }

  getCulturalValue(region = '') {
    const culturalPremium = {
      'india': 25, 'tibet': 35, 'peru': 30, 'mexico': 25, 'africa': 30,
      'china': 20, 'japan': 40, 'nepal': 30
    };

    const found = Object.keys(culturalPremium).find(key => 
      region.toLowerCase().includes(key)
    );
    return culturalPremium[found] || 15;
  }

  getTimeValue(timeString = '') {
    if (timeString.includes('day')) {
      const days = parseInt(timeString) || 1;
      return Math.min(days * 5, 100); // Cap at 100
    }
    return 20; // Default time value
  }
}

module.exports = new AIService();
