const mongoose = require('mongoose');
const PollingUnit = mongoose.model('PollingUnit', { lga: String, pu_code: String, pu_id: String, status:String, ward_name: String, ward_id: String, pu_name: String });

module.exports = PollingUnit;