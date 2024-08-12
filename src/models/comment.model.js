import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    }, 
    {
        Timestamp: true
})

commentSchema.plugin(mongooseAggregatePaginate) // work of plugin is to from where to where it is providing the video


export const Comment = mongoose.model("Comment", commentSchema)