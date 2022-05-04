---
title: RabbitMQ の基本的な操作
category: programming
date: 2022-05-01 20:24:00
tags: [RabbitMQ]
pinned: false
---

## RabbitMQ の基本的な構成要素

RabbitMQ においてメッセージは主に以下のような流れを経る

> ![](https://www.rabbitmq.com/img/tutorials/intro/hello-world-example-routing.png)

> AMQP 0-9-1 Model in Brief
> The AMQP 0-9-1 Model has the following view of the world: messages are published to exchanges, which are often compared to post offices or mailboxes. Exchanges then distribute message copies to queues using rules called bindings. Then the broker either deliver messages to consumers subscribed to queues, or consumers fetch/pull messages from queues on demand.
> When publishing a message, publishers may specify various message attributes (message meta-data). Some of this meta-data may be used by the broker, however, the rest of it is completely opaque to the broker and is only used by applications that receive the message. - [AMQP 0-9-1 Model Explained](https://www.rabbitmq.com/tutorials/amqp-concepts.html#amqp-model)

日本語で整理すると RabbitMQ を通したメッセージのやりとりには主に以下のような役者が登場することとなる

- **Publisher:** メッセージの送信者
  - Publisher は exchange, routingkey, メッセージ本文を指定して送信する
- **Exchange:** 受信したメッセージを `bindings` というルールに基づいて Queue にコピーする役割を持つ
  - queue との紐付け構造として fanout exchange, direct exchange, topic exchange, header exchange のいずれかを選択できる（詳細は [Exchanges and Exchange Types](https://www.rabbitmq.com/tutorials/amqp-concepts.html#exchanges) を参照）
- **Queue:** メッセージが Consumer によって処理されるまで格納する役割を持つ
- **Consumer:** メッセージの受信者

## RabbitMQ の導入

see also: [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)

### OSX への RabbitMQ の導入

単純に brew で導入可能: [The Homebrew RabbitMQ Formula](https://www.rabbitmq.com/install-homebrew.html)

```
brew install rabbitmq
```

### キューの作成

キューには以下のような設定がある

- Type
  - Classic
  - Quorum
  - Stream
- Durability
  - Durable
  - Transient
- Auto delete: すべての Consumer の接続が切断されたのちに自動的にキューを削除するオプション
- Arguments
  - MessageTTL
  - Auto expire
  - Overflow behaviour
  - Single active consumer
  - Dead letter exchange
  - Dead letter routing key
  - Max length
  - Max length bytes
  - Maximum priority
  - Lazy mode
  - Master locator

## RabbitMQ の操作

### rabbitmqadmin を利用した基本的な操作

- rabbitmqadmin コマンド経由で RabbitMQ HTTP API を叩いて各種操作が可能
- OSX には brew install rabbitmq で手軽に導入可能
- see also: [Management Command Line Tool](https://www.rabbitmq.com/management-cli.html)

環境変数の設定

```
$ HOST=
$ USERNAME=
$ PASSWORD=
```

Publish

```
$ rabbitmqadmin --host $HOST --port 443 --username=$USERNAME --password=$PASSWORD --ssl publish routing_key=Test payload="hello"
Message published
```

List Queues

```
 $ rabbitmqadmin --host $HOST --port 443 --username=$USERNAME --password=$PASSWORD --ssl list queues name messages
+------+----------+
| name | messages |
+------+----------+
| Test | 1        |
+------+----------+
```

Cousume

```
$ rabbitmqadmin --host $HOST --port 443 --username=$USERNAME --password=$PASSWORD --ssl get queue=Test ackmode=ack_requeue_false
+-------------+----------+---------------+---------+---------------+------------------+------------+-------------+
| routing_key | exchange | message_count | payload | payload_bytes | payload_encoding | properties | redelivered |
+-------------+----------+---------------+---------+---------------+------------------+------------+-------------+
| Test        |          | 0             | hello   | 5             | string           |            | False       |
+-------------+----------+---------------+---------+---------------+------------------+------------+-------------+

$ rabbitmqadmin --host $HOST --port 443 --username=$USERNAME --password=$PASSWORD --ssl list queues name messages
+------+----------+
| name | messages |
+------+----------+
| Test | 0        |
+------+----------+
```

## rabtap を利用した基本的な操作

- [rabtap](https://github.com/jandelgado/rabtap) は Golang で書かれている RabbitMQ ユーティリティコマンドラインツール

rabtap は以下のとおり [Docker イメージを用いて](https://github.com/jandelgado/rabtap#docker-image)して手軽に利用可能

```
$ docker run --rm -ti ghcr.io/jandelgado/rabtap:latest
```

環境変数の設定

```
USERNAME=
PASSWORD=
HOST=
PORT=
AMQP_URI=amqps://$USERNAME:$PASSWORD@$HOST:$PORT
```

Publish

```
$ echo test > ./message
$ docker run -v "$PWD":/usr/local/src --rm -ti ghcr.io/jandelgado/rabtap:latest pub --uri $AMQP_URI --routingkey=Test /usr/local/src/message
```

Subscribe

```
$ docker run -v "$PWD":/usr/local/src --rm -ti ghcr.io/jandelgado/rabtap:latest sub --uri $AMQP_URI Test
------ message received on 2022-05-01T14:46:41Z ------
exchange.......:
routingkey.....: Test
test
```
