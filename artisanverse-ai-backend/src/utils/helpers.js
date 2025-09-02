// Helper utility functions
const crypto = require('crypto');

const generateResponse = (success, data = null, message = '', metadata = {}) => {
  return {
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...metadata
  };
};

const generateId = () => {
  return crypto.randomUUID();
};

const paginate = (items, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);

  return {
    items: paginatedItems,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(items.length / limit),
      totalItems: items.length,
      hasNext: offset + limit < items.length,
      hasPrev: page > 1
    }
  };
};

const formatCurrency = (amount, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  });
  return formatter.format(amount);
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `AV-${timestamp}-${randomPart}`.toUpperCase();
};

const calculateShipping = (items, destination = 'domestic') => {
  const baseShipping = destination === 'international' ? 25.00 : 9.99;
  const weightFactor = items.reduce((total, item) => total + (item.quantity * 0.5), 0);
  const itemFactor = items.length * 2.00;

  return Math.round((baseShipping + weightFactor + itemFactor) * 100) / 100;
};

const generateSKU = (productTitle, category) => {
  const categoryCode = category.substr(0, 3).toUpperCase();
  const titleCode = productTitle.replace(/[^a-zA-Z0-9]/g, '').substr(0, 5).toUpperCase();
  const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${categoryCode}-${titleCode}-${randomCode}`;
};

const formatDateString = (date, locale = 'en-US') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const parseSearchQuery = (query) => {
  if (!query || typeof query !== 'string') return {};

  const terms = query.toLowerCase().split(' ').filter(term => term.length > 0);

  return {
    terms,
    regex: new RegExp(terms.join('|'), 'i'),
    exact: query.toLowerCase()
  };
};

const calculateRating = (reviews = []) => {
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

const generateColorFromString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

module.exports = {
  generateResponse,
  generateId,
  paginate,
  formatCurrency,
  slugify,
  calculateDistance,
  validateEmail,
  sanitizeFilename,
  generateOrderNumber,
  calculateShipping,
  generateSKU,
  formatDateString,
  parseSearchQuery,
  calculateRating,
  generateColorFromString,
  debounce,
  throttle,
  deepClone,
  isValidUrl
};
