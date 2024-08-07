import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async (req, res) => {
    res.status(200).json({    // (/register) is called then it will give response 200(last video-http server) and json "ok"
        message:"api is working"
    })
})



export {
    registerUser,
}