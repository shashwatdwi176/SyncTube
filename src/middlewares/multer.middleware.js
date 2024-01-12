//In this we save the file in our server then we upload it on cloudinary

import multer from "multer"; 

const storage = multer.diskStorage({
    destination: function(req,res, cb){
        cb(null , "./public/temp") // in temp all the files are getting stored
    },
    filename: function (req, file, cb){
        cb (null, file.organisation) //the filename has same as orginal filename uploaded by user 
    }
})

export const upload = multer ({
    storage,
})