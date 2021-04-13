import * as dotenv from 'dotenv';
dotenv.config();
import { sendSlackMessage, isVerified } from './libs/slack';
import { formatBirthdays, byPeople, getBirthdays } from './libs/calendar';

module.exports.handler = async (event) => {
    try {
        if (event.requestContext.http.method !== 'POST') throw new Error('Message not allowed');
        event.rawBody = Buffer.from(event.body, 'base64').toString('utf8');
        if (!isVerified(event)) throw new Error('You are not Slack?!')

        const params = new URLSearchParams(Buffer.from(event.body, 'base64').toString());
        const text = params.get('text');
        const responseUrl = params.get('response_url');

        let message;

        /////////////////////////////////////////////////////////////
        // SLASHCOMMAND LIST
        if (text.length === 0 || text.startsWith('list')) {
            const bdays = await getBirthdays({});
            const formattedBirthdays = await formatBirthdays(bdays.sort(byPeople));
            message = {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Wow, *${bdays.length}* birthdays! Here they are:`
                        }
                    },
                    {
                        "type": "divider"
                    }, {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": formattedBirthdays
                        }
                    }
                ]
            };

            /////////////////////////////////////////////////////////////
            // SLASHCOMMAND LIST
        } else if (text.startsWith('help')) {
            message = {
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "`/birthdays` will give you a list of all birthdays we have on record. 🥳 The same will also work with `/birthdays list`"
                        }
                    },
                    {
                        "type": "divider"
                    },                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "`/birthdays search [a name]` will return the date for that person's birthday, if there is one. 🥂"
                        }
                    },
                    {
                        "type": "divider"
                    },                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "`/birthdays search [a date]` will try to find people for that date. For best results use this format '1 January'. 📅"
                        }
                    },
                ]
            }
        }
        await sendSlackMessage(responseUrl, message);
        return { statusCode: 200 }
    } catch (e) {
        console.log(`ERROR IN SLASHCOMMAND HANDLER: ${e}`)
        return { statusCode: 500, body: e };
    }
};

