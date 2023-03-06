const progress = {
    key: 'progress',
    prompts: [
        {
            template: 'type_of_progress',
            needs_response: true
        },
        {
            template: 'give_progress_report',
            needs_response: true
        },
        {
            template: 'progress_evidence',
            needs_response: true
        },
        {
            template: 'acknowledge_report',
            needs_response: false
        }
    ]
}

module.exports = progress;