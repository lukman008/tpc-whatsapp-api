const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const incidentSchema = new Schema({ user:Map, pu_code:String, pu_address: String, type:String, caption: String, media: String }, { timestamps: true })
const Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;