#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Setting up Shree Mahakali Dairy E-commerce Platform ===${NC}"

# Create frontend directory
echo -e "${GREEN}Creating project directories...${NC}"
mkdir -p smd-ecommerce
cd smd-ecommerce

# Initialize frontend with Next.js
echo -e "${GREEN}Initializing Next.js frontend...${NC}"
npx create-next-app@latest frontend --typescript --eslint --tailwind --app --src
cd frontend

# Install additional dependencies
echo -e "${GREEN}Installing frontend dependencies...${NC}"
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-tabs lucide-react next-themes recharts ai @ai-sdk/openai class-variance-authority clsx tailwindcss-animate

# Create backend directory
echo -e "${GREEN}Setting up backend...${NC}"
cd ..
mkdir -p backend
cd backend

# Initialize backend with Node.js
echo -e "${GREEN}Initializing Node.js backend...${NC}"
npm init -y
npm install express cors mysql2 dotenv bcrypt jsonwebtoken multer

# Create backend structure
mkdir -p src/{controllers,models,routes,middleware,config,utils}

# Create basic backend files
echo -e "${GREEN}Creating backend structure...${NC}"

# Create .env file
cat > .env << EOL
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=smd_dairy
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
EOL

# Create server.js
cat > src/server.js << EOL
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Shree Mahakali Dairy API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
EOL

# Create database connection
cat > src/config/db.js << EOL
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
EOL

# Create product routes
cat > src/routes/productRoutes.js << EOL
const express = require('express');
const router = express.Router();
const { 
  getAllProducts, 
  getProductById, 
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);

// Protected admin routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
EOL

# Create auth routes
cat > src/routes/authRoutes.js << EOL
const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
EOL

# Create order routes
cat > src/routes/orderRoutes.js << EOL
const express = require('express');
const router = express.Router();
const { 
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
EOL

# Create AI routes
cat > src/routes/aiRoutes.js << EOL
const express = require('express');
const router = express.Router();
const { askProductQuestion } = require('../controllers/aiController');

router.post('/ask', askProductQuestion);

module.exports = router;
EOL

# Create auth middleware
cat > src/middleware/authMiddleware.js << EOL
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const [rows] = await pool.query(
        'SELECT id, name, email, is_admin FROM users WHERE id = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      req.user = {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        isAdmin: rows[0].is_admin === 1
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
EOL

# Create product controller
cat > src/controllers/productController.js << EOL
const pool = require('../config/db');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE category_id = ?',
      [req.params.categoryId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  const { 
    name, 
    description, 
    price, 
    discounted_price, 
    image, 
    category_id, 
    in_stock 
  } = req.body;

  try {
    const [result] = await pool.query(
      \`INSERT INTO products (name, description, price, discounted_price, image, category_id, in_stock) 
       VALUES (?, ?, ?, ?, ?, ?, ?)\`,
      [name, description, price, discounted_price, image, category_id, in_stock]
    );

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  const { 
    name, 
    description, 
    price, 
    discounted_price, 
    image, 
    category_id, 
    in_stock 
  } = req.body;

  try {
    const [result] = await pool.query(
      \`UPDATE products 
       SET name = ?, description = ?, price = ?, discounted_price = ?, 
           image = ?, category_id = ?, in_stock = ? 
       WHERE id = ?\`,
      [name, description, price, discounted_price, image, category_id, in_stock, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
};
EOL

# Create auth controller
cat > src/controllers/authController.js << EOL
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    if (result.insertId) {
      res.status(201).json({
        id: result.insertId,
        name,
        email,
        isAdmin: false,
        token: generateToken(result.insertId),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin === 1,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      isAdmin: req.user.isAdmin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Get user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Update fields
    const updatedName = name || user.name;
    const updatedEmail = email || user.email;

    let query = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    let params = [updatedName, updatedEmail, req.user.id];

    // If password is provided, hash it and update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
      params = [updatedName, updatedEmail, hashedPassword, req.user.id];
    }

    await pool.query(query, params);

    res.json({
      id: req.user.id,
      name: updatedName,
      email: updatedEmail,
      isAdmin: req.user.isAdmin,
      token: generateToken(req.user.id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
EOL

# Create order controller
cat > src/controllers/orderController.js << EOL
const pool = require('../config/db');

// Create new order
const createOrder = async (req, res) => {
  const { 
    orderItems, 
    shippingAddress, 
    paymentMethod, 
    itemsPrice, 
    taxPrice, 
    shippingPrice, 
    totalPrice 
  } = req.body;

  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // Create order
    const [orderResult] = await pool.query(
      \`INSERT INTO orders 
        (user_id, shipping_address, payment_method, items_price, tax_price, shipping_price, total_price, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')\`,
      [req.user.id, JSON.stringify(shippingAddress), paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of orderItems) {
      await pool.query(
        \`INSERT INTO order_items 
          (order_id, product_id, name, quantity, price, size) 
         VALUES (?, ?, ?, ?, ?, ?)\`,
        [orderId, item.id, item.name, item.quantity, item.price, item.size ? JSON.stringify(item.size) : null]
      );
    }

    // Commit transaction
    await pool.query('COMMIT');

    // Get the created order
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Order not found' });
    }

    const [orderItems] = await pool.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );

    const order = {
      ...orders[0],
      orderItems,
      shippingAddress: JSON.parse(orders[0].shipping_address),
    };

    res.status(201).json(order);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the user is authorized to view this order
    if (!req.user.isAdmin && orders[0].user_id !== req.user.id) {
