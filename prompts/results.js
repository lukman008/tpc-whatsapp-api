
const results = {
    key: 'results',
    prompts: [
        {
            template: 'confirm_results_counted',
            needs_response: true
        },
        {
            template: 'labour_count',
            needs_response: true
        },
        {
            template: 'apc_count',
            needs_response: true
        },
        {
            template: 'pdp_count',
            needs_response: true
        },
        {
            template: 'confirm_results_signed',
            needs_response: true
        },
        {
            template: 'result_evidence',
            needs_response: true
        },
        {
            template: 'acknowledge_result',
            needs_response: false
        }
    ]
}

module.exports = results