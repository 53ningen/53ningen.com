---
slug: lambda-sns-endpoint
title: AWS Lambda を用いた Amazon SNS のエンドポイント整理
category: programming
date: 2016-05-28 15:40:11
tags: [Scala, AWS]
pinned: false
---

Amazon SNS の Application に紐付いているエンドポイントには `Enabled` という `Attribute` がついています。文字どおり、有効なエンドポイントかどうかを表すものです。Amazon SNS は賢いので `APNS` や `GCM` からのフィードバックを受けて、プッシュトークンが無効になった場合に自動的に false にしてくれます。しかし、基本的には `Enabled` が `false` になったエンドポイントは不要です。したがって、これらを自動的に削除するような仕組みがあったほうがよさそうです。そこで、この記事では AWS Lambda を用いて、それを実現する方法について説明します。

## AWS Lambda で動かすスクリプト

コード自体は非常に簡単で以下のような形です。AWS Lambda Function を素早く立ち上げるとしたら本来は `python` か `node.js` のほうが良いかと思いますが、今回の作りたいものに関してはそれほど即時性を求められるようなものではないと思うので、好きな言語（もちろん Lambda でうごくもの）で問題ないと思います。

```
import com.amazonaws.auth.{AWSCredentials, BasicAWSCredentials}
import com.amazonaws.regions.{Region, Regions}
import com.amazonaws.services.lambda.runtime.events.SNSEvent
import com.amazonaws.services.lambda.runtime.{Context, RequestHandler}
import com.amazonaws.services.sns.AmazonSNSClient
import com.amazonaws.services.sns.model.{DeleteEndpointRequest, GetEndpointAttributesRequest}
import com.typesafe.config.ConfigFactory
import com.typesafe.scalalogging.slf4j.StrictLogging
import org.json4s._
import org.json4s.native.JsonMethods._

import scala.collection.JavaConversions._

object DeleteEndpointAction extends RequestHandler[SNSEvent, Unit] with StrictLogging {

  private type EndpointArn = String

  private val conf = ConfigFactory.load()
  private val credential: AWSCredentials = new BasicAWSCredentials(conf.getString("amazon_sns.access_key"), conf.getString("amazon_sns.access_secret"))
  private val snsClient: AmazonSNSClient = new AmazonSNSClient(credential).withRegion(Region.getRegion(Regions.fromName(conf.getString("amazon_sns.region"))))

  override def handleRequest(input: SNSEvent, context: Context) = {
    val records = input.getRecords.toList
    records.foreach { record =>
      val message = record.getSNS.getMessage
      if (message != null) {
        getEndpointArn(message).foreach { endpointArn =>
          logger.info(s"check if enabled: endpoint_arn = $endpointArn")
          val enabled = getEnabled(endpointArn).getOrElse(true)
          if (!enabled) {
            logger.info(s"delete disabled endpoint: endpoint_arn = $endpointArn")
            deleteEndpoint(endpointArn)
          }
        }
      } else {
        logger.error(s"receive empty message: message_id = ${record.getSNS.getMessageId}")
      }
    }
  }

  private def getEndpointArn(message: String): Option[EndpointArn] =
    for {
      JObject(child) <- parse(message)
      JField("EndpointArn", JString(resource)) <- child
    } yield resource.headOption

  private def getEnabled(endpointArn: EndpointArn): Option[Boolean] = {
    val request = new GetEndpointAttributesRequest().withEndpointArn(endpointArn)
    try {
      val result = snsClient.getEndpointAttributes(request)
      result.getAttributes.toMap.get("Enabled").map(_ == "true")
    } catch {
      case e: Throwable =>
        logger.error("failed to get endpoint attributes", e)
        None
    }
  }

  private def deleteEndpoint(endpointArn: EndpointArn) = {
    val request = new DeleteEndpointRequest().withEndpointArn(endpointArn)
    try {
      snsClient.deleteEndpoint(request)
    } catch {
      case e: Throwable => logger.error("failed to delete endpoint", e)
    }
  }

}
```

`json4s` とか `typesafe config` とか `scala logging` とか使ってます。よい塩梅に `jar` に固めて、 Lambda Function を作って、アップロードしてください。これで AWS Lambda 側の準備は完了です。

## Amazon SNS 側の連携設定

Amazon SNS 側の作業は次の 2 点になります。

1. 先ほど作った AWS Lambda Function の実行をフックさせるためトピックを作成し、購読（Subscribe）させる
2. エンドポイントの整理をしたい対象の Application の持つエンドポイントの状態変化をフックして、トピックに通知を送るように設定する

それぞれについて見ていきましょう。

### トピックおよび、サブスクリプションの作成

トピックの作成は通常どおり普通にやってあげれば大丈夫です。とりあえず適当に「endpoint-updated-topic」とでも名前をつけておきましょう。続いて作成したトピックを先ほど作成した Lambda Function に購読させましょう。以下のような形で Protocol で AWS Lambda を選択すれば Endpoint のプルダウンリストに先ほど作成した Lambda Function の ARN がでてくるでしょう。

<img src="http://53ningen.com/wp-content/uploads/2016/05/d1ec09133e1e0aa967883e79800867ec.png" alt="スクリーンショット 2016-05-26 0.41.37" width="1838" height="828" class="aligncenter size-full wp-image-439" />

### Application のイベント設定

最後に Amazon SNS の Application に紐づくエンドポイントの `Attributes` が変化したイベントをトピックに通知させるように設定します。 Application 一覧の画面で設定対象のアイテムを選択し Actions から configure events を選択してください。

<img src="http://53ningen.com/wp-content/uploads/2016/05/ff9a3562fadde4db8759cb8a7eb0c3d0.png" alt="スクリーンショット 2016-05-26 0.46.00" width="1260" height="468" class="aligncenter size-full wp-image-441" />

そして、次に表示されるダイアログの `Endpoint Updated` の項目に、先ほどつくったトピックの ARN を入力すれば、すべての作業は完了です。

<img src="http://53ningen.com/wp-content/uploads/2016/05/cf0c1188f9740493d78dbdddf8181e73.png" alt="スクリーンショット 2016-05-26 0.48.25" width="1828" height="1096" class="aligncenter size-full wp-image-442" />

### 動作確認テスト

設定が終わったら適当に Application へ Endpoint を追加してみて、Edit Endpoint Attributes から Enable を false にしてみてください。きっと自動的にエンドポイントが削除されるはずです。

<img src="http://53ningen.com/wp-content/uploads/2016/05/22599963e3f0d1eea63a4ff8721f78bd.png" alt="スクリーンショット 2016-05-26 0.50.55" width="2122" height="878" class="aligncenter size-full wp-image-443" />

Application エンドポイントの Attribute 変更以外にも、作成イベント、削除イベントなどをフックすることができるので、やり方次第では様々な連携を AWS Lambda を用いて行うことができると思います。
