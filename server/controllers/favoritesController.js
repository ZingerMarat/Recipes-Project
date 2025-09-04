import db from "../db/models/index.js"
const { UserFavorite, Recipe } = db

export const addToFavorites = async (req, res) => {
  try {
    const recipeId = req.params.recipeId
    const userId = req.userID

    const recipe = await Recipe.findOne({ where: { id: recipeId } })

    if (!recipe) {
      return res.status(400).json({ error: "No recipe found" })
    }

    await UserFavorite.create({
      userId,
      recipeId,
    })

    res.status(200).json({ message: "Recipe added to favorites" })
  } catch (err) {
    res.status(500).json({ error: "addToFavorites failed: " + err })
  }
}

export const deleteFromFavorites = async (req, res) => {
  try {
    const recipeId = req.params.recipeId
    const userId = req.userID

    const favorite = await UserFavorite.findOne({ where: { recipeId, userId } })

    if (!favorite) {
      return res.status(400).json({ error: "No favorite found" })
    }

    await favorite.destroy()

    res.status(200).json({ message: "Recipe removed from favorites" })
  } catch (err) {
    res.status(500).json({ error: "deleteFromFavorites failed: " + err })
  }
}

export const getFavorites = async (req, res) => {
  try {
    const userId = req.userID

    const favorites = await Recipe.findAll({
      include: [
        {
          model: UserFavorite,
          where: { userId },
          attributes: [],
        },
      ],
    })

    if (!favorites.length) {
      return res.status(400).json({ error: "No favorites found for this user" })
    }

    res.status(200).json(favorites)
  } catch (err) {
    res.status(500).json({ error: "getFavorites failed: " + err })
  }
}
