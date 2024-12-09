import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region =process.env.AWS_REGION || 'ap-south-1';

const s3Client = new S3Client({
  region:'ap-south-1', 
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

export const  getPresignedUrl=  async (key)=>{
  const command = new GetObjectCommand({
    Bucket:"cloudstorageimranf620.dev",
    Key:key,
  })
  const url = await getSignedUrl(s3Client, command);
  return url;
}

async function getUrl(){

  console.log("url is", await getPresignedUrl('download.png'))
}
getUrl()



async function putObj(filename,contentType) {
  const command = new PutObjectCommand({
    Bucket: "cloudstorageimranf620.dev",
    Key: `/uploads/user-upload/${filename}`,
    ContentType:contentType
    
  })
  const url = await getSignedUrl(s3Client, command);
  return url;
}

async function putUrl(){

  console.log("url is", await putObj(`image-${Date.now()}`, `image/png`))
}
putUrl()


// export const getPresignedUrl = async (req, res) => {


//   try {
//     const { fileName, fileType } = req.body;
//     console.log(fileName)

//     if (!fileName || !fileType) {
//       return res.status(400).json({ message: 'File name and type are required.' });
//     }

//     const params = {
//       Bucket: process.env.BUCKET_NAME,
//       Key: `uploads/${fileName}`,
//       ContentType: fileType,
//       Expires: 3600, // Ensure this is a valid timestamp in seconds
//     };

//     // Ensure Expires is correctly calculated
//     const expirationTime = new Date();
//     expirationTime.setSeconds(expirationTime.getSeconds() + 3600); // Set expiration to 1 hour from now
    
//     const command = new PutObjectCommand({
//       ...params,
//       Expires: expirationTime,  // Use valid expiration date
//     });

//     const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

//     // Returning the URL and other fields needed for uploading to S3
//     res.status(200).json({ url, fields: params });
//   } catch (error) {
//     console.error('Error generating presigned URL:', error);
//     res.status(500).json({ message: 'Error generating pre-signed URL' });
//   }
// };
