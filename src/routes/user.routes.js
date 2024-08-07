import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router()

router.route("/register").post(registerUser)   // userRouter will come here and if (/register) is called then it will call the method(registerUser) 
export default router