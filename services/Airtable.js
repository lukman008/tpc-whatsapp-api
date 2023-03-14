const axios = require('axios')
const authToken = process.env.AIRTABLE_AUTH_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;
const tableId = process.env.AIRTABLE_TABLE_ID;

module.exports = {
    update: async function (user, final_results) {
        axios.patch(`https://api.airtable.com/v0/${baseId}/${tableId}`,
            {

                "performUpsert": {
                    "fieldsToMergeOn": [
                        "Polling Unit"
                    ]
                },
                "records": [
                    {
                        "fields": {
                            "Polling Unit": user.pu_code,
                            "Address": user.pu_address,
                            "APC": final_results.apc_count,
                            "PDP": final_results.pdp_count,
                            "LP": final_results.lp_count,
                            "Others": final_results.others_count,
                            "Rejected Votes": final_results.rejected_count,
                            "Valid Votes": final_results.valid_count,
                            "Result Sheet": [{ "url": final_results.image }],
                        }
                    }
                ]
            },
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }, }
        ).then(console.log).catch(console.error)
    }
}