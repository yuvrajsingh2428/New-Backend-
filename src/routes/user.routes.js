import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

import {upload} from "../middlewares/multer.middleware.js"

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


export default router