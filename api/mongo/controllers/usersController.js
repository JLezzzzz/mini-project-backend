import {User} from "../../../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


export const getAllUsers = async (req, res) => {
    try{
        const user = await User.find();
        res.json({error: false, user});
    } catch(err) {
        res.status(500).json({
            error: true,
            message: "Failed to fetch users",
            details: err.message
        })
    }
}


export const createUser = async (req, res) => {
    const {name,email,username,password} = req.body
    console.log(req.body)
    try {
        //prevent duplicate email
        const existingEmail = await User.findOne({email})
        const existingUsername = await User.findOne({username})
        console.log(existingEmail)
        console.log(existingUsername)
        //check if the email is already exist?
        if (existingEmail) {
            return res.status(409).json({
                error: true,
                message: "Email is already used",
            });
        }
        if (existingUsername) {
            return res.status(409).json({
                error: true,
                message: "Username is already used",
            });
        }
        //create and save new user
        const user = new User({name,email,username,password});
        await user.save()
        res.status(201).json({
            error: false,
            message: "User created successfully!",
        })
    } catch(err) {
        res.status(500).json({
            error: true,
            message: "Server error testest",
            details: err.message
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const {name} = req.body
        const result = await User.deleteOne({name})
        if (result.deletedCount === 0) {
            res.status(400).json({
                message:"Name not found"
            })
        }
        res.status(200).json({ message: `User '${name}' deleted successfully` });
    
    } catch (error) {
        res.status(400).json({
            message:"error"
        })

    }
}

export const registerUser = async (req, res) => {
    const {fullName, email, password} = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({
            error: true,
            message: "All fields are required"
        });
    }
    try {
        const existingUser = await User.findOne({email})
        if(existingUser) {
            res.status(409).json({error:true, message: "email already in use"});
        }
        const user = new User ({fullName, email, password});
        console.log(user)
        await user.save();
    } catch(err) {
        res.status(500).json({
            error: true,
            message: "server error",
            details: err.message
        })
    }
}

export const login = async (req,res) => {
    const {email,password} = req.body
    if (!email || !password) {
        res.status(400).json({error:true,message:"email and password are required"})
    }
    try {
         const user = await User.findOne({email})
         if (!user) {
            res.status(401).json({
                error: true,
                message : "Invalid credentials"
            })
         }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(401).json({
                error: true,
                message : "Invalid credentials"
            })
         }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn: "2h"})
        res.json({
            error: false,
            token,
            message: "Login successful!"
        })

    } catch (err) {
        res.status(500).json({
            error: true,
            message: "server error",
            details: err.message
        })
    }
}

export const profile = async (req, res) => {
    const user = await User.findById(req.user.user._id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    res.status(200).json({ error: false, user });
  };

export const logout = (req, res) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  };

export const verifyToken = (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: true, message: "Token is required" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({
        error: false,
        userId: decoded.userId,
        message: "Token is valid",
      });
    } catch (err) {
      res.status(401).json({ error: true, message: "Invalid token" });
    }
  };

export const getUser = async (req, res) => {
    const { user } = req.user;

    const isUser = await User.findOne({ _id: user._id });

    if (!isUser) {
      return res.sendStatus(401);
    }

    return res.json({
      user: isUser,
      message: "",
    });
  }