import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken} from "../controllers/user.controllers.js";

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
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)  //verifyJWT not used bc we have done all the decoded and work in user.controller.js
 

export default router



