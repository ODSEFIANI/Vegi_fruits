const multer = require('multer');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder where images will be stored
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename for the uploaded image
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

// Define file filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error('Only JPEG and PNG images are allowed'), false);
  }
};

// Set up multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
  },
  fileFilter: fileFilter
});

// Controller function for handling image uploads
const uploadImage = (req, res) => {
  // If no file is uploaded, return an error
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  
  // Get the file path of the uploaded image
  const imagePath = req.file.path;
  
  // You can then save this imagePath to your database or use it in your application as needed
  
  // Return the uploaded image path
  res.status(201).json({ imagePath: imagePath });
};

module.exports = {
  upload: upload,
  uploadImage: uploadImage
};
