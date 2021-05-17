import TurndownService from 'turndown';
import { getEvents } from './libs/calendar';
import { sendSlackMessage } from './libs/slack';

// need to convert potential HTML in the description to
// Slack-flavored Markdown 
const tds = new TurndownService();
tds.addRule('a', {
    filter: function (node, options) {
      return (
        options.linkStyle === 'inlined' &&
        node.nodeName === 'A' &&
        node.getAttribute('href')
      )
    },
  
    replacement: function (content, node) {
      var href = node.getAttribute('href')
      return '<' + content + '|' + href + '>'
    }
});
  
module.exports.handler = async () => {
    try {
        // const date = new Date();
        // test date for two birthdays the same day
        const date = new Date(2021, 4, 15);

        const events = await getEvents({date})

        if (!events) {
            console.log(`No events found for ${date}`)
            return {}
        }
        if (events.length > 1) {
            console.log(`Unable to manage more than one event right now. :-(`)
            console.log(`${JSON.stringify(events, {}, 2)}`)
        }
        const event = events[0]

        await sendSlackMessage(process.env.EVENTBOT_SLACK_WEBHOOK_URL, {
            "unfurl_links": true,
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": `Yay, today is ${event.name}!`,
                        "emoji": true
                    }
                },
                {
                    "type": "divider"
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `${tds.turndown(event.description)}`
                    }
                },
            ]
        });
        return {};
    } catch (error) {
        console.log(`ERROR IN CRONJOB HANDLER: ${error}`)
        return { statusCode: 500, body: error };
    }
};
