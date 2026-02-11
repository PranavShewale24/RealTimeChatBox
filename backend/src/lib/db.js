import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
export const connectDB=async()=>{
    try{
        const conn=await mongoose.connect(process.env.MONGODB_URL)
        console.log(`Connected to database successfully ${conn.connection.host}`);
    }
    catch(error){
        console.log("Error connecting to database",error);
    }
}