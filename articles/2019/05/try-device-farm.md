---
title: DeviceFarm を利用した iOS アプリの UI テスト
category: programming
date: 2019-05-24 03:31:34
tags: [iOS, DeviceFarm]
pinned: false
---

XCUITest を Device Farm サービス上で実行するサンプルとして [aws-device-farm-xctest-ui-tests-for-ios-sample-app](https://github.com/aws-samples/aws-device-farm-xctest-ui-tests-for-ios-sample-app) が提供されているので、ひととおり実行してみる

## サンプルアプリの概要

いろいろなテストに応用できる画面が用意されている

<a href="https://static.53ningen.com/wp-content/uploads/2019/05/24031939/886893e296537c97f553d56e6b9262b2.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/05/24031939/886893e296537c97f553d56e6b9262b2-167x300.png" alt="" width="167" height="300" class="alignnone size-medium wp-image-4827" /></a> <a href="https://static.53ningen.com/wp-content/uploads/2019/05/24031943/e8a7712e02ec725598e901b521535411.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/05/24031943/e8a7712e02ec725598e901b521535411-167x300.png" alt="" width="167" height="300" class="alignnone size-medium wp-image-4828" /></a> <a href="https://static.53ningen.com/wp-content/uploads/2019/05/24031947/aa2cca665bac662d8c1317fb270e0a75.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/05/24031947/aa2cca665bac662d8c1317fb270e0a75-167x300.png" alt="" width="167" height="300" class="alignnone size-medium wp-image-4829" /></a> <a href="https://static.53ningen.com/wp-content/uploads/2019/05/24031950/fc6ed5d0ba19aba83dbb25896f1c54cf.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/05/24031950/fc6ed5d0ba19aba83dbb25896f1c54cf-167x300.png" alt="" width="167" height="300" class="alignnone size-medium wp-image-4830" /></a>

テスト自体は XC UITest で書かれている: [ADFiOSReferenceAppUITests/AlertsTest.m](https://github.com/aws-samples/aws-device-farm-xctest-ui-tests-for-ios-sample-app/blob/master/ADFiOSReferenceAppUITests/AlertsTest.m#L29)

```
@implementation AlertsTest

- (void)setUp {
    [super setUp];

    if ([[self app].buttons[ALERTS_TAB_ID] exists]) {
        [[self app].buttons[ALERTS_TAB_ID] delayedTap:TAP_DELAY];
    } else {
        [[self app].tabBars.buttons[MORE_TAB_ID] delayedTap:TAP_DELAY];
        [[self app].staticTexts[ALERTS_TAB_ID] tap];
    }
}

- (void)tearDown {
    [super tearDown];
}

- (void)testAlert {
    [[self app].buttons[ALERT_BUTTON_ID] tap];
    XCTAssertTrue([[self app].staticTexts[ALERT_MESSAGE] exists]);

    [[self app].buttons[OK_BUTTON_ID] tap];
    XCTAssertFalse([[self app].staticTexts[ALERT_MESSAGE] exists]);
}

- (void)testModal {
    [[self app].buttons[MODAL_BUTTON_ID] tap];
    XCTAssertTrue([[self app].staticTexts[MODAL_MESSAGE] exists]);

    [[self app].buttons[OK_BUTTON_ID] tap];
    XCTAssertFalse([[self app].staticTexts[MODAL_MESSAGE] exists]);
}

@end
```

## テストに利用する ipa ファイルの作成

```
$ git clone https://github.com/aws-samples/aws-device-farm-xctest-ui-tests-for-ios-sample-app.git
$ cd aws-device-farm-xctest-ui-tests-for-ios-sample-app
$ open AWSDeviceFarmiOSReferenceApp.xcodeproj/
```

つづいて Xcode 上から Generic Device 向けに App と Test の Build を行い、生成物のディレクトリに移動します。アプリケーション本体は普通に .ipa ファイルを作成してアップロードすれば OK です。

```
# UITest のパッケージ化
$ mkdir /tmp/Payload
$ mv ~/Library/Developer/Xcode/DerivedData/AWSDeviceFarmiOSReferenceApp*/Build/Products/Debug-iphoneos/*-Runner.app /tmp/Payload/
$ cd /tmp/
$ zip -r9 ../test_runner.ipa ./Payload
```

## Device Farm での実行

```
# プロジェクトの作成
$ PROJ_ARN=$(aws devicefarm create-project --name AWSDeviceFarmiOSReferenceApp --region=us-west-2 | jq -r '.project.arn')


# .ipa ファイルのアップロード
$ APP_URL=$(aws devicefarm create-upload --project-arn $PROJ_ARN --name app.ipa --type IOS_APP --region=us-west-2 | jq -r '.upload.url')
$ curl -T ~/path/to/AWSDeviceFarmiOSReferenceApp.app $APP_URL


$ RUNNER_URL=$(aws devicefarm create-upload --project-arn $PROJ_ARN --name test_runner.ipa --type XCTEST_UI_TEST_PACKAGE --region=us-west-2
 | jq -r '.upload.url')
$ curl -T /tmp/test_runner.ipa $RUNNER_URL

# テストの実行
$ aws devicefarm list-devices --region=us-west-2 | jq -r '.devices[] |  "\"\(.name)\" \(.arn)"' | grep iPhone
"Apple iPhone 6" arn:aws:devicefarm:us-west-2::device:AB45B8B037A840BCBD919704EB5BB3C5
"Apple iPhone 6 Plus" arn:aws:devicefarm:us-west-2::device:352FDCFAA36C43AC8228DC8F23355272
"Apple iPhone 6 Plus" arn:aws:devicefarm:us-west-2::device:4A247CD4E9524AD5BA5258EAE90BF225
"Apple iPhone 6s Plus" arn:aws:devicefarm:us-west-2::device:9EB8A25708A848CA90181B8185FD55D7
"Apple iPhone 6 Plus" arn:aws:devicefarm:us-west-2::device:CFD07092060E49B08C494177A90B66EC
...


# デバイスプールの作成
$ cat rule.json
[
    {
        "attribute": "PLATFORM",
        "operator": "EQUALS",
        "value": "\"IOS\""
    },
    {
        "attribute": "OS_VERSION",
        "operator": "GREATER_THAN_OR_EQUALS",
        "value": "\"9.0\""
    }
]

$ aws devicefarm create-device-pool --name ios-pool --rules file://rule.json --region us-west-2 --project-arn $PROJ_ARN


# テストの実行
$ aws devicefarm schedule-run --region=us-west-2 --generate-cli-skeleton > task.json
$ vi task.json
...

$ cat task.json
{
    "projectArn": "",
    "appArn": "",
    "devicePoolArn": "",
    "name": "test01",
    "test": {
        "type": "XCTEST_UI",
        "testPackageArn": ""
    }
}

$ aws devicefarm schedule-run --region=us-west-2 --cli-input-json file://taask.json
```

## テスト結果

ウェブ UI から様々な情報を参照できます。

実行中のテスト一覧は以下のような具合。

<a href="https://static.53ningen.com/wp-content/uploads/2019/05/24032713/44a2dfaef1b4acc0e399c0fb0b78bf5d.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/05/24032713/44a2dfaef1b4acc0e399c0fb0b78bf5d-300x83.png" alt="" width="300" height="83" class="alignnone size-medium wp-image-4837" /></a>

またテスト実行中の動画も見れます

<a href="https://static.53ningen.com/wp-content/uploads/2019/05/24032709/f96b1c042a0d741bf5ef9144cec8dd4c.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/05/24032709/f96b1c042a0d741bf5ef9144cec8dd4c-300x148.png" alt="" width="300" height="148" class="alignnone size-medium wp-image-4835" /></a>

実行ログの様子

<a href="https://static.53ningen.com/wp-content/uploads/2019/05/24032711/579e9d88e9f21b3cfddda5d9212c631b.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/05/24032711/579e9d88e9f21b3cfddda5d9212c631b-300x161.png" alt="" width="300" height="161" class="alignnone size-medium wp-image-4836" /></a>

各テスト項目の PASS/FAILED 情報

<a href="https://static.53ningen.com/wp-content/uploads/2019/05/24032707/54be0196c7df5262720844873d05c281.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/05/24032707/54be0196c7df5262720844873d05c281-300x147.png" alt="" width="300" height="147" class="alignnone size-medium wp-image-4834" /></a>
