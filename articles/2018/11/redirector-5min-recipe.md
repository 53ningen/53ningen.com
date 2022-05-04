---
title: 5分で立てるリダイレクタ
category: programming
date: 2018-11-16 01:08:23
tags: [AWS, Lambda, APIGateway]
pinned: false
---

たまにリダイレクタたてたいなとなるが、それだけのために、アプリケーションを常に起動しておくだけのサーバーとか設置したくない・管理したくないみたいなことはよくあると思います。

C95 今年の冬コミで出す本で各地の時刻表とか案内ページへ飛ぶ QR コードをうめこもうとしてたのですが、外部サイトで URL 変更などがあるとアレなので、制御できるようにしたいなという気持ちで、原稿作業も押しているのでサクッと終わらせたいという気持ちで API Gateway + Lambda でリダイレクタを作りました。

構成管理もダルいので AWS が出してる [chalice](https://github.com/aws/chalice) というフレームワークを使うことにしました。それは何？という説明をする前に実装をみちゃったほうが早いと思うので紹介します。

## 環境構築

macOS で開発してデプロイします

```
$ sudo pip install chalice
$ # project を作る
$ chalice new-project c95-redirector
$ cd c95-redirector/
```

準備おわり

## 実装コード

なんか勝手にできる `app.py` を編集

```
from chalice import Chalice, Response

app = Chalice(app_name='c95-redirector')

def getRedirectResponse(url):
    return Response(body='', status_code=301, headers={'Content-Type': 'text/plain', 'Location': url})

@app.route('/kumamoto/airportbus-timetables')
def kumamoto_airportBusTimetables():
    url = 'https://www.kyusanko.co.jp/sankobus/airport/limousine/'
    return getRedirectResponse(url)

@app.route('/kumamoto/citytram-timetables')
def kumamoto_cityTramTimeTables():
    url = 'https://www.kumamoto-city-tram.jp/Sys/web01'
    return getRedirectResponse(url)
```

リダイレクタの実装おしまいです

## デプロイ

```
$ aws configure
$ chalice deploy
Creating deployment package.
Updating policy for IAM role: c95-redirector-dev
Updating lambda function: c95-redirector-dev
Updating rest API
Resources deployed:
  - Lambda ARN: arn:aws:lambda:ap-northeast-1:?:function:c95-redirector-dev
  - Rest API URL: https://qd30h0cdoj.execute-api.ap-northeast-1.amazonaws.com/api/
```

デプロイ完了です

## 叩いて遊ぶ

```
$ curl -i https://qd30h0cdoj.execute-api.ap-northeast-1.amazonaws.com/api/kumamoto/citytram-timetables
HTTP/2 301
content-type: text/plain
content-length: 0
location: https://www.kumamoto-city-tram.jp/Sys/web01
date: Thu, 15 Nov 2018 16:07:28 GMT
...
```

5 分で終わった

## 破壊して遊ぶ

```
$ chalice delete --stage dev
Deleting Rest API: qd30h0cdoj
Deleting function: arn:aws:lambda:ap-northeast-1:?:function:c95-redirector-dev
Deleting IAM role: c95-redirector-dev
```

さよなら?

## 感想

API Gateway, Lambda のリソース管理、何も書かずに勝手にやってくれるので、便利

## おまけ

リージョンエンドポイントにカスタムドメインを設定する手順メモ。

まずは aws route53 change-resource-record-sets コマンドで送るリクエスト内容を作る

```
$ vi /tmp/setup-dns-record.json
...
$ cat /tmp/setup-dns-record.json

{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "c95.53ningen.com",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "?.execute-api.ap-northeast-1.amazonaws.com",
          "HostedZoneId": "Z1YSHQZHG15GKL",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
```

setup-dns-record.json を作った上で以下を実行する

```
aws route53 change-resource-record-sets \
    --hosted-zone-id {your-hosted-zone-id} \
    --change-batch file:///tmp/setup-dns-record.json
```
