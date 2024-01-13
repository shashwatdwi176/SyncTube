import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "../src/app.js";

dotenv.config({
    path: './env'
})
connectDB()  //to connect mongoDb Atlas
.then(() => {  //  to run the database in the server
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
})
.catch((err) => {  
    console.log("MONGODB connection failed !", err);
})






/*
import express from "express";
const app = express()

;( async () => {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (error) => {
        console.log("App cannot connect to dtabase error : ",error);
        throw error
       })
       app.listen(process.env.PORT, () => {
        console.log(`App is listening on port ${process.env.PORT}`);
       })
    }
    catch(error){
        console.error("ERROR: ",error)
        throw err;
    }
})()

*/