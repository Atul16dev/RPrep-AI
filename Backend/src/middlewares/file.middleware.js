const multer = require("multer")

// Resume PDFs are parsed from memory rather than written to local temporary files.
const upload = multer({
    storage: multer.memoryStorage(),
    // Enforce upload limits before the application parses or uploads the files.
    limits: {
        fileSize: 3*1024*1024
    }
})

const profileImageUpload = multer({
    storage: multer.memoryStorage(),
    // Keep profile image uploads bounded before they are forwarded to Cloudinary.
    limits: {
        fileSize: 5*1024*1024
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        
        if (!allowedMimes.includes(file.mimetype)) {
            return cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
        }
        
        cb(null, true);
    }
})

module.exports = upload

module.exports.profileImageUpload = profileImageUpload