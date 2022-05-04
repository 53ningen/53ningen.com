---
title: serverless-application-model & sam-cli コードリーディングメモ
category: programming
date: 2019-08-01 01:13:25
tags: [SAM]
pinned: false
---

SAM テンプレートでいろんなツールを構成しているなかで、なんかプルリク投げることが多くなってきたので、serverless-application-model と aws-sam-cli のソースコードの構成や設計、依存関係について気になったところを自分向けにメモ

ただ OSS のコードリーディングメモなので、いかなるときも GitHub リポジトリの現在の状況が正しいので、正確性は実際にリポジトリを参考に確認してください

あと自分は Python を今年の 3 月 9 日から書き始め、まだ数ヶ月しかたってないので実際 Python についてはよく知らないけどだいたい Pycharm がおしえてくれるのでそれを信じてる

## リポジトリの構造メモ

### SAM CLI と SAM の関係性

> - 参考 pull request: [Chore: Bump aws-sam-translator by jfuss · Pull Request #1043 · awslabs/aws-sam-cli](https://github.com/awslabs/aws-sam-cli/pull/1043)
> - 参考 issue: [Add support for MinimumCompressionSize by rm-hull · Pull Request #786 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/786)

- awslabs/serverless-application-model の成果物は pip の aws-sam-translator としてリリースされるようだ
- awslabs/aws-sam-cli 側にて該当 pip パッケージへの依存は `requirements/base.txt` で定義されており、バージョンアップ時に bump する形
- したがって流れとしては SAM 側の変更がまず develop に取り込まれ aws-sam-translator のリリース待ち状態となり、これがリリースされると SAM CLI 側で該当のパッケージへの依存がアップデートされ、最終的にそちらのリリース待ちとなるようだ
- dev 版の SAM CLI である `samdev` は[ここに書いてある手順](https://github.com/awslabs/aws-sam-cli/blob/develop/DEVELOPMENT_GUIDE.md#3-install-dev-version-of-sam-cli)で導入可能なので、新機能をいち早く使いたければこれを用いる
- また、まだリリースされてない aws-sam-translator の機能を使いたい場合は、[ここに書いてある手順](https://github.com/awslabs/aws-sam-cli/blob/develop/DEVELOPMENT_GUIDE.md#4-optional-install-development-version-of-sam-transformer)にしたがう

> SAM is made up of two components: SAM translator and SAM CLI.
>
> SAM translator is a CloudFormation transform managed by AWS. For fixes to the SAM translator (maintained in this GitHub repository), you do not need to install/upgrade any software to pick up the latest deployed changes.
>
> SAM CLI is a client-side tool that you install on your local client. It is maintained in a separate GitHub repository, and you do have to update it to pick up new features/fixes. You can find more information on how to install SAM CLI here:
> ([SAM Creates stage named "Stage" by default? · Issue #191 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/issues/191))

### input/output test とは

- aws-sam-translator は基本的に YAML を変換するだけのソフトウェア
- このリポジトリは README に書いてあるとおり、たくさんのテストにより、ふるまいの破壊的な変更を防いでいる
- input/output test とはその名のとおり、input の YAML が最終的にどのような CloudFormation テンプレートに翻訳されるのかをテストするものになる
  - tests/translator 下の input, output にそれぞれ元の YAML と変換後の JSON を突っ込む
  - output については正常系は aws-us-gov, aws-cn, その他の 3 つのファイルを追加する必要がある点に注意

## ソースコードリーディングメモ

### 論理 ID のランダム生成は `logical_id_generator` が行なっている

- [API Gateway のステージ名が `_` を含んでいるとエラーになる問題](https://github.com/awslabs/serverless-application-model/issues/1002) があり、その修正 pull request が丁寧でとても参考になる
- pull request の Author は、変更が破壊的にならないように `_` を含んでいないステージ名のリソースに関しては[これまでと論理 ID の生成ロジックを変更しないように工夫をしている](https://github.com/awslabs/serverless-application-model/pull/1035/files#diff-58d63ba69dc51b53e9e1ab5b65948e04R188-R189)
- ところで論理 ID には `_` を含んではいけないので、それが含まれるものには `samtranslator.translator.logical_id_generator` を用いてランダムな ID を生成するという形をとっている
  - この issue に着手しようとして、この部分に悩んでいるうちに pull request が出ていてなるほどなーとなったのでメモ

### Lambda のイベントトリガーと EventSource モデル

- Lambda 関数をトリガーするイベントソースの簡易的な記法をサポートするためのモデル群
- push 型, pull 型に分類され、それぞれ `samtranslator/model/eventsources/{pull,push}.py` に記述されている
  - push 型は Lambda を Invoke するパーミッションを与える必要があるため `Lambda::Permission` リソースを作成する基底クラスを継承している
  - pull 型は Lambda に EventSourceMapping を設定する必要があるため `Lambda::EventSourceMapping` リソースを作成し、関数のロールに各イベントソースからデータを取得するためのポリシーを追加してあげるような基底クラスを継承している

## aws-sam-cli & sam-translator 一般のハナシ

### deploy 時のアレコレ

- `--parameter-overrides` でパラメタ指定

```
sam deploy --template-file packaged.yaml --stack-name $StackName --capabilities CAPABILITY_NAMED_IAM --profile $AWSProfile \
  --parameter-overrides \
    "Param1=Value1"
```

### sam logs コマンド

[sam logs - AWS Serverless Application Model](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-logs.html) 参照

```
sam logs [-n FUNCTION_NAME] [--stack-name STACK_NAME]
```

## 開発時のメモ

### transform 動作の確認

ローカルの sam transformer を使ってテンプレートを変換するときの手順([開発ガイド](https://github.com/awslabs/serverless-application-model/blob/master/DEVELOPMENT_GUIDE.rst)に載ってる)

```
aws cloudformation package --template-file MY_TEMPLATE_PATH --output-template-file output-template.yaml --s3-bucket MY_S3_BUCKET

bin/sam-translate.py --template-file=output-template.yaml

aws cloudformation deploy --template-file cfn-template.json --capabilities CAPABILITY_NAMED_IAM --stack-name MY_STACK_NAME
```

## 関わった変更メモ

一覧: [53ningen (gomi_ningen)](https://github.com/53ningen?org=awslabs)

### WIP

#### Custom Statements の組み込み関数対応

> issue: [Can not use Fn::if within CustomStatements: · Issue #1218 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/issues/1218)

- Looks like this code isn't taking intrinsic functions into account
  - 英語表現: "take A into account" 「A を考慮する」というの知らなかったのでちょっと迷った

組み込み関数の一覧はドキュメントに書いてある: [組み込み関数リファレンス](https://docs.aws.amazon.com/ja_jp/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference.html)

- Fn::Base64
- Fn::Cidr
- 条件関数
  - Fn::And
  - Fn::Equals
  - Fn::If
  - Fn::Not
  - Fn::Or
- Fn::FindInMap
- Fn::GetAtt
- Fn::GetAZs
- Fn::ImportValue
- Fn::Join
- Fn::Select
- Fn::Split
- Fn::Sub
- Fn::Transform
- Ref

内容的には If だけ対応すればよさそう？（確認する）

### 2019 年 11 月の contributions

#### SNS-SQS-Lambda オプションに既存のキューを指定できるようにした

> pull request: [feat: Add an existing SQS queue option to SNS event by 53ningen · Pull Request #1231 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1231)

#### 落ちてたテストなおした

> pull request: [fix: failed tests by 53ningen · Pull Request #1234 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1234)

#### ドキュメントの誤りを修正

> pull request: [chore(docs): fix a cognito event source example by 53ningen · Pull Request #1233 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1233)

### 2019 年 10 月の contributions

#### DynamoDBDStreamReadPolicy の修正

> [fix(PolicyTemplate): DynamoDBStreamReadPolicy by 53ningen · Pull Request #1222 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1222)

根本的に ARN とリソースの指定間違ってたっぽいので直した
変更内容はいつもの... って感じだ

#### typo 修正

> pull request: [chore: typo in swagger.py by 53ningen · Pull Request #1220 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1220)

- swagger.py に関連する Issue に取り組んだ時に見つけたので、クソリプっぽいけど出しておいた

### 2019 年 8 月の contributions

#### SNS -> SQS -> Lambda 連携オプションの実装

> pull request: [feat: Add SQS option to SNS event by 53ningen · Pull Request #1065 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1065)

- 個人的にとても欲しかった機能で issue が立っていたので自分で実装した
- SNS -> SQS -> Lambda の連携をサクッと行える変更を作成したが、SNS -> Lambda は push 型なのに対し、SNS -> SQS -> Lambda は Lambda のイベントソース的には pull 型にあたるため `push.py` 内で `pull.py` を import する必要があった
- あるシンタックスに対して新規にリソースを生成する場合は `docs/internal` を更新する必要がある旨を[指摘してもらった](https://github.com/awslabs/serverless-application-model/pull/1065#pullrequestreview-273286526)

ところで issue には SqsSubscription に object を突っ込めるようになっており、既存のキューなどを指定できるようになっている。この場合 SQS のポリシーで QueueUrl と QueueARN が必要なのだが、このあたりをどうすべきか悩んでしまったので一旦 boolean で受け付ける機能を pull request して、その後 issue で議論しようという方針に決めた（そのほうが差分が小さくなるし、大多数のひとは中間のキューを管理したくはないハズ）。

#### ApplicationId の null チェック漏れ修正

> pull request: [fix: make sure ApplicationId is not null by 53ningen · Pull Request #1062 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1062)

- 簡単そうにみえて、なんか `serverless_app_plugin.py` は raise した例外の扱いが一般的なリソースと違うっぽい？
  - ちょっとこのあたり確認が必要そう

#### sam init で生成される Java のプロジェクトのメモリを明示的に指定

> pull request: [fix: Use explicit memory settings for Java cookie cutters by 53ningen · Pull Request #1340 · awslabs/aws-sam-cli](https://github.com/awslabs/aws-sam-cli/pull/1340)

- aws-sam-cli 側への最初の pull request
- この作業によりテンプレートファイルのありかとこのリポジトリへの pull request の作法がわかりました
  - `samcli/local/init/templates/` に各種テンプレがあります

#### SSMParameterReadPolicy に ssm:GetParametersByPath の許可を追加

> pull request: [feat: add ssm:GetParametersByPath to SSMParameterReadPolicy by 53ningen · Pull Request #1084 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1084/files)

- 単純なポリシーテンプレートの機能追加

### 2019 年 7 月の contributions

#### Lambda の SNS トリガーのソースとして異なるリージョンのトピックを指定できる機能を追加

> pull request: [Add support to specify a SNS topic that belongs to a different region by 53ningen · Pull Request #989 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/989)

- Lambda のイベントソースに関するオブジェクトは基本的に `samtranslator/model/eventsources/` にある
- とくに SNS からの通知はプッシュイベントなので、 `push.py` に定義されている
- あとは、該当の Property を増やして、生成される CloudFormation テンプレートの内容に反映されるようにコードを書き換えるだけで機能追加は終了
- あとは良き感じにテストとドキュメントを更新

#### RekognitionFacesPolicy の不要なパラメータの除外

> pull request: [Remove unused CollectionId parameter of RekognitionFacesPolicy by 53ningen · Pull Request #985 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/985)

- ポリシーテンプレートの変更の仕組みは良き感じに JSON で定義できるようになっている
  - `samtranslator/policy_templates_data/policy_templates.json` が変換の定義を行う JSON ファイル
- この手の変更は基本的には、前述の JSON の変更と input/output テストだけで良さそう

#### Lambda 関数のパスパラメータに対するパーミッション設定のバグを修正

> pull request: [fix: "Invalid permissions on Lambda function" on path parameter by 53ningen · Pull Request #992 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/992)

- API Gateway のパスパラメータに対するパーミッションの設定がおかしい（けどなんか動いちゃってるやつ）を修正した
- 修正はめっちゃ単純でプロキシパスを replace しているところを、プロキシパス or パスパラメータを表現する正規表現でマッチしてリプレイスするようにしただけなので、あんまり面白くない

#### SimpleTable の PrimaryKey に Name or Type が指定されてないときの例外処理が抜けてる件について

> pull request: [fix: make sure Name and Type exists as a property of PrimaryKey of SimpleTable by 53ningen · Pull Request #1054 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1054)

- なおした
- 単純に to_cloudformation 内の該当箇所にて null チェック的なことして、アレだったら InvalidResourceException を投げるように追記しただけ

#### api_cognito_auth のサンプルが us-east-1 以外でちゃんと動かない件について

> pull reuqest: [fix: hard corded region and stack name of api_cognito_auth example by 53ningen · Pull Request #1049 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/pull/1049)

- package.json にスタック名とリージョンがハードコードされてた
- コミットメッセージ思いっきり間違っててスマンって感じだ
  - cord ってなんだよ　紐かよ
  - develop に取り込むタイミングでメンテナが正しい英語に直してくれました、世界平和 ?

#### docstring がコピペだったので修正

> pull reuqest: [nits: docstring of PushEventReource classes may be incorrect · Issue #1017 · awslabs/serverless-application-model](https://github.com/awslabs/serverless-application-model/issues/1017)

- クソリプ的 pull request だけでみつけちゃったので一応なげといた
