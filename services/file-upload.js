const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
  // secretAccessKey: "yrFbCGJIGPtMxVZmwu1nRO1MEVCrh4uwkCR7f8dh",
  secretAccessKey: process.env.AWS_SECRET_ACCESS,
  // accessKeyId: "AKIAT6X3REPYFW2KZYWM",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  region: "us-east-2",
});

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "some-bucket",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});
