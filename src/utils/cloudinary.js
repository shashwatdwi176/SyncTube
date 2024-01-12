import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; //This id used for file handling it is inbuilt package of node for file operation fs stands for file system

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (loacalFilePath) => {
  try {
    if (!loacalFilePath) return null; //check if no file is selected to upload

    //upload on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // set the file type can be upload
    });
    //file uploaded successfully
    console.log("File uploaded successfully on cloudinary !!!", reponse.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
