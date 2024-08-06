 // require('dotenv').config({path:'./env'}) or
 import dotenv from "dotenv"
 import connectDB from "./db/index.js";

 dotenv.config({
    path: './env'
 })

connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port: ${process.env.PORT}`);
        
    })
})
.catch( (err) => {
    console.log("MONGO db connection failed !!!", err);
    
})



/*
import express from "express";
const app = express();
( async () => {                        //making iife 
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{                //(error) means recieving the error 
            console.log("ERROR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () =>{
            console.log('App is listening on port ${process.env.PORT}');
            
        })

    } catch (error){
        console.error("ERROR:", error)
        throw err
    }
})()
*/