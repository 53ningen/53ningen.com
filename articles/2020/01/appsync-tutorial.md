---
title: AppSync ことはじめ
category: programming
date: 2020-01-26 16:57:09
tags: [AWS, SAM, GraphQL]
pinned: false
---

## 入門 1: AppSync で Hello, World!

まず AppSync で "Hello, World!" という文字列を返す単純な GraphQL API を作成し、サービスの利用法をみていきます

### スキーマの作成

まずは GraphQL SDL(Schema Definition Language) を用いて GraphQL API のインターフェースを定義していきます。次のような単純な User データを返却する user クエリを定義します。

```
schema {
  query: Query
}

type Query {
  user(id: ID!): User
}

type User {
  id: ID!
  name: String!
}
```

### データソース/リゾルバの作成

ことはじめとして、決まった値を返すようなリゾルバを定義します。

```json
{ "id": 1, "name": "hoge" }
```

データソースは None タイプを選択したものを指定し、レスポンスマッピングテンプレートにて前述の定数値を返すように設定します。

### クエリの実行

次のようなクエリを実行します。定数値を返すレスポンスマッピングテンプレートを設定しているので id を変えても常に同じ値が帰ります。name のみにすると、戻り値に id は含まれなくなります。

```
query {
  user(id: 1) {
    id
    name
  }
}
```

### SAM テンプレート

CloudFormation テンプレートで以上のリソースを表現しておくとわかりやすいかもしれません。次のようになります。

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  Hello AppSync

Resources:
  GraphQLApi:
    Type: AWS::AppSync::GraphQLApi
    Properties:
      Name: GraphQLHello
      AuthenticationType: API_KEY
  GraphQLSchema:
    Type: AWS::AppSync::GraphQLSchema
    Properties:
      ApiId: !GetAtt GraphQLApi.ApiId
      DefinitionS3Location: schema.graphql
  GraphQLNoneDataSource:
    Type: AWS::AppSync::DataSource
    Properties:
      Name: GraphQLNoneDataSource
      ApiId: !GetAtt GraphQLApi.ApiId
      Type: NONE
  GraphQLResolver:
    Type: AWS::AppSync::Resolver
    Properties:
      ApiId: !GetAtt GraphQLApi.ApiId
      TypeName: Query
      FieldName: user
      DataSourceName: !GetAtt GraphQLNoneDataSource.Name
      RequestMappingTemplate: '{"version": "2017-02-28", "payload": {}}'
      ResponseMappingTemplate: '{"id":1, "name":"hoge"}'
  GraphQLAPIKey:
    Type: AWS::AppSync::ApiKey
    Properties:
      ApiId: !GetAtt GraphQLApi.ApiId
```

## 入門 2: 値を Lambda データソースから返却する

定数値をレスポンスマッピングテンプレートから返却するのではなく、Lambda 関数から返してみます。

### データソースの作成

以下のような単純な Lambda 関数を作成し、これをデータソースとして指定します。

```python
import json


def lambda_handler(event, context):
    print(json.dumps(event, ensure_ascii=False))
    return {
        'id': event['id'],
        'name': 'hogefuga'
    }
```

### リゾルバの作成

リゾルバのマッピングテンプレートを以下のように設定すると背後にある Lambda 関数をデータソースとして呼び出せます

```json
# request
{ "version" : "2017-02-28", "operation": "Invoke", "payload": $util.toJson($context.args) }

# response
$util.toJson($context.result)
```

### クエリの実行

以下のようなクエリを実行すると無事 Lambda から返却された id に対応するレスポンスが得られます（name は固定値ですが...）。

```
query {
  user(id: 123) {
    id
    name
  }
}
```

あわせて Lambda 関数の CloudWatch Logs をみると以下のようなイベントが渡っていることがわかります

```python
{
  'id': '123'
}
```

### SAM テンプレート

Lambda 関数が絡んできたので SAM が生きます。テンプレートは以下のようなもの。AppSync から Lambda を実行する際の実行ロールがやや冗長なので、スマートにかけるようになると便利そうですね。

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  Hello AppSync

Resources:
  GraphQLApi:
    Type: AWS::AppSync::GraphQLApi
    Properties:
      Name: GraphQLHello
      AuthenticationType: API_KEY
  GraphQLSchema:
    Type: AWS::AppSync::GraphQLSchema
    Properties:
      ApiId: !GetAtt GraphQLApi.ApiId
      DefinitionS3Location: schema.graphql
  GraphQLDataSourceLambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: get_user/
      Handler: app.lambda_handler
      Runtime: python3.8
  AppSyncLambdaInvokeRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: 2012-10-17
        Statement:
          - Effect: Allow
            Principal:
              Service: appsync.amazonaws.com
            Action:
              - sts:AssumeRole
      Policies:
        - PolicyName: AllowInvokeLambda
          PolicyDocument:
            Version: 2012-10-17
            Statement:
              - Effect: Allow
                Action: lambda:invokeFunction
                Resource: !GetAtt GraphQLDataSourceLambdaFunction.Arn
  GraphQLLambdaDataSource:
    Type: AWS::AppSync::DataSource
    Properties:
      Name: GraphQLLambdaDataSource
      ApiId: !GetAtt GraphQLApi.ApiId
      Type: AWS_LAMBDA
      LambdaConfig:
        LambdaFunctionArn: !GetAtt GraphQLDataSourceLambdaFunction.Arn
      ServiceRoleArn: !GetAtt AppSyncLambdaInvokeRole.Arn
  GraphQLResolver:
    Type: AWS::AppSync::Resolver
    Properties:
      ApiId: !GetAtt GraphQLApi.ApiId
      TypeName: Query
      FieldName: user
      DataSourceName: !GetAtt GraphQLLambdaDataSource.Name
      RequestMappingTemplate: '{ "version" : "2017-02-28", "operation": "Invoke", "payload": $util.toJson($context.args) }'
      ResponseMappingTemplate: '$util.toJson($context.result)'
  GraphQLAPIKey:
    Type: AWS::AppSync::ApiKey
    Properties:
      ApiId: !GetAtt GraphQLApi.ApiId
```

## 入門 3: HTTP データソースの利用

- スキーマは以前と同様にデータソースを HTTP データソースに変更してみる
- 簡単のため JSONPlaceholder の [Users API](https://jsonplaceholder.typicode.com/users/1) を叩く

### データソースの作成

JSONPlaceholder のエンドポイント: https://jsonplaceholder.typicode.com を指定し、データソースを作成する

### リゾルバの作成

リゾルバのマッピングテンプレートを以下のように設定すると背後にある HTTP エンドポイントをデータソースとして呼び出せる

```json
# request
{"version":"2018-05-29","method":"GET","resourcePath":"/users/$ctx.args.id"}

# response
$context.result.body
```

### クエリの実行

以下のようなクエリを実行する

```graphql
query {
  get(id: "3") {
    id
    name
  }
}
```

すると以下のような結果が得られる

```json
{
  "data": {
    "get": {
      "id": "3",
      "name": "Clementine Bauch"
    }
  }
}
```

### SAM テンプレート

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  Hello AppSync

Resources:
  GraphQLApi:
    Type: AWS::AppSync::GraphQLApi
    Properties:
      Name: GraphQLHello
      AuthenticationType: API_KEY
  GraphQLSchema:
    Type: AWS::AppSync::GraphQLSchema
    Properties:
      ApiId: !GetAtt GraphQLApi.ApiId
      DefinitionS3Location: schema.graphql
  GraphQLAPIKey:
    Type: AWS::AppSync::ApiKey
    Properties:
      ApiId: !GetAtt GraphQLApi.ApiId
  GraphQLHTTPDataSource:
    Type: AWS::AppSync::DataSource
    Properties:
      Name: GraphQLHTTPDataSource
      ApiId: !GetAtt GraphQLApi.ApiId
      Type: HTTP
      HttpConfig:
        Endpoint: https://jsonplaceholder.typicode.com
  GraphQLResolver:
    Type: AWS::AppSync::Resolver
    Properties:
      ApiId: !GetAtt GraphQLApi.ApiId
      TypeName: Query
      FieldName: user
      DataSourceName: !GetAtt GraphQLHTTPDataSource.Name
      RequestMappingTemplate: '{"version":"2018-05-29","method":"GET","resourcePath":"/users/$ctx.args.id"}'
      ResponseMappingTemplate: '$context.result.body'
```
