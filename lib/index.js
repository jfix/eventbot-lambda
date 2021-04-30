import BdayStack from "./BdayStack";
import * as ssm from '@aws-cdk/aws-ssm';

export default function main(app) {
  app.setDefaultFunctionProps((stack) => ({
    environment: {
      // this one is just for test
      // GOOGLE_APPLICATION_CREDENTIALS_FILE: process.env.GOOGLE_APPLICATION_CREDENTIALS_FILE,
      CALENDAR_ID: ssm.StringParameter.valueForStringParameter(stack, "CALENDAR_ID"),
      GOOGLE_APPLICATION_CREDENTIALS_EMAIL: ssm.StringParameter.valueForStringParameter(stack, "GOOGLE_APPLICATION_CREDENTIALS_EMAIL"),
      GOOGLE_APPLICATION_CREDENTIALS_KEY: ssm.StringParameter.valueForStringParameter(stack, "GOOGLE_APPLICATION_CREDENTIALS_KEY"),
      GOOGLE_APPLICATION_CREDENTIALS_KEY_ID: ssm.StringParameter.valueForStringParameter(stack, "GOOGLE_APPLICATION_CREDENTIALS_KEY_ID"),
      SLACK_WEBHOOK_URL: ssm.StringParameter.valueForStringParameter(stack, "SLACK_WEBHOOK_URL"),
      SLACK_BOT_TOKEN: ssm.StringParameter.valueForStringParameter(stack, "SLACK_BOT_TOKEN"),
      SLACK_SIGNING_SECRET: ssm.StringParameter.valueForStringParameter(stack, "SLACK_SIGNING_SECRET"),
      GIPHY_APIKEY: ssm.StringParameter.valueForStringParameter(stack, "GIPHY_APIKEY"),
    },
  }));
  new BdayStack(app, "bday-stack");

  // Add more stacks
}
