import S3 from 'aws-sdk/clients/s3';

import dotenv from 'dotenv';
import { ImageType } from '../constant/image_type';
import appError from '../utils/errorHelper';
import { logger } from '../logger/Logger';
import { ErrorType } from '../utils/errorTypes';
import axios from 'axios';
dotenv.config({ path: './.env' });

const region = process.env.AWS_BUCKET_REGION;
const bucket = process.env.AWS_BUCKET;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const env = process.env.NODE_ENV;
let AWS_config: any = {
  region,
  bucket,
  signatureVersion: 'v4',
};

if (env === 'development') {
  AWS_config = { ...AWS_config, accessKeyId, secretAccessKey };
}
const s3 = new S3(AWS_config);



const getImageFromS3 = async name => {
  if (!name) {
    throw new appError('Please send key', ErrorType.validation_error);
  }
  const params = {
    Bucket: bucket,
    Key: name,
    // ContentType: 'application/*',
    Expires: 60 * 30,
  };
  const resultUrl = await s3.getSignedUrlPromise('getObject', params);
  return resultUrl;
};
const getFileExtension = filename => {
  const extension = filename.split('.').pop();
  return extension;
};

const getFileName = async (key, imageId, image) => {

  switch (parseInt(key)) {
    case ImageType.BRAND_NAME:
      if (!imageId) {
        throw new appError('Please enter valid vendor id!', ErrorType.validation_error);
      }
      return `Doc_images/${new Date().getTime()}/${imageId}.${getFileExtension(image.name)}`;

    default:
      throw new appError('Please provide valid id of image type!', ErrorType.validation_error);
  }
};

const deletefile = async name => {
  try {
    if (!name) {
      throw new appError('Please send key', ErrorType.validation_error);
    }
    const deleteData = await s3.deleteObject({
      Bucket: bucket,
      Key: name
    }).promise();

    return deleteData;
  } catch (error) {
    logger.error(`error occurred while deleting file in s3 ${error}`);
  }
};

const uploadImageToS3 = async (imageType, imageId, image) => {

  if (imageType === undefined) {
    throw new appError('Please provide image type', ErrorType.validation_error);
  }
  if (imageId === undefined) {
    throw new appError('Please provide valid id of image to upload!', ErrorType.validation_error);
  }
  if (!image?.data) {
    throw new appError('Please provide image', ErrorType.validation_error);
  }
  const fileName = await getFileName(imageType, imageId, image);
  const uploadParams = {
    Bucket: bucket,
    Key: fileName,
    ContentType: image.mimetype,
    Body: image.data,
  };
  const { Location } = await s3.upload(uploadParams).promise();
  if (!Location) {
    throw new appError('something is wrong please  try agin', ErrorType.unknown_error);
  }
  const obj = {
    url: Location,
    key: fileName,
  };
  return obj;
};

const getUploadUrl = async (fileName) => {
  if (!fileName) {
    throw new appError('Please send fileName', ErrorType.validation_error);
  }
  const uploadParams = {
    Bucket: bucket,
    Key: fileName,
    Expires: 60 * 5,
  };
  const result = await s3.getSignedUrlPromise('putObject', uploadParams);
  return result;
};



const uploadBackUpFileToS3 = async (fileName, fileData) => {
  const headers = {
    Accept: '*/*',
    ContentType: 'application/sql'
  };
  try {
    // const { Location } = await s3.upload(uploadParams).promise();
    // if (!Location) {
    //   throw new appError('something is wrong please try agin', ErrorType.unknown_error);
    // }
    // const obj = {
    //   url: Location,
    //   key: fileName,
    // };
    // return obj;

    const uploadUrl = await getUploadUrl(fileName);

    const uploadResult: any = await axios.put(uploadUrl, fileData, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (uploadResult.status !== 200) {
      throw Error("Somwthinf went wrong");
    }
    return { ...uploadResult, fileName };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

const updateImageToS3 = async (key, image) => {

  if (!image?.data) {
    throw new appError('Please provide image', ErrorType.validation_error);
  }

  if (!key) {
    throw new appError('Please provide image', ErrorType.validation_error);
  }
  const uploadParams = {
    Bucket: bucket,
    Key: key,
    ContentType: image.mimetype,
    Body: image.data,
  };
  const { Location } = await s3.upload(uploadParams).promise();
  if (!Location) {
    throw new appError('something is wrong please  try agin', ErrorType.unknown_error);
  }
  return Location;
};

export {
  uploadImageToS3,
  getFileName,
  deletefile,
  updateImageToS3,
  uploadBackUpFileToS3,
  getImageFromS3
};
