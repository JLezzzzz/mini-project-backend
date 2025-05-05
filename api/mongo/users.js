import express from "express";
import { User } from "../../models/User.js";
const router = express.Router();
import { getAllUsers, createUser, deleteUser, registerUser, login, profile, logout, verifyToken, getUser } from "./controllers/usersController.js";
import { authUser } from "../../middleware/auth.js";
import { verify } from "jsonwebtoken";

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

export default router;