import { Construct } from "constructs";

import * as cdk from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_logs as log } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaLogGroup = new log.LogGroup(this, "HelloLambdaLogGroup", {
      retention: log.RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaPolicy = new iam.Policy(this, "HelloLambdaPolicy", {
      policyName: "my-lambda-function-policy",
      statements: [
        new iam.PolicyStatement({
          actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
          resources: [lambdaLogGroup.logGroupArn],
        }),
      ],
    });
    lambdaPolicy.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const lambdaRole = new iam.Role(this, "HelloLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "my-lambda-function-role",
    });
    lambdaRole.attachInlinePolicy(lambdaPolicy);
    lambdaRole.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const myFunction = new lambda.Function(this, "HelloWorldFunction", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
          return {
            statusCode: 200,
            body: JSON.stringify('Hello World!'),
          };
        };
      `),
      functionName: "my-hello-world-function",
      timeout: cdk.Duration.seconds(30),
      logGroup: lambdaLogGroup,
      role: lambdaRole,
    });
    myFunction.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
