const multer = require("multer")

// General upload with memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3*1024*1024 //3MB
    }
})

// Profile image upload with validation
const profileImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5*1024*1024 // 5MB for profile images
    },
    fileFilter: (req, file, cb) => {
        // Allow only image file types
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        
        if (!allowedMimes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
        }
        
        cb(null, true);
    }
})

// Default export for backward compatibility with interview routes
module.exports = upload

// Named export for profile image upload
module.exports.profileImageUpload = profileImageUpload