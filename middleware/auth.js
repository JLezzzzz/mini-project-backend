import jwt from "jsonwebtoken";

export const authUser = async (req,res,next) => {
    console.log("Auth middleware hit");
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) {
        return res.json({
            success: false,
            message: "Access denied. No Token."
        });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { user: { _id: decodedToken.userId }};
        next();

    } catch (err) {
        const isExpired = err.name === "TokenExpiredError";
        return res.status(401).json({
            error:true,
            code: isExpired ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
            message: isExpired
            ? "Token has expired, please log in again"
            : "Invalid token"
        })
    }
}

