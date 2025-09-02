const dataService = require('../services/data.service');
const { generateResponse } = require('../utils/helpers');

class WorkshopController {
  async getAllWorkshops(req, res) {
    try {
      const workshops = await dataService.findAll('workshops');
      res.json(generateResponse(true, workshops, 'Workshops retrieved successfully'));
    } catch (error) {
      console.error('Get workshops error:', error);
      res.status(500).json(generateResponse(false, null, 'Failed to retrieve workshops'));
    }
  }
}

module.exports = new WorkshopController();