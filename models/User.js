import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'

//Create schema

const UserSchema = new Schema({
    name: { type: String },
    email: { type: String },
    password: { type: String, minlength: 6},
    username: { type: String, minlength: 3, maxlength: 30},
    createdOn: { type: Date, default: new Date().getTime() },
  });

//Hash password before save
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  // Salt
  this.password = await bcrypt.hash(this.password, 10);
  next();
})


//Use schema = model

export const User = model("User", UserSchema)