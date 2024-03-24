try {
    // Attempt to import Mongoose
    const mongoose = require('mongoose');
    console.log('Mongoose is installed.');
    // Optionally, log Mongoose version
    console.log('Mongoose version:', mongoose.version);
} catch (error) {
    // If an error occurs during import, Mongoose is not installed
    console.error('Mongoose is not installed.');
}
