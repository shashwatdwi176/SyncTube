import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //logic for user registration

  //get user details from frontend
  //validation -  not empty, correct format of name email etc
  // check if user already exist : username , email
  //check for images, avatar
  //upload them to cloudinary
  //create user object - create entry in db
  //remove password and refresh tokens field from response
  // check for user creation
  //return response

  const { fullName, email, username, password } = req.body; //get user details
  console.log("email", email);

  //Validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "") //.some is a method similar to map
    // in this way we check all field at a single time we don't have to write the validation for each fields
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // check if user already exist : username , email

  const existedUser = User.findOne({
    $or: [{ username }, { email }], //$ is the operator
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  //check for images, avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //files get into server
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

    //upload them to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar){
        throw new ApiError(400, "Avatar is required");
    }

    //create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken" //removing password and refreshToken "-" sign remove the password and refreshToken
    )  //checking user is created or not find by id is inbuilt function of mongodb

    //checking user creation
    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user")
    }

      //return response

    return res.status(201).json(
        new ApiResponse(200, createdUser , "User registered Successfully")
    )
});

export { registerUser };
