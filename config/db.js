const mongoose = require('mongoose');
const config = require('config');
const { cyan } = require('colors');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(db, {
            useNewUrlParser: true,
            // useCreateIndex: true,
            // useFindAndModify: false,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline.bold);
    } catch (err) {
        console.log(err.message);

        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;