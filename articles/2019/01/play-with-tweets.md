---
slug: play-with-tweets
title: twitter のストリーミングデータで遊ぶ
category: programming
date: 2019-01-20 22:54:15
tags: [AWS, Lambda, python, Kinesis]
pinned: false
---

Twitter のストリーミングデータを Kinesis Data Stream に流し込み、Lambda にてバッチ処理する簡単な連携の方法をまとめておきます。慣れていれば 15 分で構築できます。ベンリ。

## Kinesis Data Stream を作成する

以下のようなコマンドで簡単につくれます。

```
$ aws kinesis create-stream --stream-name tweets --shard-count 1
```

オプションで指定しているシャードとは以下のような概念となります。

> **シャード**
> シャードは、ストリーム内の一意に識別されたデータレコードのシーケンスです。ストリームは複数のシャードで構成され、各シャードが容量の 1 単位になります。各シャードは 読み取りは最大 1 秒あたり 5 件のトランザクション、データ読み取りの最大合計レートは 1 秒あたり 2 MB と 書き込みについては最大 1 秒あたり 1,000 レコード、データの最大書き込み合計レートは 1 秒あたり 1 MB (パーティションキーを含む) をサポートできます。ストリームのデータ容量は、ストリームに指定したシャードの数によって決まります。ストリームの総容量はシャードの容量の合計です。
>
> データ転送速度が増加した場合、ストリームに割り当てられたシャード数を増やしたり、減らしたりできます。（[Kinesis Data Streams の主要なコンセプト - Amazon Kinesis Data Streams](https://docs.aws.amazon.com/ja_jp/streams/latest/dev/key-concepts.html) より）

つまり、以下のような 1 シャードあたりの制限数を超えそうな時に、ストリームに割り当てるシャードの数を増減させ、負荷に対応するというものと考えてよさそうですね。

- 1 シャード 1 秒あたりの読み取りトランザクション数: 5 件
- 1 シャード 1 秒あたりのデータ読み取りの最大合計レード: 2MB
- 1 シャード 1 秒あたりの書き込みレコード数: 1000 レコード
- 1 シャード 1 秒あたりのデータ書き込みの最大合計レード: 1MB

ひとまず、今回は 1 アカウントのタイムラインを拾うことを考えるので shard-count = 1 としてストリームを作成しました。

## Twitter からデータを取得し Kinesis Data Stream に突っ込むスクリプトを書く

[POST statuses/filter.json](https://developer.twitter.com/en/docs/tweets/filter-realtime/api-reference/post-statuses-filter.html) からデータをとってきます。

```python
import json
import boto3
import credentials
from TwitterAPI import TwitterAPI

stream_name="tweets"

consumer_key=<value>
consumer_secret=<value>
access_token_key=<value>
access_token_secret=<value>

twitter = TwitterAPI(consumer_key, consumer_secret, access_token_key, access_token_secret)
kinesis = boto3.client("kinesis", region_name="ap-northeast-1")

id = json.loads(twitter.request("users/show", {"screen_name": "gomi_ningen"}).response.content.decode())["id_str"]
res = twitter.request("statuses/filter", {"follow": id})

for item in res:
    #print(json.dumps(item, ensure_ascii=False)) #=> for debug
    kinesis.put_record(StreamName=stream_name,Data=json.dumps(item),PartitionKey=id)
```

Kinesis Data Stream にデータをつっこむときにパーティションキーを指定していますが、これは以下のような概念です

> パーティションキー
> パーティションキーは、ストリーム内のデータをシャード別にグループ化します。Kinesis Data Streams は、ストリームに属するデータレコードを複数のシャードに分離します。この際、各データレコードに関連付けられたパーティションキーを使用して、配分先のシャードを決定します。パーティションキーは最大 256 バイト長の Unicode 文字列です。MD5 ハッシュ関数を使用してパーティションキーを 128 ビットの整数値にマッピングし、関連付けられたデータレコードをシャードにマッピングします。アプリケーションは、ストリームにデータを配置するときに、パーティションキーを指定する必要があります。（[Kinesis Data Streams の主要なコンセプト - Amazon Kinesis Data Streams](https://docs.aws.amazon.com/ja_jp/streams/latest/dev/key-concepts.html) より）

シャードが 1 つしかないので今回は適当で問題ないですが、色々増えたときのためにここはひとまず id をパーティションキーに指定しておきます。

## Lambda におけるバッチ処理

Kinesis Data Stream に突っ込むところまでやっておけば、例えば tweet を Slack に連携するとか、バッチ処理側の実装次第で色々遊べるわけですね。

Kinesis Data Stream からは次のようなデータが event 変数に格納されて飛んできます。

```json
{
  "Records": [
    {
      "kinesis": {
        "kinesisSchemaVersion": "1.0",
        "partitionKey": "379..",
        "sequenceNumber": "4959219..",
        "data": "eyJjcm...",
        "approximateArrivalTimestamp": 15479...
      },
      "eventSource": "aws:kinesis",
      "eventVersion": "1.0",
      "eventID": "shardId-000000000000:....",
      "eventName": "aws:kinesis:record",
      "invokeIdentityArn": "?",
      "awsRegion": "ap-northeast-1",
      "eventSourceARN": "?"
    }
  ]
}
```

Records[].kinesis.data の中身を取り出せば OK ですが、base64 エンコーディングされているのでちょっとだけ手をいれてやる必要があります。単純に CloudWatch Logs に出力させるだけならば以下のような Lambda 関数で OK でしょう。

```python
import json
import boto3
import base64

def lambda_handler(event, context):
    for record in event['Records']:
        data = json.loads(base64.b64decode(record['kinesis']['data']))
        print(json.dumps(data, ensure_ascii=False))
```

あとは Lambda のコンソールから Kinesis Data Stream をイベントソースとして指定してあげて、CloudWatch Logs を眺めてると該当ユーザーのツイートが流れて来ます。

### ツイ消しやリツイート、リプライを拾ってしまう問題について

該当ユーザーへのリプライ/RT、あるいは該当ユーザーのツイ消し情報も流れて来てしまうのでお好みでよしなに Lambda 側で実装を変えてあげればよいでしょう。

ツイ消しは以下のような形式の JSON が飛んできます

```json
{
  "delete": {
    "status": {
      "id": 1086948881147998200,
      "id_str": "1086948881147998209",
      "user_id": 37937394,
      "user_id_str": "37937394"
    },
    "timestamp_ms": "1547983789028"
  }
}
```

また、リプライやリツイートをした主のユーザー ID が user.id 部に入ります。したがって以下のように実装すると良い感じに必要なデータだけ取れます。

```
import json
import boto3
import base64

user_id = 37937394 #=> @gomi_ningen

def lambda_handler(event, context):
    for record in event['Records']:
        data = json.loads(base64.b64decode(record['kinesis']['data']))
        if data.get('user', {}).get('id', {}) == user_id:
            print(json.dumps(data, ensure_ascii=False))
        else:
            print('ignored record')
```

## CloudWatch Logs Insights で出力したデータを検索する

CloudWatch Logs に出力していれば、簡単な検索が行えます。たとえば gomi2ngen さんへのリプライツイートだけ拾いたいときはイベントのフィルターとして `{ $. in_reply_to_screen_name = "gomi2ngen" }` と指定してあげれば OK。

```
aws logs filter-log-events \
  --log-group-name  /aws/lambda/OutputKinesisStreamData \
  --filter-pattern '{ $.in_reply_to_screen_name = "gomi2ngen"}'
{
  "events": [
    {
      "logStreamName": "2019/01/20/[$LATEST]...",
      "timestamp": ...,
      "message": "{...
（以下略）
```

CloudWatch Logs Insight を使うとたとえば次のようなクエリ式で同様の検索が可能で、さらに必要に応じて良い感じに可視化可能です。

```
fields @timestamp, @message
| filter in_reply_to_screen_name == "gomi2ngen"
| sort @timestamp desc
| limit 25
```

<a href="https://static.53ningen.com/wp-content/uploads/2019/01/20225220/46fda0e9e66f7e121346ac5770564b69.png"><img src="https://static.53ningen.com/wp-content/uploads/2019/01/20225220/46fda0e9e66f7e121346ac5770564b69-1024x498.png" alt="" width="640" height="311" class="alignnone size-large wp-image-4429" /></a>

## Dynamo DB につっこんでおく

拾ったデータを Dynamo DB につっこんでおきたい場合は、まず以下のような形で Dynamo DB をテーブルを作成します。

```
$ aws dynamodb create-table --table-name tweets \
  --attribute-definitions \
    AttributeName=id,AttributeType=N \
    AttributeName=timestamp,AttributeType=N \
  --key-schema \
    AttributeName=id,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1
```

次に Lambda 関数の実装を変更します

```python
...
```
