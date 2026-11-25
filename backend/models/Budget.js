const mongoose=require('mongoose');
module.exports=mongoose.model('Budget',new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},category:{type:String,required:true},limit:{type:Number,required:true,min:1}},{timestamps:true}));
