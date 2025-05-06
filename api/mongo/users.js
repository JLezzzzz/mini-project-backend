import express from "express";
import { User } from "../../models/User.js";
const router = express.Router();
import { getAllUsers, createUser, deleteUser, registerUser, login, profile, logout, verifyToken, getUser } from "./controllers/usersController.js";
import { authUser } from "../../middleware/auth.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"


// No auth❌
//get all users
router.get("/users", getAllUsers);

//create a user
router.post("/users", createUser);

//delete a user
router.delete("/users", deleteUser)

// register a new user
router.post("/auth/register", registerUser)


// login a user
router.post("/auth/login", login)

// get profile
router.post("/auth/profile",authUser, profile)

// get user
router.get("/get-user", getUser)

// logout
router.post("/logout", logout)

// vertify token
router.get("/auth/verify", verifyToken)

// Login a user - jwt signed token
router.post("/auth/cookie/login", async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: true, message: "Email and password are required" });
    }
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(401)
          .json({ error: true, message: "Invalid credentials" });
      }
      
        console.log("Incoming login for:", email);
        console.log("Found user:", user);
        console.log("User password hash:", user?.password);
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ error: true, message: "Invalid credentials" });
      }
  
      // Generate JWT
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "5h", // 1 hour expiration
      });
  
      const isProd = process.env.NODE_ENV === "production";
  
      // Set token in HttpOnly cookie
      // res.cookie("accessToken", token, {
      //   httpOnly: true,
      //   secure: false,
      //   sameSite: "Strict", // helps prevent CSRF
      //   path: "/",
      //   maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
      // });
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: isProd, // only send over HTTPS in prod
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 60 * 60 * 1000, // 1 hour
      });
  
      res.status(200).json({
        error: false,
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          fullName: user.fullName,
        }, // send some safe public info if needed
      });
    } catch (err) {
        console.error("Login error:", err); // log full error
        res.status(500).json({
          error: true,
          message: "Server error",
          details: err?.message || "Unknown error",
        });
      }
  } )

router.get("/auth/profile", authUser, async (req, res) => {
    const user = await User.findById(req.user.user._id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }
  
    res.status(200).json({ error: false, user });
  });


export default router;