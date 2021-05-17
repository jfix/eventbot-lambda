import EventStack from "./EventStack";
import * as ssm from '@aws-cdk/aws-ssm';

export default function main(app) {
  app.setDefaultFunctionProps((stack) => ({
    environment: {
      EVENTBOT_CALENDAR_ID: ssm.StringParameter.valueForStringParameter(stack, "EVENTBOT_CALENDAR_ID"),
      EVENTBOT_GOOGLE_APPLICATION_CREDENTIALS_EMAIL: ssm.StringParameter.valueForStringParameter(stack, "EVENTBOT_GOOGLE_APPLICATION_CREDENTIALS_EMAIL"),
      EVENTBOT_GOOGLE_APPLICATION_CREDENTIALS_KEY: ssm.StringParameter.valueForStringParameter(stack, "EVENTBOT_GOOGLE_APPLICATION_CREDENTIALS_KEY"),
      EVENTBOT_GOOGLE_APPLICATION_CREDENTIALS_KEY_ID: ssm.StringParameter.valueForStringParameter(stack, "EVENTBOT_GOOGLE_APPLICATION_CREDENTIALS_KEY_ID"),
      EVENTBOT_SLACK_WEBHOOK_URL: ssm.StringParameter.valueForStringParameter(stack, "EVENTBOT_SLACK_WEBHOOK_URL"),
      EVENTBOT_SLACK_BOT_TOKEN: ssm.StringParameter.valueForStringParameter(stack, "EVENTBOT_SLACK_BOT_TOKEN"),
      EVENTBOT_SLACK_SIGNING_SECRET: ssm.StringParameter.valueForStringParameter(stack, "EVENTBOT_SLACK_SIGNING_SECRET"),
    },
  }));
  new EventStack(app, "event-stack");

  // Add more stacks
}
