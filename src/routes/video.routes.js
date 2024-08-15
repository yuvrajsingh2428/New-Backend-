import { Router } from "express";

//These are used for handling HTTP requests, managing video data, authentication, and file uploads
import { verifyJWT } from "../middlewares/auth.middleware";

import {upload} from "../middlewares/multer.middleware.js"

import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js"

const router = Router()

router.use(verifyJWT)

//Defines routes for handling HTTP GET and POST requests on the root path (/).
router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields ([
            {
                name: "videoId",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishAVideo
    )

router.route("/user/:userId").get(getVideoById)

// Dynamic Route with Parameter:
router
    .route("/:videoId")
    .get(getVideoById)
    .patch(upload.single("thumbnail"), updateVideo)
    .delete(deleteVideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router