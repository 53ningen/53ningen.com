---
title: CDK で Step Functions リソースを定義する
category: programming
date: 2020-12-27 14:18:29
tags: [Serverless, StepFunctions]
pinned: false
---

# これはなに

- Step Functions のステートマシンを AWS CDK で定義する方法をメモ

# Lambda 関数の作成

```typescript
$ cat functions/hello.ts


const handler = async function (_: any) {
  return {
    result: 'Hello',
  };
};

export { handler };
```

## リソースの定義

```typescript
$ cat lib/ts-lambda-stepfunctions.ts

import * as lambda from "@aws-cdk/aws-lambda";
import * as logs from "@aws-cdk/aws-logs";
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as cdk from "@aws-cdk/core";

export class TsLambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const helloFunction = new lambda.Function(this, "HelloFunction", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "hello.handler",
    });

    const _ = new logs.LogGroup(this, "HelloFunctionLogGroup", {
      logGroupName: "/aws/lambda/" + helloFunction.functionName,
      retention: logs.RetentionDays.ONE_DAY,
    });

    const definition = new tasks.LambdaInvoke(this, 'Get Hello', {
      lambdaFunction: helloFunction,
      payloadResponseOnly: true,
    });

    const machine = new sfn.StateMachine(this, "HelloStateMachine", {
      definition,
      timeout: cdk.Duration.minutes(1),
    });
  }
}
```

# デプロイ

```
$ yarn build
$ cdk deploy
```
