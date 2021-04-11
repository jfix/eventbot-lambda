import * as cdk from "@aws-cdk/core";
import * as sst from "@serverless-stack/resources";
import * as dotenv from 'dotenv';

export default class MyStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    dotenv.config();

    // Create the HTTP API
    const api = new sst.Api(this, "Api", {
      defaultFunctionProps: {
        environment: {
          CALENDAR_ID: process.env.CALENDAR_ID
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

    // Show API endpoint in output
    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.httpApi.apiEndpoint,
    });
  }
}
