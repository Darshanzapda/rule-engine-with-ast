const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); // Ensure this is included
const ruleRoutes = require('./routes/ruleRoutes'); // Ensure this is included

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allow all origins for development (you can restrict this in production)
app.use(cors({
  origin: '*',  // Replace '*' with your frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Define a root route for a basic health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Connect to MongoDB
mongoose.connect('mongodb://mongodb:27017/rule_system')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);  // Register the auth routes
app.use('/api/rules', ruleRoutes); // Ensure rule routes are present

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
