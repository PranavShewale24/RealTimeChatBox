import express from "express"; 
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

const app =express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRoutes);

const PORT=process.env.PORT || 5001;

app.listen(PORT,()=>{
    console.log(`server is running on https://localhost:${PORT}`);
    connectDB();
});                      























