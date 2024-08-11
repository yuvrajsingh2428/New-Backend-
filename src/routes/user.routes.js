import { Router } from "express";
import { 
        loginUser, 
        logoutUser, 
        registerUser, 
        refreshAccessToken, 
        changeCurrentPassword, 
        getCurrentUser, 
        updateAccountDetails, 
        updateUserAvatar, 
        updateUserCoverImage, 
        getUserChannelProfile, 
        getWatchHistory
    } from "../controllers/user.controllers.js";

import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount:1                  //only accept one coverIamge
        }
    ]),            // this how we use middleware, use it just before the excuted method
    registerUser)   // userRouter will come here and if (/register) is called then it will call the method(registerUser) 

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)  // verify jwt is used bc user should be logged in for this operation

router.route("/refresh-token").post(refreshAccessToken)  //verifyJWT not used bc we have done all the decoded and work in user.controller.js

// change password 
router.route("/change-password").post(verifyJWT, changeCurrentPassword)  //verifying  jwt bc the operation can be only performed by the loggedin people

// get current user
router.route("/current-user").get(verifyJWT, getCurrentUser)

// update account details
router.route("/update-account").patch(verifyJWT, updateAccountDetails) // patch bs post will update all the details

//update user avatar
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

// update cover image
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

// get channel profile
router.route("/c/:username").get(verifyJWT, getUserChannelProfile) 

// get watch history
router.route("/history").get(verifyJWT, getWatchHistory)

export default router



