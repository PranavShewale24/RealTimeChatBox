import mongoose from 'mongoose'
const userSchema=mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            unique:true
        },
        fullName:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:function () {
                return this.authProvider === "local";
            },
            minlength:6
        },
        authProvider:{
            type:String,
            enum:["local","google"],
            default:"local"
        },
        googleId:{
            type:String,
            unique:true,
            sparse:true
        },
        profilePic:{
            type:String,
            default:""
        },
    },{timestamps:true}
);
const User =mongoose.model("User",userSchema);
export default User