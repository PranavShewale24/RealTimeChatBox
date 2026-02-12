import express from "express";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
export const signup = async (req, res) => {
 const {fullName, email, password} = req.body;
 console.log(req.body);

 try{
  if(password.length<6){
    return res.status(400).json({message:"Password must be at least 6 characters long"});
  }
  const user=await User.findOne({email});
  if(user){
    return res.status(400).json({message:"Email already exists"})
  }
 const salt=await bcrypt.genSalt(10);
 const hashedPassword=await bcrypt.hash(password,salt);

 const newUser=new User({
  fullName,
  email,
  password:hashedPassword
 });
 if(newUser){
  await newUser.save();
  const token=generateToken(newUser._id,res);
  res.status(201).json({
    _id:newUser._id,
    fullName:newUser.fullName,
    email:newUser.email,  
    profilePic:newUser.profilePic,
  })
 }
 else{
  res.status(400).json({message:"Invalid user data"});
 }
 }catch(err){
    console.log(err);
    res.status(500).json({message:"Internal server error"});
    
 }


};


export const login = async (req, res) => {
  const {email,password}=req.body;
  try{
    const user=await User.findOne({email});
    if(!user){
      return res.status(400).json({message:"Invalid email or password"})
    }
    const isCompare=await bcrypt.compare(password,user.password);
    if(!isCompare){
      return res.status(400).json({message:"Invalid email or password"});
    }
    const token=generateToken(user._id,res);
    res.status(200).json({_id:user._id, fullName:user.fullName, email:user.email, profilePic:user.profilePic, token});

  }catch(error){
    console.log(error);
    res.status(500).json({message:"Internal server error"});
  }
};


export const logout = (req, res) => {
  try{
res.cookie("jwt","",{maxAge:0});
res.clearCookie("token");
res.status(200).json({message:"Logged out successfully"});
  }catch(error){
    console.log(error);
    res.status(500).json({message:"Internal server error"});
  }
};
