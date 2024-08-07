import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

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

userScehma.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)   // encrypting the password while saving 
    next()    
})

userScehma.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userScehma.methods.generateAccessToken = function(){
    jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: ptocess.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userScehma.methods.generateRefreshToken =function(){}
jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
},
process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
}
)

export const User = mongoose.model("User", userScehma)