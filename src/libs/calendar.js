import { google } from 'googleapis';
import { googleAuth } from './auth';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(localizedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Paris");

const formatEvents = async (arr) => {
    let res = ""
    arr.forEach((event) => {
        res = `${res}${dayjs(event.date).format('D MMMM')}: ${event.name} · `
    })
    // remove ' · ' from the end
    return res.substring(0, res.length - 2);
};

const byName = (a, b) => {
    const _a = a.name.toUpperCase()
    const _b = b.name.toUpperCase()
    if (_a < _b) return -1
    if (_a > _b) return 1
    return 0
};

// /**
//  * Retrieves a list of birthdays
//  * @param {JWT} auth - JWTClient instance
//  * @param {number} maxItems - number of items to return, default is 250 which corresponds to the max
//  * number of items in a page returned by the `list` method.
//  * @returns {Array} - an array containing objects with `person` and `date` keys, order alphabetically
//  * by the person's name.
//  */
const getEvents = async (opts) => {
    try {
        const calendar = google.calendar({
            version: 'v3',
            auth: googleAuth()
        })

        let res = []

        if (opts.date) {
            opts.timeMin = dayjs(opts.date).startOf('day').format();
            opts.timeMax = dayjs(opts.date).endOf('day').format();
        }

        const { data: { items } } = await calendar.events.list({
            calendarId: process.env.EVENTBOT_CALENDAR_ID,
            timeMin: opts.timeMin,
            timeMax: opts.timeMax,
            maxResults: opts.maxItems,
        })
        // extract only the name, the date and the description
        console.log(`GETEVENTS: ${JSON.stringify(items, {}, 2)}`)
        items.map((e) => res.push({name: e.summary, date: e.start.date, description: e.description}))
        return res;
    } catch (error) {
        console.log('ERROR in getEvents: ' + error)
    }
}
const findEventByDate = async (opts) => {
    try {
        if (!opts.date) throw Error("Missing 'date' value");
        if (!(opts.date || Object.prototype.toString.call(opts.date) !== "[object Date]")) throw Error("Wrong type, expected Date object");
        opts.timeMin = dayjs(opts.date).startOf('day').format();
        opts.timeMax = dayjs(opts.date).endOf('day').format();

        const arr =  await getEvents(opts);
        return arr;
    } catch (error) {
        console.log(`ERROR in findEventByDate: ${error}`);  
    }
};

const findEventByName = async (name) => {
    try {
        const n = name.toLowerCase();
        const all = await getEvents({});
        const matched = all.filter((b) => {
            const nn = b.name.toLowerCase();
            return (nn.includes(n))
        })
        return matched;
    } catch (error) {
        console.log(`ERROR in findEventByName: ${error}`);
    }
};

/**
 * Return a Markdown string of one or more events
 * @param {*} opts 
 * @returns String
 */
const findEvent = async (opts) => {
    try {
        if (!opts.date) throw Error("Missing 'date' value");
        if (!(opts.date || Object.prototype.toString.call(opts.date) !== "[object Date]")) throw Error("Wrong type, expected Date object");
        opts.timeMin = dayjs(opts.date).startOf('day').format();
        opts.timeMax = dayjs(opts.date).endOf('day').format();

        const arr =  await getEvents(opts);
        let events = '';
        if (arr.length < 1) {
            return
        } else if (arr.length === 2) {
            events = arr.map((e) => `*${e.name}*`).join(' and ')
        } else {
            events = arr.map((e) => `*${e.name}*`).join(', ')
        }
        return events;
    } catch (error) {
        console.log(`ERROR in findEvent: ${error}`)
    }
}

/**
 * 
 * @param {Object} data containing summary and date
 * date must use this format: 2021-12-31 
 * @returns 
 */
const addEvent = async (data) => {
    try {
        const calendar = google.calendar({
            version: 'v3', 
            auth: googleAuth()
        });
        await calendar.events.insert({
            calendarId: process.env.EVENTBOT_CALENDAR_ID,
            requestBody: {
                summary: data.name,
                description: data.description,
                recurrence: ['RRULE:FREQ=YEARLY'],
                start: {
                    date: data.date
                },
                end: {
                    date: data.date
                }
            }
        });
        return true;
    } catch (error) {
        console.log('ERROR in addEvent: ' + error)
        return false;
    }
};

module.exports = {
    getEvents,
    formatEvents,
    findEventByName,
    findEventByDate,
    byName,
    addEvent,
    findEvent
}