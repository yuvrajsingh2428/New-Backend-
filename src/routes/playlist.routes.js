import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from  "../controllers/playlist.controller.js"

const  router = Router();

router.use(verifyJWT);

//This defines a route for creating a new playlist. When a POST request is made to the root path (e.g., /playlists), 
//the createPlaylist function will be called to handle the request.

router.route("/").post(createPlaylist)  

//Operations on a Specific Playlist
router
    .route("/:playlistId") //This block handles operations on a specific playlist identified by playlistId
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)

// Add or Remove Video from a Playlist

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

//Get Playlists for a Specific User

router.route("/user/:userId").get(getUserPlaylists) // function to get all playlists associated with the user identified by userId.

export default router;