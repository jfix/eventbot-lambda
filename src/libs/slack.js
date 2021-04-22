const crypto = require('crypto');
const { IncomingWebhook } = require('@slack/webhook');

// const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

const sendSlackMessage = async (webhookUrl, message) => {

    const webhook = new IncomingWebhook(webhookUrl);

    if (!message) return;
    await webhook.send(message);
};

const isVerified = (req) => {
    try {
        const signature = req.headers['x-slack-signature'];
        const timestamp = req.headers['x-slack-request-timestamp'];
        const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET);
        const [version, hash] = signature.split('=');
    
        // Check if the timestamp is too old
        const fiveMinutesAgo = ~~(Date.now() / 1000) - (60 * 5);
        if (timestamp < fiveMinutesAgo) return false;
        
        hmac.update(`${version}:${timestamp}:${req.rawBody}`);
        const digest = hmac.digest('hex');

        // check that the request signature matches expected value
        return digest === hash;
    } catch (error) {
        console.log(`ERROR IN SIG VERIFY: ${error}`)
        return false
    }
};

module.exports = {
    sendSlackMessage,
    isVerified
};
