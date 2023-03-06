const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const incidentSchema = new Schema({ user:Map, pu:String, messages:Array }, { timestamps: true })
const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;