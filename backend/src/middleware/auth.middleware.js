import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateToken } from "../lib/utils.js";
import cookieParser from "cookie-parser";
dotenv.config();
export const protectRoute=async(req,res,next)=>{
    try{

        const token =req.cookies.jwt
        if(!token){
           return res.status(401).json({message:"Not authorized, token failed"}); 
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
         if(!decoded){
            return res.status(401).json({message:"Not authorized,token failed"});
         }
         const  user=await User.findOne(decoded.userId).select("-password");
         if(!user){
            return res.status(404).json({message:"Not authorized, user not found"});
         }
         else{
            req.user=user;
            next(); 
    }}
    catch(error){
        console.log(error);
        return res.status(401).json({message:"Not authorized, token failed"});
    }

}