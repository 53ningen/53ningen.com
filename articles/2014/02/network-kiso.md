---
title: ネットワークの基礎知識
category: programming
date: 2014-02-02 12:15:00
tags: []
pinned: false
---

## OSI 参照モデル

```
|       レイヤー       |                             役割                             | Packet Data Unit |
| :------------------: | :----------------------------------------------------------: | :--------------: |
|  アプリケーション層  |                やり取りするデータの形式を規定                |        -         |
| プレゼンテーション層 |         文字コードや圧縮形式など情報の表現形式を規定         |        -         |
|     セッション層     | データの送受信管理、コネクションの確立・タイミング管理を規定 |        -         |
|   トランスポート層   |                エラー訂正やデータの分割を規定                |    セグメント    |
|    ネットワーク層    |                隣接デバイスを超えた通信を規定                |     パケット     |
|    データリンク層    |                   隣接デバイス間の通信制御                   |     フレーム     |
|        物理層        |         電圧やコネクタ形状、電気信号などについて規定         |      ビット      |
```

## TCP/IP

```
|            レイヤー            |       代表的なプロトコル       |             OSI 参照モデルにおける位置             |
| :----------------------------: | :----------------------------: | :------------------------------------------------: |
|       アプリケーション層       | HTTP, FTP, SMTP, POP, DNS, ... | アプリケーション、プレゼンテーション、セッション層 |
|        トランスポート層        |         TCP, UDP, ...          |                  トランスポート層                  |
|        インターネット層        |       IP, ARP, ICMP, ...       |                   ネットワーク層                   |
| ネットワークインターフェース層 |       Ethernet, PPP, ...       |               データリンク、 物理層                |
```

TCP/IP のパケット交換方式でのデータのやりとりにおいては各レイヤーにヘッダが付加される

```
[MAC HEADER][IP HEADER][TCP HEADER][APPLICATION DATA]
|           |          |____________________________|
|           |                 TCP segment           |
|           |_______________________________________|
|                 IP packet                         |
|___________________________________________________|
        MAC frame
```

- TCP(Transmission Control Protocol)
- IP(Internet Protocol)
- MAC(Media Access Control)

## Data Link Layer

### Ethernet

#### Ethernet II フレーム

- プリアンブル: Ethernet フレーム同期用信号
  - Wireshark でキャプチャはできない
- 送信先 MAC アドレス: -
- 送信元 MAC アドレス: -
- タイプ: L3 のプロトコル
  - IPv4: 0x0800
  - ARP: 0x0806
  - IPv6: 0x86DD
- Ethernet ペイロード: 上位層のデータ
  - 46 byte〜1500 byte で最小値に満たないデータにはパディングと呼ばれるダミーデータを付与、最大値を超えるデータは分割して送信される
  - Ethernet フレームに入るデータの最大値を `MTU(Maximum Transmission Unit)` と呼ぶ
- FCS: Ethernet ペイロードのチェックサム計算に用いられる
  - NIC が FCS を取り外しているので、Wireshark では捉えられない

```
|0       |8       |16      |24      |32
| preamble                          |
|                                   |
| dest mac addr                     |
|                 | src mac addr    |
|                                   |
| type            |                 |
| ethernet payload (variable)       |
|                                   |
| ...                               |
|                                   |
| FCS(last 4 byte)                  |
```

```
// 例
Ethernet II, Src: Apple_4e:37:7f (88:e9:fe:4e:37:7f), Dst: Sumitomo_cb:8a:07 (00:0b:a2:cb:8a:07)
    Destination: Sumitomo_cb:8a:07 (00:0b:a2:cb:8a:07)
        Address: Sumitomo_cb:8a:07 (00:0b:a2:cb:8a:07)
        .... ..0. .... .... .... .... = LG bit: Globally unique address (factory default)
        .... ...0 .... .... .... .... = IG bit: Individual address (unicast)
    Source: Apple_4e:37:7f (88:e9:fe:4e:37:7f)
        Address: Apple_4e:37:7f (88:e9:fe:4e:37:7f)
        .... ..0. .... .... .... .... = LG bit: Globally unique address (factory default)
        .... ...0 .... .... .... .... = IG bit: Individual address (unicast)
    Type: IPv4 (0x0800)
```

- L2 スイッチ配下ホスト同士の通信において、MAC アドレステーブルから情報がひけないときにはフラッティングが行われる
  - 機材にもよるが数分程度通信がない場合、テーブルから情報が揮発する
- タグ VLAN は送信先 MAC アドレスとタイプの間に 32 ビットの情報を仕込んで実現されている(IEEE802.1q)
  - ポートに対して VLAN ID を振るのではなく、フレームに VLAN ID を仕込む
