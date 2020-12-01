const express = require('express');
const colors = require('colors');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

app.get('/', (req, res) => {
    res.send("hello")
})

const PORT = process.env.PORT | 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`.yellow.bold));


// Handle Unhandled Promise Rejections
/* process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // close server and exit process
    server.close(() => process.exit(1)); // for exit with failure, we pass 1 to exit.
}); */

