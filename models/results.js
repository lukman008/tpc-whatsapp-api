const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const resultsSchema = new Schema({
    pu_code: String, pu_address: String, apc_count: Number,
    pdp_count: Number,
    lp_count: Number,
    others_count: Number,
    valid_count: Number,
    rejected_count: Number, conversation: String, image: String
}, { timestamps: true })
const Results = mongoose.model('Results', resultsSchema);

module.exports = Results;