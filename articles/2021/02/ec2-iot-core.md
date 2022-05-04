---
title: EC2 インスタンスと AWS IoT Core の連携
category: programming
date: 2021-02-21 14:45:57
tags: [IoT]
pinned: false
---

AWS CLI による AWS IoT Core トピックへのメッセージの Publish は以下のようなコマンドにて実行可能

```
aws iot-data publish --topic topic_1 --qos 1 --payload '{"message": "hello"}'
```

実際のデバイスでの利用感を掴んだり、デバッグ目的で EC2 からトピックへの操作ができると便利なので、EC2 インスタンスを AWS IoT のモノとして登録し、メッセージのやりとりをする方法をざっとみていく

AWS IoT を用いてデバイス上でメッセージの Publish/Subscribe をするまでのステップは大まかに以下のような流れ

1. モノとそれに対する証明書を作成する
2. ポリシーを作成する
3. 証明書にポリシーを割り当てる
4. AWS IoT へ Publish を行う

### 1. モノとそれに対する証明書を作成する

AWS CLI を利用するために `aws configure` コマンドで region の設定を行っておく

```
# Configure AWS CLI
aws configure  # region の設定をしておく
```

次に `aws iot create-thing` コマンドでモノの作成

```
aws iot create-thing --thing-name "EC2VirtualThing"
{
    "thingArn": "arn:aws:iot:ap-northeast-1:XXXXXXXXX:thing/EC2VirtualThing",
    "thingName": "EC2VirtualThing",
    "thingId": "XXXXXXXXXXXXXXXXXXX"
}
```

続いて証明書の作成とモノへの紐付け

```
# 証明書の作成と配置
mkdir ~/certs
curl -o ~/certs/Amazon-root-CA-1.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem

aws iot create-keys-and-certificate --set-as-active --certificate-pem-outfile "~/certs/device.pem.crt" --public-key-outfile "~/certs/public.pem.key" --private-key-outfile "~/certs/private.pem.key"
{
    "certificateArn": "XXXXXXXXXXXXX",
    "certificatePem": "-----BEGIN CERTIFICATE-----\nXXXXXX\n-----END CERTIFICATE-----\n",
    "keyPair": {
        "PublicKey": "-----BEGIN PUBLIC KEY-----\nXXXXXX\n-----END PUBLIC KEY-----\n",
        "PrivateKey": "-----BEGIN RSA PRIVATE KEY-----\nXXXXXX\n-----END RSA PRIVATE KEY-----\n"
    },
    "certificateId": "XXXXXXXXXXXX"
}

# 証明書をモノに紐づける
aws iot attach-thing-principal --thing-name "EC2VirtualThing" --principal [certificateArn]
```

### 2. ポリシーを作成する

```
echo '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["iot:Publish","iot:Subscribe","iot:Receive","iot:Connect"],"Resource":["*"]}]}' > ~/policy.json

aws iot create-policy \
    --policy-name "EC2VirtualThingPolicy" \
    --policy-document "file://~/policy.json"
```

### 3. 証明書にポリシーを割り当てる

```
aws iot attach-policy \
    --policy-name "EC2VirtualThingPolicy" \
    --target [certificateArn]
```

### 4. AWS IoT へ Publish を行う

様々なクライアントやプロトコルを用いて AWS IoT と連携が可能。

連携できるプロトコル、ポート、実行可能なオペレーション、利用する認証情報の組み合わせは [Device communication protocols](https://docs.aws.amazon.com/iot/latest/developerguide/protocols.html#protocol-selection) に記載がある。

#### Node.js で試す

AWS IoT Device SDK for JavaScript を導入する

```
sudo yum update -y
sudo yum install git -y

# install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node

cd ~
git clone https://github.com/aws/aws-iot-device-sdk-js-v2.git
cd aws-iot-device-sdk-js-v2
npm install

cd ~/aws-iot-device-sdk-js-v2/samples/node/pub_sub
npm install
aws iot describe-endpoint --endpoint-type iot:Data-ATS
node dist/index.js --topic topic_1 --root-ca ~/certs/Amazon-root-CA-1.pem --cert ~/certs/device.pem.crt --key ~/certs/private.pem.key --endpoint your-iot-endpoint
```

AWS IoT マネジメントコンソールで topic_1 をサブスクライブした状態で以下を実行すると EC2 インスタンスから Publish したメッセージが出力される

```
node dist/index.js --topic topic_1 --root-ca ~/certs/Amazon-root-CA-1.pem --cert ~/certs/device.pem.crt --key ~/certs/private.pem.key --endpoint a112s9hz1ubgqs-ats.iot.ap-northeast-1.amazonaws.com
```

### Mosquito で試す

Mosquitto のインストール

```
sudo amazon-linux-extras install epel -y
sudo yum install mosquitto -y
```

`mosquitto_pub` コマンドで Publish

```
$ mosquitto_pub --cafile ~/certs/Amazon-root-CA-1.pem --cert ~/certs/device.pem.crt --key ~/certs/private.pem.key -h "XXXXXX-ats.iot.ap-northeast-1.amazonaws.com" -p 8883 -q 1 -t topic_1 -m '{}' -d
Client mosq-XXXX sending CONNECT
Client mosq-XXXX received CONNACK (0)
Client mosq-XXXX sending PUBLISH (d0, q1, r0, m1, 'topic_1', ... (2 bytes))
Client mosq-XXXX received PUBACK (Mid: 1, RC:0)
Client mosq-XXXX sending DISCONNECT
```

`mosquitto_sub` コマンドで Subscribe

```
$ mosquitto_sub --cafile ~/certs/Amazon-root-CA-1.pem --cert ~/certs/device.pem.crt --key ~/certs/private.pem.key -h "XXXXXX-ats.iot.ap-northeast-1.amazonaws.com" -p 8883 -t topic_1 -d
Client mosq-XXXX sending CONNECT
Client mosq-XXXX received CONNACK (0)
Client mosq-XXXX sending SUBSCRIBE (Mid: 1, Topic: topic_1, QoS: 0, Options: 0x00)
Client mosq-XXXX received SUBACK
Subscribed (mid: 1): 0
{
  "message": "Hello from AWS IoT console"
}
```

#### HTTPS で試す

クライアント証明書を用いた Publish は以下のとおりに実行できる

```
$ curl \
     --cacert ~/certs/Amazon-root-CA-1.pem \
     --cert ~/certs/device.pem.crt \
     --key ~/certs/private.pem.key \
     -X POST https://XXXXXX-ats.iot.ap-northeast-1.amazonaws.com:8443/topics/topic_1?qos=1 \
     -d '{"test":true}'
{"message":"OK","traceId":"XXXXX-cd77-158d-f9fe-fbc78db0f96d"}
```
