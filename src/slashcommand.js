import { sendSlackMessage, sendEphemeralSlackMessage, isVerified } from './libs/slack';
import { formatBirthdays, findBirthdayChildByName, findBirthdayChildByDate, byPeople, getBirthdays } from './libs/calendar';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
require('dayjs/locale/fr');

dayjs.extend(customParseFormat);

module.exports.handler = async (event) => {
    let params;
    try {
        if (event.requestContext.http.method !== 'POST') throw new Error('Message not allowed');
        if (!event.body) throw new Error('No POST body received.')
        
        event.rawBody = Buffer.from(event.body, 'base64').toString('utf8');
        if (!isVerified(event)) throw new Error('You are not Slack?!')
        params = new URLSearchParams(Buffer.from(event.body, 'base64').toString());
        const text = params.get('text');
        const responseUrl = params.get('response_url');

        let message;

        /////////////////////////////////////////////////////////////
        // LIST
        if (text.startsWith('list')) {
            message = await handleList()

        /////////////////////////////////////////////////////////////
        // FIND
        } else if (text.startsWith('find')) {
            message = await handleFind(text.substring(5));
        
        /////////////////////////////////////////////////////////////
        // HELP
        } else if (text.startsWith('help') || text.length === 0) {
            message = handleHelp();
        } else {
            // JUST ACKNOWLEDGING REQUEST (DEBUG)
            message = {
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "plain_text",
                            "text": "PONG"
                        }
                    }
                ]
            }
        }
        await sendSlackMessage(responseUrl, message);
        return { statusCode: 200 }
    } catch (e) {
        console.log(`ERROR IN SLASHCOMMAND HANDLER: ${e}`)
        await sendEphemeralSlackMessage({
            text: e.message, 
            channel: params.get('channel_id'),
            user: params.get('user_id'),
        });
        // don't return technical error messages to end user in Slack
        return { statusCode: 200 };
    }
};

const handleHelp = () => {
    return {
        blocks: [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "`/birthdays list` will show you a list of all birthdays we have on record. 🥳"
                }
            },
            {
                "type": "divider"
            },                    {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "`/birthdays find [a name]` will return the date for that person's birthday, if there is one. 🥂"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "`/birthdays find [a date]` will try to find people for that date. For best results use this format '1 January'. 📅"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "`/birthdays` or `/birthdays help` will display this message. Very self-referential and _meta_. 🙄"
                }
            },
        ]
    }
};

const handleFind = async (s) => {
    let message;

    if (new RegExp('([\\d]+)[\\s]+([a-z])([a-z]+)', 'g').exec(s)) {
        console.log(`${s} matched this regexp: '[\\d]+[\\s]+[A-Za-z]+'`)
    }
    const currentYear = dayjs().format('YYYY')
    const d = dayjs(`${s} ${currentYear}`, ['D MMMM', 'D MMM']);
    // date is not valid
    if (!d.isValid()) {
        // assume a name was passed in
        const users = await findBirthdayChildByName(s);
        // at least one person was found
        if (users.length > 0) {
            const fbd = await formatBirthdays(users);
            message = {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Wow, *${users.length}* birthday${users.length > 1 ? 's' : ''} found for your search! 🎉`
                        }
                    },
                    {
                        "type": "divider"
                    }, {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": fbd
                        }
                    }
                ]
            }
        // no-one was found
        } else {
            message = {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Unfortunately, no birthday for '${s}' was found! :cry: Check the name maybe? 🤔`
                        }
                    },
                ]
            };
        }
        // throw new Error('The date format was not recognized. :cry: Please try one of these formats: `1 Jan` or `1 January`.')
    
    // date is valid
    } else {
        const users = await findBirthdayChildByDate({date: d.toDate()})
        if (users.length > 0) {
            const u = users.map((u) => u.person);
            message = {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Yay, *${u.join(' and ')}* ha${u.length === 1 ? 's' : 've'} their birthday on ${d.format('D MMMM')}! Congrats! 🤩`
                        }
                    },
                ]
            }
        } else {
            message = {
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `Unfortunately, nobody we know will celebrate their birthday on ${d.format('D MMMM')}. :cry: Want to try another date? 🤔`
                        }
                    },
                ]
            };
        }
    }
    return message;
};

const handleList = async () => {
    try {
        const bdays = await getBirthdays({});
        const formattedBirthdays = await formatBirthdays(bdays.sort(byPeople));
        const message = {
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
        return message;
    } catch (error) {
        console.log(`handleList ERROR: ${error}`)
    }
}