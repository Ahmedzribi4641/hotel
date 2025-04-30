const mongoose=require('mongoose')

const motdepasseoublierSchema=mongoose.Schema({
    email:{type:String,required:true},
    createdAt: {type: Date,default: Date.now,expires: 60, },  
},)

module.exports = mongoose.model('Motdepasseoublier', motdepasseoublierSchema);