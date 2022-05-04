---
title: ActiveMQ の基本的な操作
category: programming
date: 2022-04-12 23:24:00
tags: [ActiveMQ]
pinned: false
---

## ActiveMQ の導入

- サーバーに ActiveMQ を導入するほか、Amazon MQ のマネージドな ActiveMQ ブローカーを利用することも可能
- セルフホスティングする際にはドキュメントに沿って作業を行う: https://activemq.apache.org/getting-started

#### Amazon Linux への ActiveMQ の導入

```
$ sudo yum update -y
$ sudo amazon-linux-extras install java-openjdk11 -y
$ java --version
openjdk 11.0.13 2021-10-19 LTS
OpenJDK Runtime Environment 18.9 (build 11.0.13+8-LTS)
OpenJDK 64-Bit Server VM 18.9 (build 11.0.13+8-LTS, mixed mode, sharing)
$
$ wget https://apache.mirror.iphh.net/activemq/5.17.0/apache-activemq-5.17.0-bin.tar.gz
$ sha512sum ./apache-activemq-5.17.0-bin.tar.gz
d3252df7528b7000fceaf0a8b45c65216010467fea775bb3219ef04aaa659156f4c87982eb11a6982204d2737b9cc2b93efac88b651f1447270528bf62b1e238
$ sudo tar zxvf ./apache-activemq-5.17.0-bin.tar.gz
$ sudo mv ./apache-activemq-5.17.0 /opt/activemq
$ sudo /opt/activemq/bin/activemq start
INFO: Loading '/opt/activemq//bin/env'
INFO: Using java '/bin/java'
INFO: Starting - inspect logfiles specified in logging.properties and log4j.properties to get details
INFO: pidfile created : '/opt/activemq//data/activemq.pid' (pid '12715')
$
$ sudo /opt/activemq/bin/activemq status
INFO: Loading '/opt/activemq//bin/env'
INFO: Using java '/bin/java'
ActiveMQ is running (pid '12715')
```

#### OSX への ActiveMQ の導入

```
$ brew install apache-activemq
$ activemq start
$ activemq status
```

## MQTT/S での ActiveMQ の操作

- MQTT(Message Queueing Telemetry Transport) とは Publish/Subscribe 型のシンプルなプロトコル
- ネットワーク帯域やデバイスリソースの消費を抑えられるように設計されており、M2M, IoT などの分野における理想的なメッセージングプロトコルとなるよう設計されている
- **MQTT プロトコルにはキューという概念はない** ため、行える操作は **トピックへの Publish/Subscribe のみ** となる点に注意が必要

### CLI を用いた操作

- ActiveMQ ブローカーに対して MQTT プロトコルでトピックへ Pub/Sub するには `mosquitto` が便利
- 以下、Amazon MQ の ActiveMQ ブローカーに対して `mosquitto` コマンドを用いた操作を行う例を記載する

```
$ # mosquitto の導入
$ brew install mosquitto
...

$ # Amazon のルート証明書のダウンロード
$ wget https://www.amazontrust.com/repository/AmazonRootCA1.pem
$ CAFILE=[ルート証明書のパス]

$ # 準備
$ ACTIVE_MQ_HOST=
$ ACTIVE_MQ_PORT=8883
$ USER=[ユーザー名]
$ PASS=[パスワード]
$ TOPIC=[トピック名]

$ # トピックのサブスクライブ
$ mosquitto_sub --cafile $CAFILE \
    -u $USER -P $PASS \
    -h $ACTIVE_MQ_HOST -p $ACTIVE_MQ_PORT \
    -t $TOPIC
Hello, ActiveMQ!

$ # トピックへのパブリッシュ
$ mosquitto_pub --cafile $CAFILE \
    -u $USER -P $PASS \
    -h $ACTIVE_MQ_HOST -p $ACTIVE_MQ_PORT \
    -t $TOPIC -m "Hello, ActiveMQ!"
```

## OpenWire での ActiveMQ の操作

OpenWire は ActiveMQ を操作するためのバイナリプロトコル

### CLI を用いた操作

- ActiveMQ ブローカーに対して OpenWire プロトコルで ActiveMQ を操作するには `activemq` コマンドが便利
- 以下、Amazon MQ の ActiveMQ ブローカーに対して `activemq` コマンドを用いた操作を行う例を記載する

```
$ # activemq の導入
$ brew install activemq
...

$ # 準備
$ ACTIVE_MQ_URL=
$ USER=[ユーザー名]
$ PASS=[パスワード]

$ # トピックのサブスクライブ
$ activemq consumer --user $USER --password $PASS \
    --brokerUrl $ACTIVE_MQ_URL \
    --destination topic://Test
...
INFO | consumer-1 Received ID:...
INFO | BytesMessage as text string: Hello, ActiveMQ

$ # トピックのパブリッシュ
$ activemq producer --user $USER --password $PASS \
    --brokerUrl $ACTIVE_MQ_URL \
    --destination topic://Test \
    --message "Hello" --messageCount 1
...
INFO | producer-1 Produced: 1 messages
INFO | producer-1 Elapsed time in second : 0 s
INFO | producer-1 Elapsed time in milli second : 33 milli seconds

$ # キューイング
$ activemq producer --user $USER --password $PASS \
    --brokerUrl $ACTIVE_MQ_URL \
    --destination queue://Test \
    --message "Hello" --messageCount 1

$ # デーキューイング
$ activemq consumer --user $USER --password $PASS \
    --brokerUrl $ACTIVE_MQ_URL \
    --destination queue://Test
```

## STOMP での ActiveMQ の操作

- [STOMP(Simple Text Oriented Messaging Protocol)](https://stomp.github.io/) はテキスト指向の軽量メッセージングプロトコル
- [STOMP プロトコルによる操作方法についてのドキュメント](https://activemq.apache.org/stomp) も参照

### CLI を用いた操作

- ActiveMQ ブローカーに対して STOMP プロトコルで ActiveMQ を操作するには `stomp` コマンドが便利
- 以下、Amazon MQ の ActiveMQ ブローカーに対して `stomp` コマンドを用いた操作を行う例を記載する
  - see also: [Quick start — Stomp 7.0.0 documentation](https://jasonrbriggs.github.io/stomp.py/quickstart.html)
  - see also: [Using the Command-line client application — Stomp 7.0.0 documentation](https://jasonrbriggs.github.io/stomp.py/commandline.html)

```
$ # stomp の導入
$ pip install stomp.py
...
$ stomp --version
8.0.0

$ # 準備
$ ACTIVE_MQ_HOST=
$ ACTIVE_MQ_PORT=61614
$ USER=[ユーザー名]
$ PASS=[パスワード]

$ # ブローカーへの接続
$ stomp -U $USER -W $PASS \
    -H $ACTIVE_MQ_HOST -P $ACTIVE_MQ_PORT --ssl

>
> help

Documented commands (type help <topic>):
========================================
EOF    begin   help  rollback  sendfile   stats        ver
abort  commit  nack  run       sendrec    subscribe    version
ack    exit    quit  send      sendreply  unsubscribe

> subscribe /queue/Test
Subscribing to 'Test' with acknowledge set to 'auto', id set to '1'
>
> send Test Hello
>
message-id: ID:...
subscription: 1

Hello
```

## ActiveMQ と WSS

- WSS(WebSocket over SSL) 上で STOMP または MQTT で ActiveMQ の操作ができる
- わざわざ WebSocket を張って STOMP, MQTT でしゃべる必要性に関する議論は [Direct MQTT vs MQTT over WebSocket](https://stackoverflow.com/questions/30624897/direct-mqtt-vs-mqtt-over-websocket) を参照

## ActiveMQ と AMQP

- AMQP (Advanced Message Queuing Protocol) はメッセージキューを扱う際の代表的なプロトコルのひとつ
