import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";



export const verifyJWT = asyncHandler(async(req, res, next) => {    // like res is not in use we can use _ instead of res
   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")  // getting the token via cookie or header
 
    if (!token){
     throw new ApiError(401, "unauthorized request")
    }
 
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // verifying the token with help of jwt atleast you get the decoded token
 
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken") 
 
    if(!user){
     throw new ApiError(401, "Invalid Access Token")
    }
 
    req.user = user;
    next()
    
   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid access token")
   }

})