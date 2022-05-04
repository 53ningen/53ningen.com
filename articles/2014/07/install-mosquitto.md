---
title: Mosquitto の導入
category: programming
date: 2014-07-09 14:11:18
tags: [Mosquitto, MQTT]
pinned: false
---

参考： http://tomowatanabe.hatenablog.com/entry/2014/04/21/095650

Mosquitto はデフォルトで 1883 ポートを使用するので，必要に応じてポートを開放する．

## on CentOS6

### Mosquitto のインストール

```
cd /etc/yum.repos.d/
sudo wget http://download.opensuse.org/repositories/home:/oojah:/mqtt/CentOS_CentOS-6/home:oojah:mqtt.repo
yum install mosquitto
```

### Mosquitto の起動

```
sudo /etc/rc.d/init.d/mosquitto start
```

### Paho クライアントの導入

```
# python, pipが入ってなければ入れる
sudo yum install python
wget https://raw.githubusercontent.com/pypa/pip/master/contrib/get-pip.py
python get-pip.py
pip install mosquitto

# Pahoクライアントを導入
sudo pip install paho-mqtt
```

### Pub/Sub

```
wget https://gist.githubusercontent.com/tomovwgti/11048251/raw/705036b16326871a58bf01a3fa9b765eea28ac44/pub.py
wget https://gist.githubusercontent.com/tomovwgti/11047563/raw/fd2dd031b7bb3533f1f4626967db9439b315ca2f/sub.py

vim pub.py
# ホスト名を書き換える

vim sub.py
# ホスト名を書き換える

python sub.py
python pub.py  #=> message 0 Hello MQTT!
```
