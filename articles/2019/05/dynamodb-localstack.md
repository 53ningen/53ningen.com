---
slug: dynamodb-localstack
title: DynamoDB local と localstack の導入
category: programming
date: 2019-05-12 15:34:48
tags: [Serverless, Lambda, DynamoDB, localstack]
pinned: false
---

## DynamoDB local について

[公式ドキュメント](https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html) に記載されているように `.jar` ファイル形式で提供されていて、ダウンロードして手軽に使えます。

### 導入手順

以下のようにお手軽に利用可能

```
$ wget https://s3-ap-northeast-1.amazonaws.com/dynamodb-local-tokyo/dynamodb_local_latest.zip
$ unzip dynamodb_local_latest
$ java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
$ aws configure #=> 認証情報が空の場合は fake でもよいので設定しておく必要がある
$ aws dynamodb list-tables --endpoint-url http://localhost:8000
{
    "TableNames": []
}
```

### Docker イメージの利用

便利な [Docker イメージ](https://hub.docker.com/r/amazon/dynamodb-local)も提供されているので、こちらを使うともっとお手軽

```
$ docker pull amazon/dynamodb-local
$ docker run -p 8000:8000 amazon/dynamodb-local
...

$ aws dynamodb list-tables --endpoint-url http://localhost:8000
{
    "TableNames": []
}
```

### ブラウザで DynamoDB local を操作できる

http://localhost:8000/shell/ にアクセスするといい感じの UI で操作できます。とても便利ですね。

### サーバーレスアプリケーションとの組み合わせ

実際にはサーバーレスアプリケーションとの組み合わせでテスト実行や CI 時にローカルの DyanamoDB を利用することがおおいと思います。

コンテナの起動は以下のような具合でやります

```
$ docker run --name dynamodb -p 8000:8000 amazon/dynamodb-local
...
^C
$ docker start dynamodb
$ docker ps -a
CONTAINER ID        IMAGE                   COMMAND                  CREATED             STATUS              PORTS                    NAMES
f725804937d7        amazon/dynamodb-local   "java -jar DynamoDBL…"   48 seconds ago      Up 38 seconds       0.0.0.0:8000->8000/tcp   dynamodb
```

そんでもって Lambda 関数がローカルで実行されているときのみ localhost:8000 へリクエストを送るようにクライアントコードを調整します

```
dynamodb = boto3.resource('dynamodb', region_name=aws_region, endpoint_url="http://dynamodb:8000")
```

最後に DynamoDB local と同じネットワークで sam local invoke すれば良い

```
$ sam local invoke FUNC_NAME --no-event \
    --env-vars vars.json \
    --docker-network `docker network ls | grep NETWORK_NAME | awk '{print $1}'`
```

## localstack の利用

DynamoDB 以外もさまざまな AWS コンポーネントをローカルでエミュレートするような localstack というものがあり、とてもベンリ

### 導入方法

- docker イメージを利用するのがよさそう
- `docker-compose.yaml` を以下のように記述し、`docker-compose up -d`
  - 現状 Kinesis, DynamoDB, Elasticsearch, S3 だけは DATA_DIR に操作内容が保存される

```
---

version: '3.2'
services:
  localstack:
    image: localstack/localstack:latest
    container_name: monita-sls-sandbox
    ports:
      - '4563-4584:4563-4584'
    environment:
      - SERVICES=s3,sns
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - './.localstack:/tmp/localstack'
      - '/var/run/docker.sock:/var/run/docker.sock'
```

### awscli-local の導入

- `aws --endpoint-url=http://localhost:XXXX` と毎回入力するのは面倒なので、そのあたりをラップしてくれる [localstack/awscli-local](https://github.com/localstack/awscli-local) コマンドがベンリ
- 導入方法は以下のようにワンコマンド

```
$ pip install awscli-local
```

すると以下のように煩わしさがだいぶ緩和する

```
$ awslocal s3api create-bucket --bucket sam-lambda-layers
$ awslocal s3 ls
2006-02-04 01:45:09 sam-lambda-layers
```

あとはだいたい DynamoDB local とおなじように環境変数の準備して、localstack と同じネットワークで `sam local invoke` すれば OK
