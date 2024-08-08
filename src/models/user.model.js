import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userScehma = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,                // use remove whitespaces and 
            index:true,               // To enable the searching field and helps
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,            
        },
        fullName:{
            type: String,
            required: true,
            trim: true,  
            index: true,          
        },
        avatar:{
            type: String,   // using the url of cloudinary url
            required: true,           
        },
        coverImage:{
            type: String   // cloudnary url
        },
        watchHistory:[{
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    }

    },
    {
        timestamps: true
    }
)

userScehma.pre("save", async function (next) {       // pre hook is on save 
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)   // encrypting the password while saving 
    next()     // not used await in above line error was that in mongodb atlas database the password was not encrypted 
})

userScehma.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userScehma.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userScehma.methods.generateRefreshToken =function(){
    return jwt.sign(    // not written return here showing this TypeError: Cannot read properties of undefined (reading '_id')
        {   
        _id: this._id,
    
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userScehma)