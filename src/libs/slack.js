import crypto from 'crypto';
import { IncomingWebhook } from '@slack/webhook';
import got from 'got';

const sendSlackMessage = async (webhookUrl, message) => {
    const webhook = new IncomingWebhook(webhookUrl);

    if (!message) return;
    await webhook.send(message);
};

const sendEphemeralSlackMessage = async (args) => {
    try {
        const opts = {
            url: 'https://slack.com/api/chat.postEphemeral',
            headers: {
                'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
                'Content-Type': 'application/json; charset=utf-8'
            },
            json: {
                // channel: args.channel,
                channel: 'C04P796PL',
                user: args.user,
                text: args.text
            }
        };
        const response = await got.post(opts);
        console.log(`RESP: ${JSON.stringify(response.body)}`)
    } catch (error) {
        console.log(`Error in sendEphemeralSlackMessage: ${error}`)
    }
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
    sendEphemeralSlackMessage,
    isVerified
};
