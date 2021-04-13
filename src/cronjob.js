import * as dotenv from 'dotenv';
dotenv.config();
import { findEvent } from './libs/calendar';
import { sendSlackMessage } from './libs/slack';
import { image } from './libs/giphy';

module.exports.handler = async () => {
    try {
        const date = new Date();
        // test date for two birthdays the same day
        // const date = new Date(2021, 5, 19);
        const bdayChildren = await findEvent({date})
        if (!bdayChildren) {
            console.log(`No birthdays found for ${date}`)
            await sendSlackMessage(process.env.SLACK_WEBHOOK_URL, {
                text: "sorry no bdays today!"
            })
            return {}
        }
        // get the GIPHY URL if PEOPLE were found
        const imgUrl = await image();
        await sendSlackMessage(process.env.SLACK_WEBHOOK_URL, {
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Happy birthday, ${bdayChildren}! 🥳. Have a great day and lots of 🎂.`
                    }
                },
                {
                    "type": "image",
                    "image_url": imgUrl,
                    "alt_text": "Birthday GIF",
                    "title": {
                        "type": "plain_text",
                        "text": "If you know them, let them know you know! 😉"
                    },
                }
            ]
        });
        return {};
    } catch (error) {
        console.log(`ERROR IN CRONJOB HANDLER: ${error}`)
        return { statusCode: 500, body: error };
    }
};
