import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  const { filename } = req.query;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filename,
    Expires: 60 * 5, // 5 minutes
    ContentType: "binary/octet-stream",
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    res.status(200).json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating pre-signed URL");
  }
}
