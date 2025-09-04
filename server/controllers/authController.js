import db from "../db/models/index.js"
const { User } = db

import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = "1h"
const saltRounds = 10

export const register = async (req, res) => {
  // Request body
  // {
  //   username: "johndoe",
  //   email: "john@example.com",
  //   password: "password123",
  //   firstName: "John",
  //   lastName: "Doe"
  // }
  try {
    const { username, email, password, firstName, lastName } = req.body

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "All fields are required" })
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const userExists = await User.findOne({ where: { email } })
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
    })

    const userID = user.id

    const token = jwt.sign({ id: userID }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    res.status(201).json({
      success: true,
      status: 201,
      message: "User registered successfully",
      user: { userID, username, email, firstName, lastName },
      token,
    })
  } catch (err) {
    res.status(500).json({ error: "register failed: " + err })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const plainUser = user.get({ plain: true })

    if (!bcrypt.compare(plainUser.password, password)) {
      return res.status(400).json({
        success: false,
        message: "wrong password",
      })
    }

    const token = jwt.sign({ id: plainUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

    const { password: _, ...saveUser } = plainUser

    res.status(200).json({
      success: true,
      status: 200,
      message: "Login successful",
      user: saveUser,
      token,
    })
  } catch (err) {
    res.status(500).json({ error: "login failed: " + err })
  }
}

export const getProfile = async (req, res) => {
  try {
    const id = req.userID

    const user = await User.findOne({ where: { id } })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      })
    }

    const plainUser = user.get({ plain: true })

    const { password: _, ...safeUser } = plainUser

    res.status(200).json(safeUser)
  } catch (err) {
    res.status(500).json({ error: "get profile failed: " + err })
  }
}
