require('dotenv').config({ path: '../.env'});

// const handler = require('./libs/handler.js');
const { google } = require('googleapis');
const { auth } = require('./libs/auth.js');

const add = async () => {
    const calendar = google.calendar({
        version: 'v3', 
        auth
    })
    try {
        const response = await calendar.events.insert({
            calendarId: process.env.CALENDAR_ID,
            requestBody: {
                summary: 'Test birthday',
                recurrence: ['RRULE:FREQ=YEARLY'],
                start: {
                    date: '2021-04-02'
                },
                end: {
                    date: '2021-04-02'
                }
            }
        })
        return true;
    } catch (error) {
        console.log('The API returned an error: ' + error)
        return false;
    }
};

module.exports = add;
