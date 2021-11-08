---
slug: sam-web-fw
title: SAM テンプレートと軽量ウェブフレームワーク
category: programming
date: 2019-08-08 01:47:01
tags: [SAM]
pinned: false
---

- SAM で定義した Lambda 関数 + API Gateway の組み合わせの構成についてのメモ
- SAM ベースなので以下のようなことが実現できる
  - 簡単な作成・破壊できるものをサクッと実装して、試したい
  - デプロイも楽したい
  - ただ API Gateway, Lambda 以外のリソースも必要でいい塩梅に一括で管理しときたい
- 各 F/W を試している限りでは、ほぼほぼ素直に動く

## python: flask

awsgi を使うと良き感じに使える

### SAM テンプレート

```
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 10
    Runtime: python3.7

Resources:
  ApiBackendFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: api_backend/
      Handler: app.lambda_handler
      Events:
        HttpGet:
          Type: Api
          Properties:
            Path: '/'
            Method: GET
        HttpGetProxy:
          Type: Api
          Properties:
            Path: '/{proxy+}'
            Method: GET

Outputs:
  HttpGetHelloApi:
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello"
```

### Lambda 関数の実装コード

```py
# -*- coding: utf-8 -*-

from flask import Flask, jsonify
import awsgi

app = Flask('sam-chalice')
app.config['JSON_AS_ASCII'] = False


@app.route('/hello')
def index():
    return jsonify({'hello': 'world'})


@app.route('/hello/<name>')
def hello_name(name):
    return jsonify({'hello': name})


def lambda_handler(event, context):
    return awsgi.response(app, event, context)

```

## python: flask + jinja2

flask + jinja2 でテンプレートウェブページ生成も行えます

### SAM テンプレート

```
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 10
    Runtime: python3.7

Resources:
  ApiBackendFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: api_backend/
      Handler: app.lambda_handler
      Events:
        HttpGet:
          Type: Api
          Properties:
            Path: '/'
            Method: GET
        HttpGetProxy:
          Type: Api
          Properties:
            Path: '/{proxy+}'
            Method: GET

Outputs:
  HttpGetApi:
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod"
```

### Lambda 関数の実装

```py
# -*- coding: utf-8 -*-

from datetime import datetime, timezone, timedelta
from flask import Flask, render_template
import awsgi

app = Flask('sam-chalice')
app.config['JSON_AS_ASCII'] = False


@app.route('/')
def index():
    jst = timezone(timedelta(hours=+9), 'JST')
    now = datetime.now(tz=jst).strftime('%Y-%m-%d %H:%M:%S')
    message = f'現在時刻: {now}'
    return render_template('index.html', message=message)


def lambda_handler(event, context):
    return awsgi.response(app, event, context)
```

### テンプレートファイル（templates/index.html）

```html
<html>
  <body>
    {% if message %}
    <p>{{message}}</p>
    {% endif %}
  </body>
</html>
```

## python: Chalice

SAM で定義した Lambda 関数内にて Chalice の `@route` デコレータを使ってパスに応じた処理を行わせるだけの処理についてのメモ。基本的に確認している限りでは素直に動いてくれる。

### SAM テンプレート

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 10
    Runtime: python3.7

Resources:
  ApiBackendFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: api_backend/
      Handler: app.resources
      Events:
        HttpGetHello:
          Type: Api
          Properties:
            Path: '/hello'
            Method: GET
        HttpGetHelloName:
          Type: Api
          Properties:
            Path: '/hello/{name}'
            Method: GET
        HttpPostHelloName:
          Type: Api
          Properties:
            Path: '/users'
            Method: POST

Outputs:
  HttpGetHelloApi:
    Value: !Sub 'https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/hello/'
```

### Lambda 関数の実装コード

```py
# -*- coding: utf-8 -*-

from chalice import Chalice

resources = Chalice('sam-chalice')


@resources.route('/hello')
def index():
    return {'hello': 'world'}


@resources.route('/hello/{name}')
def hello_name(name):
    return {'hello': name}


@resources.route('/users', methods=['POST'])
def create_user():
    user_as_json = resources.current_request.json_body
    return {'user': user_as_json}

```

### 実行結果

```bash
$ curl https://にゃ〜ん.execute-api.ap-northeast-1.amazonaws.com/Prod/hello/
{"hello":"world"}

$ curl https://にゃ〜ん.execute-api.ap-northeast-1.amazonaws.com/Prod/hello/keiichi
{"hello":"keiichi"}

$ curl -X POST https://にゃ〜ん.execute-api.ap-northeast-1.amazonaws.com/Prod/users -H "Content-Type: application/json" --data '"hidekazu"'
{"user":"hidekazu"}
```

# おまけ: SAM でお手軽に API Gateway に認証を追加する

## SAM を使うとお手軽に API Gateway に認証を設定できる
