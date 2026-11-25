const router=require('express').Router();const auth=require('../middleware/auth');const Budget=require('../models/Budget');
router.use(auth);
router.get('/',async(req,res)=>{try{res.json(await Budget.find({user:req.user.id}))}catch{res.status(500).json({message:'Could not load budgets'})}});
router.post('/',async(req,res)=>{try{const {category,limit}=req.body;if(!category||!limit||Number(limit)<=0)return res.status(400).json({message:'Enter a valid category and limit'});const item=await Budget.findOneAndUpdate({user:req.user.id,category},{limit:Number(limit)},{new:true,upsert:true,runValidators:true});res.status(201).json(item)}catch{res.status(400).json({message:'Could not save budget'})}});
router.delete('/:id',async(req,res)=>{try{await Budget.findOneAndDelete({_id:req.params.id,user:req.user.id});res.json({message:'Deleted'})}catch{res.status(400).json({message:'Could not delete budget'})}});
module.exports=router;
