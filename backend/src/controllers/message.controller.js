import Message from "../models/message.model.js";
import User from "../models/user.model.js";
export const getUsersForSidebar=async(req,res)=>{
try{
    const loggedInUserid=req.user._id;
    const filteredUsers=await User.find({_id:{$ne:loggedInUserid}}).select("-password");
    res.status(200).json(filteredUsers);
}catch(error){
    console.log("error in getUsersForSidebar controller",error.message);
    res.status(500).json({error:"Internal server error"});
}
}
export const getMessages=async(req,res)=>{
   try{
    const myId=req.user._id;
    const {id:userToChatId}=req.params;
    const messages=await Message.find({
        $or:[
           { senderId:myId,receiverId:userToChatId},
            {senderId:userToChatId,receiverId:myId}
        ]
    });
    res.status(200).json(messages);
   }
   catch(error){
    console.log(error);
    res.status(500).json({error:"Internal server error"});
   }


}
export const SendMessage=async(req,res)=>{
    try{
        const {text,image}=req.body;
        const senderId=req.user._id;
        const {id:receiverId}=req.params;
        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }
        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        });
        //todo emit this message to receiver using socket.io
        await newMessage.save();
        res.status(201).json(newMessage);
    }catch(error){
        console.log(error);
        res.status(500).json({error:" error in sending message"});
    }
}