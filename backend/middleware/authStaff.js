import jwt from 'jsonwebtoken'

// Allows either the admin (Authorization: Bearer <token>)
// or a logged-in hospital (dtoken header).
const authStaff = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
            if (decoded.email && decoded.email === process.env.ADMIN_EMAIL) {
                req.staff = { role: 'admin' }
                return next()
            }
        }

        const { dtoken } = req.headers
        if (dtoken) {
            const decoded = jwt.verify(dtoken, process.env.JWT_SECRET)
            if (decoded.id) {
                req.staff = { role: 'hospital', id: decoded.id }
                return next()
            }
        }

        return res.status(403).json({ success: false, message: 'Not authorized. Please log in again.' })
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired login. Please log in again.' })
    }
}

export default authStaff
