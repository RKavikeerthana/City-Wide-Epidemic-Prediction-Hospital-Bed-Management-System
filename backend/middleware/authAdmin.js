import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("Authorization header missing or invalid:", authHeader);
            return res.status(403).json({ success: false, message: "Forbidden: Missing or Invalid Token" });
        }

        const atoken = authHeader.split(" ")[1];
        console.log("Received Token:", atoken);

        const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        if (decoded.email !== process.env.ADMIN_EMAIL) {
            console.log("Token email mismatch:", decoded.email);
            return res.status(403).json({ success: false, message: "Forbidden: Invalid Admin Credentials" });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error("Middleware Error:", error.message);
        return res.status(403).json({ success: false, message: "Forbidden: Invalid or Expired Token" });
    }
};

export default authAdmin;
