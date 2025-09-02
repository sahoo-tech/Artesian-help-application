const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dataService = require('../services/data.service');
const emailService = require('../services/email.service');
const { generateResponse } = require('../utils/helpers');

class AuthController {
  async register(req, res) {
    try {
      const { name, email, password, role, craftType, location } = req.body;

      console.log('Received registration request with name:', name);

      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      console.log('Split name into:', { firstName, lastName });

      // Check if user already exists
      const existingUser = await dataService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json(
          generateResponse(false, null, 'User with this email already exists')
        );
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user data
      const userData = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || 'buyer',
        isVerified: true, // Auto-verify for demo
        isActive: true,
        location,
        createdAt: new Date().toISOString()
      };

      // Add role-specific data
      if (role === 'artisan' && craftType) {
        userData.craftType = craftType;
        userData.artisanProfile = {
          heritage: `Passionate ${craftType} artisan preserving traditional techniques`,
          experience: 1,
          specialties: [craftType, 'Traditional Techniques'],
          rating: 5.0,
          totalOrders: 0
        };
      }

      if (role === 'buyer') {
        userData.culturalPassport = {
          points: 0,
          regionsExplored: [],
          achievements: ['New Member']
        };
        userData.interests = [];
      }

      // Create user
      const user = await dataService.create('users', userData);

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;

      res.status(201).json(
        generateResponse(true, {
          user: userResponse,
          token
        }, 'Registration successful')
      );

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Registration failed: ' + error.message)
      );
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await dataService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json(
          generateResponse(false, null, 'Invalid email or password')
        );
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json(
          generateResponse(false, null, 'Invalid email or password')
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json(
          generateResponse(false, null, 'Account is deactivated')
        );
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Update last login
      await dataService.update('users', user.id, {
        lastLoginAt: new Date().toISOString()
      });

      // Remove password from response
      const { password: _, ...userResponse } = user;

      res.json(
        generateResponse(true, {
          user: userResponse,
          token
        }, 'Login successful')
      );

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Login failed: ' + error.message)
      );
    }
  }

  async getProfile(req, res) {
    try {
      const user = await dataService.findById('users', req.user.id);
      if (!user) {
        return res.status(404).json(
          generateResponse(false, null, 'User not found')
        );
      }

      // Remove password from response
      const { password, ...userResponse } = user;

      res.json(
        generateResponse(true, { user: userResponse }, 'Profile retrieved successfully')
      );

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to get profile: ' + error.message)
      );
    }
  }

  async updateProfile(req, res) {
    try {
      const updates = req.body;
      const allowedUpdates = [
        'firstName', 'lastName', 'location', 'interests', 'avatar',
        'craftType', 'artisanProfile', 'culturalPassport'
      ];

      // Filter allowed updates
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      filteredUpdates.updatedAt = new Date().toISOString();

      const updatedUser = await dataService.update('users', req.user.id, filteredUpdates);

      // Remove password from response
      const { password, ...userResponse } = updatedUser;

      res.json(
        generateResponse(true, { user: userResponse }, 'Profile updated successfully')
      );

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to update profile: ' + error.message)
      );
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await dataService.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json(
          generateResponse(true, null, 'If account exists, password reset email sent')
        );
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id, email: user.email, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Save reset token to user (in production, you might store this separately)
      await dataService.update('users', user.id, {
        resetToken,
        resetTokenExpires: new Date(Date.now() + 3600000).toISOString() // 1 hour
      });

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(user, resetToken);
      } catch (emailError) {
        console.error('Password reset email failed:', emailError);
      }

      res.json(
        generateResponse(true, null, 'Password reset email sent')
      );

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Failed to send reset email: ' + error.message)
      );
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        return res.status(400).json(
          generateResponse(false, null, 'Invalid or expired reset token')
        );
      }

      if (decoded.type !== 'password_reset') {
        return res.status(400).json(
          generateResponse(false, null, 'Invalid reset token')
        );
      }

      // Find user
      const user = await dataService.findById('users', decoded.id);
      if (!user) {
        return res.status(400).json(
          generateResponse(false, null, 'User not found')
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and remove reset token
      await dataService.update('users', user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date().toISOString()
      });

      res.json(
        generateResponse(true, null, 'Password reset successful')
      );

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Password reset failed: ' + error.message)
      );
    }
  }

  async logout(req, res) {
    try {
      // In a more complex setup, you might invalidate the token
      res.json(
        generateResponse(true, null, 'Logout successful')
      );

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json(
        generateResponse(false, null, 'Logout failed: ' + error.message)
      );
    }
  }
}

module.exports = new AuthController();