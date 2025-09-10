import mongoose from "mongoose"

const commentSchema = new mongoose.Schema(
  {
    recipeId: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    comment: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    likes: { type: [String], default: [] },
    isEdited: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

const Comment = mongoose.model("Comment", commentSchema)

export default Comment
