const { Storage } = require('@google-cloud/storage');
const multer = require('multer');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

const uploadToGCS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('No file uploaded');
    }

    const newFileName = `${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (error) => {
      console.error('Error uploading to GCS:', error);
      reject(`Something went wrong uploading to GCS: ${error.message}`);
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
      resolve({
        url: publicUrl,
        publicId: fileUpload.name
      });
    });

    blobStream.end(file.buffer);
  });
};

module.exports = { upload, uploadToGCS };