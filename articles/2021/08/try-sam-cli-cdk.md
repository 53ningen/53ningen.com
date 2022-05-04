---
title: SAM CLI + CDK を試す
category: programming
date: 2021-08-13 03:54:20
tags: [SAM, CDK]
pinned: false
---

- 基本的に [このドキュメント](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-cdk-getting-started.html) に書いてあることを試しただけの記録
- ドキュメントは Python だが、手元では Lambda Runtime: Node.js14.X, CDK: TypeScript で試した

## aws-sam-cli-beta-cdk の導入

```
brew install aws-sam-cli-beta-cdk
```

## Project の作成

以下のようにプロジェクトの作成が可能

```
sam-beta-cdk init --project-type CDK --package-type Zip --runtime nodejs14.x --dependency-manager npm --app-template hello-world --cdk-language typescript --name sam-cdk-demo
cd sam-cdk-demo
npm install
```

ディレクトリ構造は以下のとおり

```
$ tree
.
├── README.md
├── bin
│   └── aws-sam-cli-cdk-hello-world.ts
├── cdk.json
├── events
│   └── event.json
├── hello-world
│   ├── app.js
│   └── package.json
├── jest.config.js
├── lib
│   └── aws-sam-cli-cdk-hello-world-stack.ts
├── package-lock.json
├── package.json
├── test
│   └── aws-sam-cli-cdk-hello-world.test.ts
└── tsconfig.json
```

## ローカル実行

プロジェクトの雛形には以下のような Lambda 関数が定義されている

```
$ cat hello-world/app.js
exports.lambdaHandler = async (event, context) => {
    try {
        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
```

これをローカル実行するためにはあらかじめ Docker デーモンを走らせておき次のようなコマンドを叩く

```
$ sam-beta-cdk local invoke sam-cdk-demo/hello-world-lambda-function
Synthesizing CDK App
Invoking app.lambdaHandler (nodejs14.x)
Image was not found.
Building image............................................................................
..........................................................................................
..........................................................................................
Skip pulling image and use local one: amazon/aws-sam-cli-emulation-image-nodejs14.x:rapid-1.22.0.dev202107140310.

Mounting /Users/.../sam-cdk-demo/hello-world as /var/task:ro,delegated inside runtime container
START RequestId: 228a6eed-9a24-4d52-968f-c10a62d42cb7 Version: $LATEST
END RequestId: 228a6eed-9a24-4d52-968f-c10a62d42cb7
REPORT RequestId: 228a6eed-9a24-4d52-968f-c10a62d42cb7  Init Duration: 0.13 ms  Duration: 120.87 ms       Billed Duration: 200 ms Memory Size: 128 MB     Max Memory Used: 128 MB
{"statusCode":200,"body":"{\"message\":\"hello world\"}"}
```

とてもお手軽！

API のローカル実行もお手軽

```
$ sam-beta-cdk local start-api
Synthesizing CDK App
Mounting helloworldlambdafunctionC39FFDF2 at http://127.0.0.1:3000/hello [GET]
You can now browse to the above endpoints to invoke your functions. You do not need to restart/reload SAM CLI while working on your functions, changes will be reflected instantly/automatically. You only need to restart SAM CLI if you update your AWS SAM template
2021-08-13 03:52:35  * Running on http://127.0.0.1:3000/ (Press CTRL+C to quit)
Invoking app.lambdaHandler (nodejs14.x)
Skip pulling image and use local one: amazon/aws-sam-cli-emulation-image-nodejs14.x:rapid-1.22.0.dev202107140310.

Mounting /Users/.../sam-cdk-demo/hello-world as /var/task:ro,delegated inside runtime container
START RequestId: a82f1c11-cb94-4f60-8d4f-4728d7e39203 Version: $LATEST
END RequestId: a82f1c11-cb94-4f60-8d4f-4728d7e39203
REPORT RequestId: a82f1c11-cb94-4f60-8d4f-4728d7e39203  Init Duration: 0.29 ms  Duration: 218.70 ms       Billed Duration: 300 ms Memory Size: 128 MB     Max Memory Used: 128 MB
No Content-Type given. Defaulting to 'application/json'.
2021-08-13 03:52:39 127.0.0.1 - - [13/Aug/2021 03:52:39] "GET /hello HTTP/1.1" 200 -
2021-08-13 03:52:39 127.0.0.1 - - [13/Aug/2021 03:52:39] "GET /favicon.ico HTTP/1.1" 403 -
```

- [Better together: AWS SAM and AWS CDK | AWS Compute Blog](https://aws.amazon.com/jp/blogs/compute/better-together-aws-sam-and-aws-cdk/)
