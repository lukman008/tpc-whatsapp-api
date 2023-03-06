const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const progressSchema = new Schema({ user:Map, pu:String, messages:Array }, { timestamps: true })
const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;