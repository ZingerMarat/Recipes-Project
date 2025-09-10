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

export const toggleLike = async (req, res, next) => {
  try {
    const commentId = req.params.commentId
    const userId = req.userID

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" })
    }

    let updated
    if (comment.likes.includes(userId)) {
      updated = await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likes: userId } },
        { new: true }
      )
    } else {
      updated = await Comment.findByIdAndUpdate(
        commentId,
        { $addToSet: { likes: userId } },
        { new: true }
      )
    }

    res.status(200).json(updated)
  } catch (err) {
    next(err)
  }
}
