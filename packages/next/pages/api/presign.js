const AWS = require('aws-sdk');

const handler = async (req, res) => {
  const { filename } = req.body;
	console.log('filename', filename);

  // Set up the S3 client
  const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

	console.log('filename?.path', filename?.path)
  // Generate a presigned URL for the S3 object
	const params = {
		Bucket: process.env.AWS_BUCKET,
		Key: filename?.path || "test.pdf",
		Expires: 3600,
		ContentType: 'application/pdf'
	};

  try {
    const url = await s3.getSignedUrlPromise('putObject', params);
    res.status(200).json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = handler;
