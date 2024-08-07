import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {    //cb is callback and file holds bunch of files
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        
        cb(null, file.originalname) // getting the original file name as per user
    }
  })
  
export const upload = multer({ 
    storage,
})