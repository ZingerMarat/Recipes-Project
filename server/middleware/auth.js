import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: "No token provided" })

  const token = authHeader.split(" ")[1]

  //const token = req.signedCookies.token
  //if (!token) return res.status(401).json({ error: "No token provided" })

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" })
    req.userID = decoded.id
    req.username = decoded.username

    next()
  })
}
