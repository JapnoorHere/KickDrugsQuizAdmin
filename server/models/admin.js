const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username : {
        type : String
    },
    password:{
        type : String
    }
},{collection : 'admin'});

module.exports = mongoose.model('Admin',adminSchema)