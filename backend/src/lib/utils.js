import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken=(userId,res)=>{
    const Token=jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"7d"});
    res.cookie("token",Token,{
        httpOnly:true,
        secure:process.env.NODE_ENV!=="development",
        sameSite:"strict",
        maxAge:7*24*60*60*1000 
    });
    return Token;
}