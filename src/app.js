import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";     //used to access the user's browser cookies and can perform crud operations

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb "}))  // limiting the data while filling form
app.use(express.urlencoded({extended: true, limit: "16kb"}))  // data coming from url
app.use(express.static("public"))        // storing assets like photos pdfs etc in the our public folder
app.use(cookieParser())

export { app }