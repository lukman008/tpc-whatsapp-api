const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const resultsSchema = new Schema({ user:Map, pu:String, messages:Array }, { timestamps: true })
const Results = mongoose.model('Results', resultsSchema);

module.exports = Results;