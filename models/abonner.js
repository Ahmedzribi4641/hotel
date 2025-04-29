const mongoose=require('mongoose')

const abonnerSchema=mongoose.Schema({
    email:{type:String,unique: true,required:true}
},)

module.exports = mongoose.model('Abonner', abonnerSchema);