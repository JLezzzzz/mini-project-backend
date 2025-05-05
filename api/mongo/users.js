import express from "express";
import { User } from "../../models/User.js";
const router = express.Router();
import { getAllUsers, createUser, deleteUser, registerUser, login } from "./controllers/usersController.js";

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

export default router;