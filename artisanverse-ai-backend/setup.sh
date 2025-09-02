#!/bin/bash

echo "🎨 Setting up ArtisanVerse AI Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file - please configure it with your API keys"
else
    echo "⚙️  .env file already exists"
fi

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p public/uploads/avatar
mkdir -p public/uploads/productImages
mkdir -p public/uploads/document
mkdir -p public/uploads/model
mkdir -p public/uploads/general

# Create data directory
echo "📊 Creating data directory..."
mkdir -p src/data

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Configure your .env file with:"
echo "   - OpenAI API key (for AI features)"
echo "   - Gmail SMTP settings (for emails)"
echo "   - JWT secret (for security)"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. The API will be available at:"
echo "   http://localhost:5000"
echo ""
echo "4. Test with health check:"
echo "   curl http://localhost:5000/health"
echo ""
echo "📚 Check README.md for detailed documentation"
echo ""
echo "🤖 Test credentials:"
echo "   Buyer: sarah@example.com / password123"
echo "   Artisan: meera@example.com / password123"
echo "   Admin: admin@example.com / admin123"
echo ""
echo "🌟 Your AI-powered marketplace backend is ready!"
