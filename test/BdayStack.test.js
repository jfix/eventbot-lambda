import { expect, haveResource } from "@aws-cdk/assert";
import * as sst from "@serverless-stack/resources";
import BdayStack from "../lib/BdayStack";

test("Test Stack", () => {
  const app = new sst.App();
  // WHEN
  const stack = new BdayStack(app, "test-stack");
  // THEN
  expect(stack).to(haveResource("AWS::Lambda::Function"));
});
