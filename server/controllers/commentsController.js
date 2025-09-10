import Comment from "../mongoDB/models/commentSchema.js"

export const editComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId

    const newData = {
      comment: req.body.comment,
      rating: req.body.rating,
      isEdited: true,
    }

    const updated = await Comment.findByIdAndUpdate(commentId, newData, {
      new: true,
      runValidators: true,
    })

    if (!updated) return res.status(404).json({ success: false, message: "Comment not found" })

    res.status(200).json(updated)
  } catch (err) {
    next(err)
  }
}
