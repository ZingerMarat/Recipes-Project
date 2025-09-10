import { Op } from "sequelize"

import db from "../db/models/index.js"
const { Recipe } = db

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import Comment from "../mongoDB/models/commentSchema.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const getAllRecipes = async (req, res, next) => {
  //GET /recipes?difficulty=easy%20medium&maxCookingTime=30&search=pasta%20tomato&sort=rating&order=desc

  try {
    const { difficulty, maxCookingTime, search, sort, order = "asc" } = req.query
    const where = {}

    if (difficulty) {
      where.difficulty = { [Op.or]: difficulty.split(" ") }
    }
    if (maxCookingTime) {
      where.cookingTime = { [Op.lte]: maxCookingTime }
    }
    if (search) {
      where.title = { [Op.like]: `%${search}%` }
      where.description = { [Op.like]: `%${search}%` }
    }

    let orderBy = []

    if (sort) {
      orderBy.push([sort, order.toUpperCase() === "DESC" ? "DESC" : "ASC"])
    }

    const recipes = await Recipe.findAll({ where, order: orderBy })

    if (!recipes.length) {
      return res.status(404).json({ message: "No recipes found" })
    }

    res.status(200).json(recipes)
  } catch (err) {
    next(err)
  }
}

export const getRecipe = async (req, res, next) => {
  //GET /recipes/:id
  try {
    const id = req.params.id
    const recipe = await Recipe.findByPk(id)

    if (!recipe) {
      return res.status(404).json({ message: "No recipe found with the same id" })
    }

    res.status(200).json(recipe)
  } catch (err) {
    next(err)
  }
}

export const addRecipe = async (req, res, next) => {
  //POST /api/recipes (Protected and image upload)
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      cookingTime,
      servings,
      difficulty,
      isPublic,
    } = req.body

    if (!title) {
      return res.status(400).json({ message: "Title is required" })
    }

    const recipe = await Recipe.create({
      title,
      description,
      ingredients,
      instructions,
      cookingTime,
      servings,
      difficulty,
      isPublic: isPublic !== undefined ? isPublic : true,
      imageUrl: req.file ? `/uploads/recipes/${req.file.filename}` : null,
      userId: req.userID,
    })

    if (!recipe) {
      return res.status(500).json({ message: "Failed to create recipe" })
    }

    res.status(201).json(recipe)
  } catch (err) {
    //delete uploaded file if error occurs
    if (req.file) {
      const filePath = path.join(__dirname, "../public/uploads/recipes", req.file.filename)
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err)
        }
      })
    }

    next(err)
  }
}

export const updateRecipe = async (req, res, next) => {
  //PUT /api/recipes/:id (Protected)
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      cookingTime,
      servings,
      difficulty,
      isPublic,
    } = req.body

    const recipeId = req.params.id
    const plainRecipe = req.plainRecipe

    const update = {
      title,
      description,
      ingredients,
      instructions,
      cookingTime,
      servings,
      difficulty,
      isPublic,
      imageUrl: req.file ? `/uploads/recipes/${req.file.filename}` : plainRecipe.imageUrl,
    }

    await Recipe.update(update, { where: { id: recipeId } })

    const updatedRecipe = await Recipe.findByPk(recipeId)
    res.status(200).json(updatedRecipe)
  } catch (err) {
    next(err)
  }
}

export const deleteRecipe = async (req, res, next) => {
  //DELETE /api/recipes/:id (Protected)
  try {
    const recipeId = req.params.id
    const plainRecipe = req.plainRecipe

    const imagePath = plainRecipe.imageUrl

    await Recipe.destroy({ where: { id: recipeId } })

    if (imagePath) {
      const fullPath = path.join(__dirname, "../public", imagePath)
      console.log(fullPath)

      fs.unlink(fullPath, (err) => {
        if (err) {
          console.error("Error deleting file:", err)
        }
      })
    }

    res.status(200).json({ message: "Recipe deleted successfully" })
  } catch (err) {
    next(err)
  }
}

export const getUsersRecipes = async (req, res, next) => {
  //GET /recipes/my-recipes (Protected)
  try {
    const userId = req.userID

    const recipes = await Recipe.findAll({
      where: { userId },
      raw: true,
    })

    if (!recipes.length) {
      return res.status(404).json({ message: "No recipes found for this user" })
    }

    res.status(200).json(recipes)
  } catch (err) {
    next(err)
  }
}

export const addComment = async (req, res, next) => {
  try {
    const recipeId = req.params.id
    const userId = req.userID
    const username = req.username

    const newComment = new Comment({
      recipeId: recipeId,
      userId: userId,
      username: username,
      comment: req.body.comment,
      rating: req.body.rating,
    })

    await newComment.save()

    res.status(201).json(newComment)
  } catch (err) {
    next(err)
  }
}
