---
slug: ping-impl1
title: ping コマンドを実装する (1)
category: programming
date: 2018-09-14 00:36:52
tags: [iputils, ICMP, C言語]
pinned: false
---

ping コマンドを実装したことがなかったのでやっただけの記録です。

実際には[「ソースコードで体感するネットワークの仕組み」](https://amzn.to/2xb5GOl)という本のファーストステップとして仮想 IP ホストの実装があるのですが、その前に ping クライアントを実装しておくとスラスラすすみそうだなと思ったので、やってみました。

わたしは邪悪な人間なのでまず最初にカンニングします。ping のソースコードを次のような手順で手に入れました。

```
$ rpm -qf /bin/ping
iputils-20121221-7.13.amzn1.x86_64

$ yumdownloader --source iputils
Loaded plugins: priorities, update-motd, upgrade-helper
Enabling amzn-updates-source repository
Enabling amzn-main-source repository
Enabling epel-source repository
amzn-main-source                                                                                                                     | 1.4 kB  00:00:00
amzn-updates-source                                                                                                                  | 1.4 kB  00:00:00
epel-source/x86_64/metalink                                                                                                          | 8.7 kB  00:00:00
epel-source                                                                                                                          | 2.0 kB  00:00:00
(1/4): epel-source/x86_64/updateinfo                                                                                                 | 786 kB  00:00:00
(2/4): amzn-updates-source/latest/primary_db                                                                                         |  68 kB  00:00:00
(3/4): epel-source/x86_64/primary                                                                                                    | 1.6 MB  00:00:00
(4/4): amzn-main-source/latest/primary_db                                                                                            | 787 kB  00:00:01
epel                                                                                                                                            12521/12521
epel-source                                                                                                                                       5925/5925
1692 packages excluded due to repository priority protections
iputils-20121221-7.13.amzn1.src.rpm                                                                                                  | 226 kB  00:00:04

$ sudo yum install -y rpmdevtools
...

$ rpmdev-extract iputils-20121221-7.13.amzn1.src.rpm
iputils-20121221-7.13.amzn1.src/ifenslave.tar.gz
iputils-20121221-7.13.amzn1.src/iputils-20020927-rh.patch
iputils-20121221-7.13.amzn1.src/iputils-20121221-caps.patch
iputils-20121221-7.13.amzn1.src/iputils-20121221-floodlocale.patch
iputils-20121221-7.13.amzn1.src/iputils-20121221-ping-wrong-inet6-host.patch
iputils-20121221-7.13.amzn1.src/iputils-20121221-tracepath-back-count.patch
iputils-20121221-7.13.amzn1.src/iputils-ifenslave.patch
iputils-20121221-7.13.amzn1.src/iputils-s20121221.tar.bz2
iputils-20121221-7.13.amzn1.src/iputils.spec
iputils-20121221-7.13.amzn1.src/ninfod.service
iputils-20121221-7.13.amzn1.src/rdisc.initd
iputils-20121221-7.13.amzn1.src/rdisc.service
iputils-20121221-7.13.amzn1.src/rdisc.sysconfig

$ cd iputils-20121221-7.13.amzn1.src
$ tar -jxf iputils-s20121221.tar.bz2
...

$ vi iputils-s20121221/ping.c
```

ふむふむ...（知ったかぶり）
ざっくりとした流れは掴んだとして、実際にパケットがどうやりとりされているかみたほうがいいので、tcpdump で川の様子をみます。

## ping の様子をみる

### ICMP のメッセージフォーマットを確認する

[RFC 792 - Internet Control Message Protocol](https://tools.ietf.org/html/rfc792#page-2) より ICMP のメッセージフォーマットを確認しましょう。フォーマットについて言及されている箇所を引用します。

```
Message Formats
ICMP messages are sent using the basic IP header. ... Unless otherwise noted under the individual format descriptions, the values of the internet header fields are as follows:

(Version〜Destination IP Address までのフィールド)
```

つまりヘッダーとして合計 20 byte の下記のようなデータを持っています。

```
0                   1                   2                   3
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|Version|  IHL  |Type of Service|          Total Length         | 4 bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|         Identification        |Flags|      Fragment Offset    | 8 bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Time to Live |    Protocol   |         Header Checksum       | 12 bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Source Address                          | 16 bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Destination Address                        | 20 bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

続いて ICMP メッセージをみてみます。こちらは ICMP のメッセージタイプによりフォーマットが大きく異なるため、Echo と Echo Reply メッセージのフォーマットだけみてみます。

```
Echo Request or Echo Reply Message

0                   1                   2                   3
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Type      |     Code      |          Checksum             | 24 bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Identifier          |        Sequence Number        | 28 bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Data ...
+-+-+-+-+-
```

Type と Code は Echo Request の場合 `0x0000`, Echo Reply の場合 `0x0800` をとります。
Data は ICMP Payload ともよばれ、OS ごとに異なる適当なデータがセットされます。

### Echo Request, Response の実際のパケットをみる

example.com に ping したときの tcpdump をみてみます。ICMP echo と ICMP reply のセットをみてみます。

```
$ sudo tcpdump -i eth0 icmp -x
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 65535 bytes
17:18:19.838621 IP ip-172-31-11-15.ap-southeast-1.compute.internal > 93.184.216.34: ICMP echo request, id 10942, seq 1, length 64
        0x0000:  4500 0054 7e34 4000 ff01 106b ac1f 0b0f
        0x0010:  5db8 d822 0800 4042 2abe 0001 5b04 945b
        0x0020:  0000 0000 d2cb 0c00 0000 0000 1011 1213
        0x0030:  1415 1617 1819 1a1b 1c1d 1e1f 2021 2223
        0x0040:  2425 2627 2829 2a2b 2c2d 2e2f 3031 3233
        0x0050:  3435 3637
17:18:20.013732 IP 93.184.216.34 > ip-172-31-11-15.ap-southeast-1.compute.internal: ICMP echo reply, id 10942, seq 1, length 64
        0x0000:  4500 0054 bc1b 0000 2901 e884 5db8 d822
        0x0010:  ac1f 0b0f 0000 4842 2abe 0001 5b04 945b
        0x0020:  0000 0000 d2cb 0c00 0000 0000 1011 1213
        0x0030:  1415 1617 1819 1a1b 1c1d 1e1f 2021 2223
        0x0040:  2425 2627 2829 2a2b 2c2d 2e2f 3031 3233
        0x0050:  3435 3637
```

先頭の 20 bytes は IP Header ですので、ICMP Message のみをとりだしてみます。
ICMP echo request から。

```
17:18:19.838621 IP ip-172-31-11-15.ap-southeast-1.compute.internal > 93.184.216.34: ICMP echo request, id 10942, seq 1, length 64
        0x0000:
        0x0010:            0800 4042 2abe 0001 5b04 945b
        0x0020:  0000 0000 d2cb 0c00 0000 0000 1011 1213
        0x0030:  1415 1617 1819 1a1b 1c1d 1e1f 2021 2223
        0x0040:  2425 2627 2829 2a2b 2c2d 2e2f 3031 3233
        0x0050:  3435 3637
```

フォーマットと照らし合わせると各フィールドは次のように読める

- Type: 0x08
- Code: 0x00
- Checksum: 0x4042
- Identifier: 0x2abe (10942)
- Sequence Number: 0x0001 (1)
- ICMP Paypload: 後続の値

```
17:18:20.013732 IP 93.184.216.34 > ip-172-31-11-15.ap-southeast-1.compute.internal: ICMP echo reply, id 10942, seq 1, length 64
        0x0000:
        0x0010:            0000 4842 2abe 0001 5b04 945b
        0x0020:  0000 0000 d2cb 0c00 0000 0000 1011 1213
        0x0030:  1415 1617 1819 1a1b 1c1d 1e1f 2021 2223
        0x0040:  2425 2627 2829 2a2b 2c2d 2e2f 3031 3233
        0x0050:  3435 3637
```

フォーマットと照らし合わせると各フィールドは次のように読める

- Type: 0x00
- Code: 0x00
- Checksum: 0x4842
- Identifier: 0x2abe (10942)
- Sequence Number: 0x0001 (1)
- ICMP Paypload: 後続の値

### そのほかのメッセージ

宛先のネットワークに到達できないとき Code: 3, Type: 0 の以下のメッセージを返します

```
Destination Unreachable Message

0                   1                   2                   3
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Type      |     Code      |          Checksum             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                             unused                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|      Internet Header + 64 bits of Original Data Datagram      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

ほかにも色々あるけど詳細は [RFC 792 - Internet Control Message Protocol](https://tools.ietf.org/html/rfc792) 参照

## ping コマンドの動作を確認する

メッセージフォーマットは確認できたけど、まだ ping の出力形式を確認していないので、一応チェックしておく

```
$ ping example.com
PING example.com (93.184.216.34) 56(84) bytes of data.
64 bytes from 93.184.216.34: icmp_seq=1 ttl=41 time=175 ms
64 bytes from 93.184.216.34: icmp_seq=2 ttl=41 time=175 ms
64 bytes from 93.184.216.34: icmp_seq=2 ttl=41 time=175 ms
^C
--- example.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2002ms
rtt min/avg/max/mdev = 175.145/175.211/175.253/0.047 ms
$ ping 93.184.216.34
PING 93.184.216.34 (93.184.216.34) 56(84) bytes of data.
64 bytes from 93.184.216.34: icmp_seq=1 ttl=41 time=175 ms
64 bytes from 93.184.216.34: icmp_seq=2 ttl=41 time=175 ms
^C
--- 93.184.216.34 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 175.120/175.181/175.243/0.423 ms
```

出力情報が意外に複雑だった。

- host 名の場合は名前解決して `PING ホスト名 (宛先IP) 56(84) bytes of data.` と出力
- 1 往復ごとに `64 bytes from 宛先IP: icmp_seq=シーケンス番号 ttl=TTL time=RTT` を出力
- SIGINT シグナルにより ICMP メッセージのやりとりを終了し、統計値を出力

地味に面倒くさい。やっていく。

## ICMP Echo Request パケットを送信する

ping コマンドをガッツリ作りこむのではなく、まずは ICMP Echo Request、つまり ping をうつ部分だけ実装してみます。ただしく ping を打てたか確認する方法は簡単で、ping が ICMP を許可するホストに到達すれば、勝手に ICMP Echo Reply つまり pong を返してくるので、`tcpdump` コマンドでそれを確認してやれば OK です。

プログラムが pong を受信して RTT を計算して、みたいなものはひとまずあとまわしにします。さっそく実装してみましょう。

### ICMP Echo Header 構造体を作成する

ICMP Echo Request & Reply ともに前述のとおり共通したヘッダーを持ちます。再掲します。

```
Echo Request or Echo Reply Message

0                   1                   2                   3
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Type      |     Code      |          Checksum             | 24 bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Identifier          |        Sequence Number        | 28 bytes
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Data ...
+-+-+-+-+-
```

これを構造体に落とし込むと以下のようにできます。

```c
#include <sys/types.h>

struct icmpechoheader
{
    u_int8_t type;
    u_int8_t code;
    u_int16_t checksum;
    u_int16_t id;
    u_int16_t sequence;
};
```

### チェックサムを計算する

RFC792 に立ち返り定義を確認します

> Checksum
> The checksum is the 16-bit ones's complement of the one's complement sum of the ICMP message starting with the ICMP Type. For computing the checksum , the checksum field should be zero. If the total length is odd, the received data is padded with one octet of zeros for computing the checksum. This checksum may be replaced in the future.

要旨としては、ICMP のチェックサムは Type から Data の末尾までの 16 ビット単位の 1 の補数の合計に対して、さらに 16 ビットの 1 の補数をとったものであるといった内容です。ただし、チェックサムフィールドは 0、データ長が奇数だった場合は末尾を 0 であるとみなし計算します。

ここで 1 の補数と 2 の補数について記憶を掘り起こすと、それぞれ次のようなものであることをかすかに思い出せます。

- 1 の補数: ~n(2)
- 2 の補数: ~n(2) + 1(2)

実際の `ping` では [`u_short in_cksum(const u_short *addr, register int len, u_short csum)`](https://github.com/iputils/iputils/blob/master/ping.c#L1187-L1217) にて実装されているものです。コードは以下のようになります。

```c
u_int16_t checksum(u_int16_t *buf, int size)
{
    u_int32_t sum = 0;

 /*
  *  Our algorithm is simple, using a 32 bit accumulator (sum),
  *  we add sequential 16 bit words to it, and at the end, fold
  *  back all the carry bits from the top 16 bits into the lower
  *  16 bits.
  */
    while (size > 1) {
        sum += *buf++;
        size -= 2;
    }

    /* mop up an odd byte, if necessary */
    if (size == 1) {
        sum += *(unsigned char *)buf;
    }

 sum = (sum >> 16) + (sum & 0xffff); /* add hi 16 to low 16 */
 sum += (sum >> 16);         /* add carry */
    return ~sum;
}
```

### ICMP パケットを送信する

実際に ICMP パケットを送信する部分を実装します。といっても ICMP パケットを用意して RAW SOCKET を開いて sendto 関数で送るだけ。

`ping.c` では [`int ping4_send_probe(socket_st *sock, void *packet, unsigned packet_size)`](https://github.com/iputils/iputils/blob/master/ping.c#L969-L1017) にて実装されています。

関数のコメントに記載されているように ID フィールドは同一ホスト上で複数の ping プロセスが動いていても重ならないようにプロセス ID が使われています。シーケンスナンバーは単に値をインクリメントしていくだけの仕組み。また、データの最初の 8 バイトは UNIX の timeval の情報をつっこみ後ほど RTT の計算に使います。

> pinger --
> Compose and transmit an ICMP ECHO REQUEST packet. The IP packet will be added on by the kernel. The ID field is our UNIX process ID, and the sequence number is an ascending integer. The first 8 bytes of the data portion are used to hold a UNIX "timeval" struct in VAX byte-order, to compute the round-trip time.

しかし色々やっていると結構大変なのでまずは ICMP パケットを組み立てて投げつけるところだけを雑に実装してみます。もし ICMP Echo Reuqest が正常に送れているのなら ICMP Echo Response が帰ってくるはずです。今回はこれを tcpdump コマンドで観測するところ目標に実装してみます。

ざっくりと以下のような形で ping を送信できるようになります。

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/ip.h>
#include <arpa/inet.h>

int main(int argc, char *argv[])
{
 // 宛先の IP アドレスを引数で受け取る
    if (argc != 2) {
        perror("usage: ping DESTINATION");
        exit(1);
    }

    // char[] で受け取った IP アドレスを sockaddr_in 構造体に突っ込む
    struct sockaddr_in dest;
    dest.sin_family = AF_INET;
    dest.sin_addr.s_addr = inet_addr(argv[1]);
    if (dest.sin_addr.s_addr == INADDR_NONE) {
        perror("error: inet_addr");
        exit(1);
    }

    // ICMP Echo Request メッセージの data 部を準備
    // ICMP ヘッダと data 部の先頭に突っ込む timeval の
    // 8 + 16 = 24 bytes 分のオフセットの位置に固定データ(abcd)を流し込む
    char str[] = "abcd";
    char data[28];
    memcpy(&data[24], str, strlen(str));
    int cc = sizeof(data);

    // ICMP Echo Reuqest のヘッダーを構成
    struct icmpechoheader *icp = (struct icmpechoheader *) data;
    icp->type = 0x08;
    icp->code = 0x00;
    icp->checksum = 0x0000;
    icp->id = getpid();
    icp->sequence = 0x0001;

    // data の最初は timeval で埋める
    struct timeval tmp_tv;
 gettimeofday(&tmp_tv, NULL);
 memcpy(icp+1, &tmp_tv, sizeof(struct timeval));

    // 送信するパケットが固まったのでチェックサム計算
    icp->checksum = checksum((unsigned short *) icp, cc);

    // ソケットを開き、作成したパケットを送信
    int sock = socket(AF_INET, SOCK_RAW, IPPROTO_ICMP);
    if (sock < 0) {
        perror("error: sock");
        exit(1);
    }
    int ret = sendto(sock, icp, cc, 0, (struct sockaddr*) &dest, sizeof(dest));

    if (ret < 1) {
        perror("error: sendto");
        exit(1);
    }

    printf("%s %s\n", "ping:", argv[1]);
    exit(0);
}
```

動作確認をしてみます。

以下のように `tcpdump icmp -x` コマンドを待ち受けつつ、別ターミナルより ping を送ります。なお、名前解決は実装してないので `$(dig +short example.com)` であらかじめ名前解決をして IPv4 アドレスを ping コマンドに送ります。

すると、ICMP Echo Request に対して、ICMP Echo Reply が返ってきていることがわかります。パケットの中身をみてみると Type: 0x00, Code: 0x00 となっていることがわかります。その他の ICMP のデータは Echo Reuqest と同様となっています。

```
environment $ sudo tcpdump icmp -x
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 65535 bytes


# 別のコンソールから ping を送ってみます
ping $ sudo ./bin/icmpechoreq $(dig +short example.com)
ping: 93.184.216.34

# tcpdump で待ち受けている標準出力に以下のような表示がでれば OK
17:01:22.812320 IP ip-172-31-11-15.ap-southeast-1.compute.internal > 93.184.216.34: ICMP echo request, id 64302, seq 256, length 28
        0x0000:  4500 0030 b806 4000 ff01 d6bc ac1f 0b0f
        0x0010:  5db8 d822 0800 a4b1 fb2e 0100 e297 9a5b
        0x0020:  0000 0000 0965 0c00 0000 0000 6162 6364
17:01:22.981910 IP 93.184.216.34 > ip-172-31-11-15.ap-southeast-1.compute.internal: ICMP echo reply, id 64302, seq 256, length 28
        0x0000:  4500 0030 0282 0000 2701 a442 5db8 d822
        0x0010:  ac1f 0b0f 0000 acb1 fb2e 0100 e297 9a5b
        0x0020:  0000 0000 0965 0c00 0000 0000 6162 6364

```

このようにして、まず ping を放つ部分までの実装の概要をざっくりと掴めました。次回の記事では、pong を受け取り、RTT を計算する部分を実装してみます。
