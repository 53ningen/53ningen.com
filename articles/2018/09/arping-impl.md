---
slug: arping-impl
title: arping コマンドを実装する (1)
category: programming
date: 2018-09-16 15:45:59
tags: [iputils, C言語]
pinned: false
---

arping コマンドを実装した経験がなかったので、実装コードをカンニングしながらエッセンスを抽出して、動く簡易 arping コマンドを実装していきます。

## 参考にする arping の実装

手元環境の arp のパッケージを以下のようにして確認します。

```
$ rpm -qf /sbin/arping
iputils-20121221-7.13.amzn1.x86_64
```

というわけで、iputils の実装を参考にします。

```
$ git clone git@github.com:iputils/iputils.git
$ cd iputils
$ vi ./arping.c
```

## arp の様子をみる

ARP は IPv4 アドレスと MAC アドレスの対応を確認するためのプロトコルで、例えば 192.168.2.128 にリクエストを送ろうとしたとき、それに対応するイーサネットフレームの宛先 MAC アドレスが知りたくなります。

初めて送る相手の場合 IPv4 アドレスに対応する MAC アドレスは当然わからないので ARP Request をブロードキャストします。そして対応する機器は MAC アドレスを添えて ARP Reply を返すという仕組みです。

一度 ARP Reply が帰ってきたらある程度の期間はそれを記憶して使いまわします。 `arp -a` コマンドにより、自ホストが記憶している MAC アドレスと IPv4 アドレスの一覧である ARP テーブルを出力できますので、やってみます。

```
$ arp -a
wrc-1750gs (192.168.2.1) at bc:5c:4c:c5:7e:7f on en0 ifscope [ethernet]
```

現状 192.168.2.1 のマシンしか ARP テーブルに存在しません。ここで、まだ MAC アドレスを知らない 192.168.2.102 に ping を打ってみます。その裏で ARP のパケットをキャプチャしてみます。

```
$ ping 192.168.2.111
PING 192.168.2.111 (192.168.2.111): 56 data bytes
64 bytes from 192.168.2.111: icmp_seq=0 ttl=64 time=96.430 ms
64 bytes from 192.168.2.111: icmp_seq=1 ttl=64 time=15.179 ms
64 bytes from 192.168.2.111: icmp_seq=2 ttl=64 time=36.652 ms
64 bytes from 192.168.2.111: icmp_seq=3 ttl=64 time=59.144 ms
64 bytes from 192.168.2.111: icmp_seq=4 ttl=64 time=40.198 ms
^C
--- 192.168.2.111 ping statistics ---
5 packets transmitted, 5 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 15.179/49.521/96.430/27.295 ms
Workspace $ ping 192.168.2.111
PING 192.168.2.111 (192.168.2.111): 56 data bytes
64 bytes from 192.168.2.111: icmp_seq=0 ttl=64 time=70.699 ms
64 bytes from 192.168.2.111: icmp_seq=1 ttl=64 time=62.401 ms
^C
--- 192.168.2.111 ping statistics ---
2 packets transmitted, 2 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 62.401/66.550/70.699/4.149 ms


#=> すると arp のパケットをキャプチャできる
$ sudo tcpdump arp -x
tcpdump: data link type PKTAP
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on pktap, link-type PKTAP (Apple DLT_PKTAP), capture size 262144 bytes
02:06:43.408795 ARP, Request who-has mbp tell 88e9fe4e377f, length 28
 0x0000:  ffff ffff ffff 88e9 fe4e 377f 0806 0001
 0x0010:  0800 0604 0001 88e9 fe4e 377f c0a8 026b
 0x0020:  0000 0000 0000 c0a8 026f
02:06:43.503762 ARP, Reply mbp is-at 8c:85:90:b5:57:9a (oui Unknown), length 28
 0x0000:  88e9 fe4e 377f 8c85 90b5 579a 0806 0001
 0x0010:  0800 0604 0002 8c85 90b5 579a c0a8 026f
 0x0020:  88e9 fe4e 377f c0a8 026b


#=> ARP テーブルに情報がキャッシュされた
$ arp -a
wrc-1750gs (192.168.2.1) at bc:5c:4c:c5:7e:7f on en0 ifscope [ethernet]
mbp (192.168.2.111) at 8c:85:90:b5:57:9a on en0 ifscope [ethernet]


#=> もう一度 ping を打っても ARP テーブルに情報があるので ARP パケットは流れない
$ ping 192.168.2.111
PING 192.168.2.111 (192.168.2.111): 56 data bytes
64 bytes from 192.168.2.111: icmp_seq=0 ttl=64 time=70.699 ms
64 bytes from 192.168.2.111: icmp_seq=1 ttl=64 time=62.401 ms
^C
--- 192.168.2.111 ping statistics ---
2 packets transmitted, 2 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 62.401/66.550/70.699/4.149 ms
```

以上のように試してみると ARP の基本的なふるまいはわりと単純なものであることがわかります。

## ARP のメッセージフォーマット

[RFC 826 - An Ethernet Address Resolution Protocol: Or Converting Network Protocol Addresses to 48.bit Ethernet Address for Transmission on Ethernet Hardware](https://tools.ietf.org/html/rfc826) より ARP のフォーマットを確認します。

```
Definitions:
------------

Define the following for referring to the values put in the TYPE
field of the Ethernet packet header:
        ether_type$XEROX_PUP,
        ether_type$DOD_INTERNET,
        ether_type$CHAOS,
and a new one:
        ether_type$ADDRESS_RESOLUTION.
Also define the following values (to be discussed later):
        ares_op$REQUEST (= 1, high byte transmitted first) and
        ares_op$REPLY   (= 2),
and
        ares_hrd$Ethernet (= 1).

Packet format:
--------------

To communicate mappings from <protocol, address> pairs to 48.bit
Ethernet addresses, a packet format that embodies the Address
Resolution protocol is needed.  The format of the packet follows.

    Ethernet transmission layer (not necessarily accessible to
         the user):
        48.bit: Ethernet address of destination
        48.bit: Ethernet address of sender
        16.bit: Protocol type = ether_type$ADDRESS_RESOLUTION
    Ethernet packet data:
        16.bit: (ar$hrd) Hardware address space (e.g., Ethernet,
                         Packet Radio Net.)
        16.bit: (ar$pro) Protocol address space.  For Ethernet
                         hardware, this is from the set of type
                         fields ether_typ$<protocol>.
         8.bit: (ar$hln) byte length of each hardware address
         8.bit: (ar$pln) byte length of each protocol address
        16.bit: (ar$op)  opcode (ares_op$REQUEST | ares_op$REPLY)
        nbytes: (ar$sha) Hardware address of sender of this
                         packet, n from the ar$hln field.
        mbytes: (ar$spa) Protocol address of sender of this
                         packet, m from the ar$pln field.
        nbytes: (ar$tha) Hardware address of target of this
                         packet (if known).
        mbytes: (ar$tpa) Protocol address of target.
```

上記フォーマットと先ほどキャプチャした ARP Request/Reply を見比べてみましょう。Wireshark が食った結果が以下のようなものです。

![](https://static.53ningen.com/wp-content/uploads/2018/09/16040340/arpreq.png)

```
0000   ff ff ff ff ff ff 88 e9 fe 4e 37 7f 08 06 00 01  .........N7.....
0010   08 00 06 04 00 01 88 e9 fe 4e 37 7f c0 a8 02 6b  .........N7....k
0020   00 00 00 00 00 00 c0 a8 02 6f                    .........o
```

イーサネットヘッダが 14 オクテットあります。宛先 MAC アドレスが `ff:ff:ff:ff:ff:ff` となっておりブロードキャストさせていることがわかります。
`00 01` からが ARP Request メッセージです。それぞれ次のようになっています。

- Hardware type: 00 01 = Ethernet (1)
- Protocol type: 08 00 = IPv4 (0x0800)
- Hardware size: 06 = 6
- Protocol size: 04 = 4
- Opcode: request: 00 01 = (1)
- Sender MAC address: 88:e9:fe:4e:37:7f = Apple_4e:37:7f
- Sender IP address: c0 a8 02 6b = 192.168.2.107
- Target MAC address: 00:00:00:00:00:00
- Target IP address: c0 a8 02 6f = 192.168.2.111

ちなみに送信元 IPv4 アドレスは 192.168.2.107 = 0xC0A8026B、送信先 IPv4 アドレスは 192.168.2.111 = 0xC0A8026F です。

続いて Reply をみてみます。

![](https://static.53ningen.com/wp-content/uploads/2018/09/16040340/arpreq.png)

```
0000   88 e9 fe 4e 37 7f 8c 85 90 b5 57 9a 08 06 00 01  ...N7.....W.....
0010   08 00 06 04 00 02 8c 85 90 b5 57 9a c0 a8 02 6f  ..........W....o
0020   88 e9 fe 4e 37 7f c0 a8 02 6b                    ...N7....k
```

宛先 MAC アドレスは 88:e9:fe:4e:37:7f となっており、戻りのパケットはブロードキャストではないことがわかります。`00 01` から始まる ARP Reply メッセージの中身はそれぞれ以下のようになっています。

- Hardware type: 00 01 = Ethernet (1)
- Protocol type: 08 00 = IPv4 (0x0800)
- Hardware size: 06 = 6
- Protocol size: 04 = 4
- Opcode: reply: 00 02 = (2)
- Sender MAC address: 8c:85:90:b5:57:9a = Apple_b5:57:9a
- Sender IP address: c0 a8 02 6f = 192.168.2.111
- Target MAC address: 88:e9:fe:4e:37:7f = Apple_4e:37:7f
- Target IP address: c0 a8 02 6b = 192.168.2.107

## arping コマンドを実装する
