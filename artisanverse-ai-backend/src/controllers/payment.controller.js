const dataService = require('../services/data.service');
const emailService = require('../services/email.service');
const { generateResponse, generateOrderNumber, calculateShipping } = require('../utils/helpers');

class PaymentController {
  async createPaymentIntent(req, res) {
    try {
      const { items, shippingAddress, paymentMethod = 'stripe' } = req.body;
      const buyerId = req.user.id;

      if (req.user.role !== 'buyer') {
        return res.status(403).json(
          generateResponse(false, null, 'Only buyers can create payment intents')
        );
      }

      // Validate products and calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await dataService.findById('products', item.productId);
        if (!product || !product.isActive) {
          return res.status(400).json(
            generateResponse(false, null, `Product ${item.productId} is not available`)
          );
        }

        if ((product.inStock || 0) < item.quantity) {
          return res.status(400).json(
            generateResponse(false, null, `Insufficient stock for ${product.title}`)
          );
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          productId: product.id,
          artisanId: product.artisanId,
          title: product.title,
          description: product.description.substring(0, 200),
          quantity: item.quantity,
          price: product.price,
          images: product.images ? product.images.slice(0, 1) : [],
        });
      }

      // Calculate shipping
      const shippingCost = calculateShipping(orderItems, shippingAddress?.country === 'US' ? 'domestic' : 'international');
      const tax = subtotal * 0.08; // 8% tax (simplified)
      const total = subtotal + shippingCost + tax;

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Create order in pending state
      const order = await dataService.create('orders', {
        orderNumber,
        buyerId,
        items: orderItems,
        pricing: {
          subtotal: Math.round(subtotal * 100) / 100,
          shipping: shippingCost,
          tax: Math.round(tax * 100) / 100,
          total: Math.round(total * 100) / 100,
          currency: 'USD'
        },
        shipping: {
          address: shippingAddress,
          cost: shippingCost
        },
        payment: {
          method: paymentMethod,
          status: 'pending',
          currency: 'USD'
        },
        status: 'pending'
      });

      // Mock payment intent (in real implementation, this would call Stripe/PayPal/Razorpay)
      const paymentIntent = {
        id: `pi_mock_${Date.now()}`,
        clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        amount: Math.round(total * 100), // Amount in cents
        currency: 'usd',
        status: 'requires_payment_method',
        orderId: order.id,
        orderNumber: order.orderNumber
      };

      // Update order with payment intent ID
      await dataService.update('orders', order.id, {
        'payment.paymentIntentId': paymentIntent.id
      });

      res.json(
        generateResponse(true, {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.pricing.total,
            currency: order.pricing.currency
          },
          paymentIntent
        }, 'Payment intent created successfully')
      );

    } catch (error) {
      console.error('Create payment intent error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to create payment intent: ' + error.message)
      );
    }
  }

  async confirmPayment(req, res) {
    try {
      const { paymentIntentId, orderId } = req.body;

      const order = await dataService.findById('orders', orderId);
      if (!order) {
        return res.status(404).json(
          generateResponse(false, null, 'Order not found')
        );
      }

      if (order.buyerId !== req.user.id) {
        return res.status(403).json(
          generateResponse(false, null, 'Not authorized to confirm this payment')
        );
      }

      // Mock payment confirmation (in real implementation, verify with payment provider)
      const mockSuccess = Math.random() > 0.1; // 90% success rate for demo

      if (mockSuccess) {
        // Update order status
        const updatedOrder = await dataService.update('orders', orderId, {
          'payment.status': 'completed',
          'payment.transactionId': `txn_${Date.now()}`,
          'payment.paidAt': new Date().toISOString(),
          status: 'confirmed'
        });

        // Update product inventory
        for (const item of order.items) {
          const product = await dataService.findById('products', item.productId);
          if (product) {
            await dataService.update('products', item.productId, {
              inStock: Math.max(0, (product.inStock || 0) - item.quantity)
            });
          }
        }

        // Send confirmation email
        try {
          await emailService.sendOrderConfirmation(updatedOrder, req.user);
        } catch (emailError) {
          console.error('Order confirmation email failed:', emailError);
        }

        res.json(
          generateResponse(true, {
            order: {
              id: updatedOrder.id,
              orderNumber: updatedOrder.orderNumber,
              status: updatedOrder.status,
              paymentStatus: updatedOrder.payment.status
            }
          }, 'Payment confirmed successfully')
        );

      } else {
        // Payment failed
        await dataService.update('orders', orderId, {
          'payment.status': 'failed',
          status: 'cancelled'
        });

        res.status(400).json(
          generateResponse(false, null, 'Payment failed. Please try again.')
        );
      }

    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to confirm payment: ' + error.message)
      );
    }
  }

  async getPaymentMethods(req, res) {
    try {
      const methods = [
        {
          id: 'stripe',
          name: 'Credit/Debit Card',
          type: 'card',
          description: 'Secure payment with Stripe',
          supported: true,
          currencies: ['USD', 'EUR', 'GBP', 'CAD']
        },
        {
          id: 'paypal',
          name: 'PayPal',
          type: 'wallet',
          description: 'Pay with your PayPal account',
          supported: true,
          currencies: ['USD', 'EUR', 'GBP']
        },
        {
          id: 'razorpay',
          name: 'UPI/Cards (India)',
          type: 'local',
          description: 'UPI, Cards, Net Banking',
          supported: true,
          currencies: ['INR']
        }
      ];

      res.json(
        generateResponse(true, { paymentMethods: methods }, 'Payment methods retrieved successfully')
      );

    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get payment methods: ' + error.message)
      );
    }
  }

  async getOrderStatus(req, res) {
    try {
      const { orderId } = req.params;

      const order = await dataService.findById('orders', orderId);
      if (!order) {
        return res.status(404).json(
          generateResponse(false, null, 'Order not found')
        );
      }

      // Check authorization
      if (order.buyerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json(
          generateResponse(false, null, 'Not authorized to view this order')
        );
      }

      // Get product details for order items
      const itemsWithProducts = await Promise.all(
        order.items.map(async (item) => {
          const product = await dataService.findById('products', item.productId);
          return {
            ...item,
            product: product ? {
              title: product.title,
              images: product.images
            } : null
          };
        })
      );

      const orderWithDetails = {
        ...order,
        items: itemsWithProducts
      };

      res.json(
        generateResponse(true, { order: orderWithDetails }, 'Order status retrieved successfully')
      );

    } catch (error) {
      console.error('Get order status error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get order status: ' + error.message)
      );
    }
  }

  async getUserOrders(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const userId = req.user.id;

      let filters = {};

      if (req.user.role === 'buyer') {
        filters.buyerId = userId;
      } else if (req.user.role === 'artisan') {
        // Get orders containing artisan's products
        const orders = await dataService.findAll('orders');
        const artisanOrders = orders.filter(order => 
          order.items.some(item => item.artisanId === userId)
        );

        if (status) {
          const filteredOrders = artisanOrders.filter(order => order.status === status);
          return res.json(
            generateResponse(true, { orders: filteredOrders }, 'Orders retrieved successfully')
          );
        }

        return res.json(
          generateResponse(true, { orders: artisanOrders }, 'Orders retrieved successfully')
        );
      } else {
        return res.status(403).json(
          generateResponse(false, null, 'Not authorized to view orders')
        );
      }

      if (status) {
        filters.status = status;
      }

      const orders = await dataService.findAll('orders', filters);

      // Sort by creation date (newest first)
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json(
        generateResponse(true, { orders }, 'Orders retrieved successfully')
      );

    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get orders: ' + error.message)
      );
    }
  }
}

module.exports = new PaymentController();
