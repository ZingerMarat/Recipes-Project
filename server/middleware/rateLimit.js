const requests = new Map()

export const rateLimit = (limit, windowMs) => {
  return (req, res, next) => {
    const ip = req.ip
    const now = Date.now()

    if (!requests.has(ip)) {
      requests.set(ip, [])
    }

    const timestamps = requests.get(ip).filter((ts) => now - ts < windowMs)

    if (timestamps.lengh >= limit) {
      return res.status(429).json({ message: "Too many requests" })
    }

    timestamps.push(now)
    requests.set(ip, timestamps)

    next()
  }
}
