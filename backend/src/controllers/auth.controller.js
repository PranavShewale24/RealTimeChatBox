import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
 const {fullName, email, password} = req.body;
 try{
  if(password.length<6){
    return res.status(400).json({message:"Password must be at least 6 characters long"});
  }
  const user=User.findOne({email});
  if(email){
    return res.status(400).json({message:"Email already exists"})
  }
 const salt=await bcrypt.genSalt(10);
 const hashedPassword=await bcrypt.hash(password,salt);
 }catch(err){
    console.log(err);
    res.status(500).json({message:"Internal server error"});
 }


};


export const login = async (req, res) => {
  res.send("login page");
};


export const logout = (req, res) => {
  res.send("logout page");
};
