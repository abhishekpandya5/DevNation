const express = require('express');
const colors = require('colors');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();

// Connect Database
connectDB();

// Initialize Body Parser middleware for req.body
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
	res.send('Api running');
});

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
	console.log(`Server is running on port ${PORT}`.yellow.bold)
);

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red);
	// close server and exit process
	server.close(() => process.exit(1)); // for exit with failure, we pass 1 to exit.
});
