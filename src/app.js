import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";     //used to access the user's browser cookies and can perform crud operations

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "10mb"}))  // limiting the data while filling form
app.use(express.urlencoded({extended: true, limit: "10mb"}))  // data coming from url
app.use(express.static("public"))        // storing assets like photos pdfs etc in the our public folder
app.use(cookieParser())


//routes import 

import userRouter from './routes/user.routes.js'

// routes declaration
// can't write app.get bc we were writing routes and controllers in one place but now routes are seperatly written
// now to bring router we have to bring middleware

app.use("/api/v1/users", userRouter) //if user goes in (users) then it will give control to userRouter - it will go in user.router.js file

// http:localhost:8000/api/v1/users/register

export { app }