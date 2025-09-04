import { v4 as uuidv4 } from "uuid"
import { readRecipes, writeRecipes } from "../utils/fileHelpers.js"
import { Op } from "sequelize"

import db from "../db/models/index.js"

const { Recipe, User } = db

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
  //POST /recipes/
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
      //TODO: change hardecoded to req.user.id
      userId,
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
      //TODO: change hardecoded to req.user.id
      //userId: req.user.id,
      userId,
    })

    if (!recipe) {
      return res.status(500).json({ message: "Failed to create recipe" })
    }

    res.status(201).json(recipe)
  } catch (err) {
    next(err)
  }
}

export const updateRecipe = async (req, res, next) => {
  //PUT /recipes/:id
  const id = req.params.id
  const update = req.body

  try {
    const recipes = await readRecipes()

    const index = recipes.findIndex((r) => r.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "Recipe not found" })
    }

    recipes[index] = { ...recipes[index], ...update }

    await writeRecipes(recipes)

    res.status(200).json(recipes[index])
  } catch (err) {
    next(err)
  }
}

export const deleteRecipe = async (req, res, next) => {
  const id = req.params.id

  try {
    const recipes = await readRecipes()

    const index = recipes.findIndex((r) => r.id === id)

    if (index === -1) {
      return res.status(404).json({ message: "Recipe not found" })
    }

    recipes.splice(index, 1)

    await writeRecipes(recipes)

    res.status(204).end()
  } catch (err) {
    next(err)
  }
}

const createStats = (recipes) => {
  let totalNumber = 0
  let avgCookingTime = 0
  let recByDifficulty = { easy: [], hard: [], medium: [] }
  let mostCommonIng = []

  totalNumber = recipes.length

  avgCookingTime = recipes.reduce((sum, r) => (sum += r.cookingTime), 0) / totalNumber

  recByDifficulty.easy = recipes.filter((r) => r.difficulty === "easy").map((r) => r.id)
  recByDifficulty.hard = recipes.filter((r) => r.difficulty === "hard").map((r) => r.id)
  recByDifficulty.medium = recipes.filter((r) => r.difficulty === "medium").map((r) => r.id)

  let allIng = []
  for (let r of recipes) {
    allIng.push(...r.ingredients)
  }

  const ingMap = new Map()
  for (let ing of allIng) {
    ingMap.set(ing, (ingMap.get(ing) || 0) + 1)
  }

  const ingObj = Object.fromEntries(ingMap)
  const ingArr = Object.entries(ingObj).map(([key, value]) => ({
    ingredient: key,
    count: value,
  }))
  const sortedIngArr = ingArr.sort((a, b) => b.count - a.count)
  mostCommonIng = sortedIngArr.slice(0, 10).map((ing) => ing.ingredient)

  return { totalNumber, avgCookingTime, recByDifficulty, mostCommonIng }
}

export const getStats = async (req, res, next) => {
  try {
    const recipes = await readRecipes()
    const stats = createStats(recipes)

    res.status(200).json(stats)
  } catch (err) {
    next(err)
  }
}

export const updateRating = async (req, res, next) => {
  const { id, rating } = req.params
  const newRating = Number(rating)

  try {
    if (isNaN(newRating) || newRating < 0 || newRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 0 and 5" })
    }

    const recipes = await readRecipes()
    const recipe = recipes.find((r) => r.id === id)

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" })
    }

    recipe.rating = newRating
    await writeRecipes(recipes)

    res.status(200).json(recipe)
  } catch (err) {
    next(err)
  }
}
