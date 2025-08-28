import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const filePath = path.join(__dirname, "../data/recipes.json")

export const readRecipes = async () => {
  try {
    const data = await fs.readFile(filePath, "utf-8")
    return JSON.parse(data)
  } catch (err) {
    console.error("Error reading recipes.json:", err)
    return []
  }
}

export const writeRecipes = async (recipes) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(recipes, null, 2))
  } catch (err) {
    console.error("Error writing recipes.json:", err)
    throw new Error("Could not save recipes")
  }
}
