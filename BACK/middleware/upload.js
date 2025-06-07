const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/');
    console.log('Chemin de destination:', uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Nom du fichier généré:', fileName);
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('Type MIME du fichier:', file.mimetype);
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    console.error('Fichier non autorisé:', file.mimetype);
    cb(new Error('Seules les images sont autorisées!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB max
});

module.exports = upload;
