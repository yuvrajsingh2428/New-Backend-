import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req, res) => {

    // res.status(200).json({    // (/register) is called then it will give response 200(last video-http server) and json "ok"
    //     message:"api is working"
    
    //making a user registration
    //1. get user details from fronted
    // 2.validation - not empty
    // 3.check if user alredy exist: username, email
    //  4.check for images, check for avatar
    // 5.upload them to cloudinary, avatar
    // 6.create user object - create entry in db
    // 7.remove password and refresh token field from response
    // 8.check for user creation
    // 9.return res

    const {fullName, email, username, password} = req.body  //1     //all the data come in req.body
    console.log("email:", email);

    if (                                                      //2
        [fullName, email, username, password].some((field) => field?.trim() === "") 
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = User.findOne({                       //3
        $or: [{ username }, { email }]            // by using $or we can check that user exist or not with same email and username
    })

    if (existedUser){
        throw new ApiError(409, "User with email or username exist")
    }

    //4  //req.body is given by express and req.files is given by multer
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }


    //5  //await is used because it will take time to upload and thats why have used async
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //checking if avatar is uploaded or not bc it is important field 
    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    //6 entry in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",        // we have not checked above that coverimage is uploaded or not so checking here if not uploaded return empty
        email,
        password,
        username: username.toLowerCase()
    })

        //7 

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"      // this the way you can remove by using - sign              
    )
        //8
    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //9
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export {
    registerUser,
}