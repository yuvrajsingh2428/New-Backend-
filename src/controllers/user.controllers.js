import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


//5a
const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) // bc while saving mongdb will kickin password so using validateBeforeSave
        
        //returning the refreshtoken and access token after generating and saving it
        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

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

    const {fullName, email, username, password} = req.body;  //1     //all the data come in req.body
   // console.log("email:", email);

    if (                                                      //2
        [fullName, email, username, password].some((field) => field?.trim() === "") 
    ) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({        //3  // not used await so error showing 409 conflict in postman
        $or: [{ username }, { email }]            // by using $or we can check that user exist or not with same email and username
    })

    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    //console.log(req.files);

    //4  //req.body is given by express and req.files is given by multer
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }


    //5  //await is used because it will take time to upload and thats why have used async
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log("Avatar upload response:", avatar);
    console.log("Cover image upload response:", coverImage);

    //checking if avatar is uploaded or not bc it is important field 
    if(!avatar){
        throw new ApiError(400, "Avatar file is not uploaded, its is necessary")
    }

    //6 entry in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",   // we have not checked above that coverimage is uploaded or not so checking here if not uploaded return empty
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

const loginUser = asyncHandler(async (req, res) => {
    //1. req body -> data
    //2. username or email base access
    //3. find the user 
    //4. password check
    //5a&b.access and refresh token (to send the user)
    //6. send cookie

//1
    const {email, username, password } = req.body
    console.log(email);
    

    //if (!(username || email)){   //use this if you need one of them
    if (!username && !email){
        throw new ApiError(400, "username or email is required")
    }
//2
    const user = await User.findOne({  // if only finding through email User.findOne({email}) but we want to check on both so,
        $or: [{username}, {email}]     // find user on basis of email or username
    })
//3  
    if (!user){
        throw new ApiError(404, "User does not exist")
    }
//4    
    const isPasswordValid = await user.isPasswordCorrect(password)  // comparing the password

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }
//5b
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id) 

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
//6
    const options = {
        httpOnly: true,   // by default cookies can be modified by anyone in frontend but,
        secure: true      // after using these two it(cookie) will be modifiable by server only
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)  // sending cookies like as many you want
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken  //sending to user
            },
            "User logged in Successfully"
        )
    )


})

// user logout format

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
//clearin cookies after recieving the tokens and clearing it
    const options = {
        httpOnly: true,   
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

// making end point of refresh token befor that we have to make controller

const refreshAccessToken = asyncHandler(async (req, res) => 
    {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken    // req.body.refreshToken using bc when user is using from phone
    
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request(incomingRefreshToken)")
    }

    // verifying the incoming refresh token
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        // matching the incoming refresh token from user and the token we have
        if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
    
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        // after comaring the access token and refresh token if find matched then generating new
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
        
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken 

}

// to logout a user we made a middleware named auth.middleware.js 