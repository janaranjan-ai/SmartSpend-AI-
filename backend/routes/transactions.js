const router=require('express').Router();const auth=require('../middleware/auth');const Transaction=require('../models/Transaction');
router.use(auth);
router.get('/',async(req,res)=>{try{res.json(await Transaction.find({user:req.user.id}).sort({date:-1,createdAt:-1}))}catch{res.status(500).json({message:'Could not load transactions'})}});
router.post('/',async(req,res)=>{try{const {title,amount,type,category,date,note=''}=req.body;if(!title||!amount||!type||!category||!date)return res.status(400).json({message:'Please complete all required fields'});const item=await Transaction.create({user:req.user.id,title,amount,type,category,date,note});res.status(201).json(item)}catch{res.status(400).json({message:'Invalid transaction'})}});
router.put('/:id',async(req,res)=>{try{const item=await Transaction.findOneAndUpdate({_id:req.params.id,user:req.user.id},req.body,{new:true,runValidators:true});if(!item)return res.status(404).json({message:'Transaction not found'});res.json(item)}catch{res.status(400).json({message:'Could not update transaction'})}});
router.delete('/:id',async(req,res)=>{try{const item=await Transaction.findOneAndDelete({_id:req.params.id,user:req.user.id});if(!item)return res.status(404).json({message:'Transaction not found'});res.json({message:'Deleted'})}catch{res.status(400).json({message:'Could not delete transaction'})}});
module.exports=router;
