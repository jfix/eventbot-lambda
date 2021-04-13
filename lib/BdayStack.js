import * as cdk from "@aws-cdk/core";
import * as sst from "@serverless-stack/resources";
import * as dotenv from 'dotenv';

export default class BdayStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    dotenv.config();

    // Create the HTTP API
    const api = new sst.Api(this, "Api", {
      defaultFunctionProps: {
        environment: {
          CALENDAR_ID: process.env.CALENDAR_ID,
          GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
          GIPHY_APIKEY: process.env.GIPHY_APIKEY,
          SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET
        }
        // timeout: 30,
      },
      routes: {
        "GET            /": "src/index.handler", // returns 404 - OK
        "POST  /birthdays": "src/slashcommand.handler",  // returns list of birthdays
        "GET       /today": "src/slack.handler", // if birthday found sends Slack message
        "GET /date/{date}": "src/slack.handler", // if birthday found for given date ditto
        // "POST  /birthdays": "src/birthdays.add"  // TODO
      },
    });

    // Create a Cron job to ping each morning at 9h15 CEST
    new sst.Cron(this, "Cron", {
      schedule: "cron(15 7 ? * MON-FRI *)",
      job: "src/cronjob.handler"
    });

    // Show API endpoint in output
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.httpApi.apiEndpoint,
    });
  }
}
