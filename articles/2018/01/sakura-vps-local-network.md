---
slug: sakura-vps-local-network
title: さくらVPSのスイッチを利用してローカルネットワークを構成する
category: programming
date: 2018-01-03 21:31:49
tags: [network, NetworkManager, firewalld, さくらVPS]
pinned: false
---

さくら VPS のスイッチを用いて L2 接続をして、次のような構成を作る手順メモ。書いておいてアレですが、実際にやるときは[公式のドキュメント](https://help.sakura.ad.jp/hc/ja/articles/206229941--%E3%81%95%E3%81%8F%E3%82%89%E3%81%AEVPS-%E3%81%A7%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E6%8E%A5%E7%B6%9A%E3%81%AF%E3%81%A7%E3%81%8D%E3%81%BE%E3%81%99%E3%81%8B)を読んでください。

<img src="https://static.53ningen.com/wp-content/uploads/2018/01/21013455/sakura_vps_napt-e1537461295666.png" alt="" width="423" height="469" class="aligncenter size-full wp-image-1206" />

### 1. さくら VPS 管理画面上でスイッチを作成する

<img src="https://static.53ningen.com/wp-content/uploads/2018/01/21013424/sakura_switch_create-e1537461264644.png" alt="" width="100%" class="aligncenter size-full wp-image-1204" />

### 2. サーバーを停止する

作業対象サーバー内から shutdown コマンドでサーバーを停止する

### 3. 接続先スイッチ追加

接続先スイッチとして eth1 に先ほど作ったスイッチを指定する

<img src="https://static.53ningen.com/wp-content/uploads/2018/01/21013434/sakura_switch_select-e1537461274282.png" alt="" width="1354" height="430" class="aligncenter size-full wp-image-1205" />

### 4. サーバーを起動する

さくら VPS 管理画面からサーバーを起動する

### 5. IP アドレスの設定

次のように IP アドレスを割り当てた

- front01.eth1: 192.168.128.11/24
- back01.eth1: 192.168.128.111/24

### 6. front01 のネットワーク設定

back01 からインターネットに出るときは front01 を経由して外にでるために、front に NAPT 設定を入れる。
firewalld を使う場合以下のような形で設定する。

```
# firewall-cmd --get-active-zone
public
interfaces: eth0 eth1

# firewall-cmd --change-interface=eth0 --zone=external --permanent
success

# firewall-cmd --change-interface=eth1 --zone=internal --permanent
success

# firewall-cmd --get-active-zone
internal
  interfaces: eth1
external
  interfaces: eth0

# firewall-cmd --zone=external --add-masquerade --permanent
success
```

### 7. back01 のネットワーク設定

back01 はインターネットに晒したくないサーバーにあたるため、eth0 の自動起動をオフにしてインターフェースを落とす。今回は nmtui 経由でやった。また、このままだと back01 はインターネットに出られないため、gateway として front01 の back 側 IP を指定した。諸々設定後、以下で動作確認して無事 global 側の IP アドレスでインターネットに出られていれば、うまく設定できたということになる。

```
curl checkip.amazonaws.com
160.16.144.83 #=> front01 の グローバル側 IP
```
