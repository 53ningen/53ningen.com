---
title: RHEL7系における時刻
category: programming
date: 2018-08-29 04:10:14
tags: [RHEL, RHEL7, Linux, timedatectl]
pinned: false
---

情報ソース: [Chapter 3. Configuring the Date and Time - Red Hat Customer Portal](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/system_administrators_guide/chap-configuring_the_date_and_time)

コンピュータはだいたい次の 2 つの時刻を持ちます:

- リアルタイムクロック（ハードウェアクロック/CMOS クロック）: OS から独立し、コンピュータの電源を落としても稼働するマザーボード上の回路に組み込まれているクロック
- システムクロック（ソフトウェアクロック）: カーネルによって管理されている、システムの起動時にリアルタイムクロックから初期化され、その後独立した時を刻むクロック

システムクロックは常に UTC でデータを保持し、アプリケーションにより必要に応じてローカルタイムに変換される。

システムクロックに保持されるデータは次の 2 つ:

- 1970/01/01 00:00:00 からの経過秒数
- 秒以下の経過時間

リアルタイムクロックは UTC としても良いしローカルタイムとしても良いが、UTC が推奨される。

RHEL7 では時刻の表示と設定に次の 3 つのコマンドが用意されている:

- `timedatectl`: `systemd` によって提供されているツール
- `date`: 従来のコマンド
- `hwclock`: リアルタイムクロックへアクセスするためのツール

## timedatectl コマンド

基本的な情報の表示は単純に `timedatectl` を叩けば良い:

```
$ timedatectl
      Local time: Tue 2018-08-28 18:22:12 UTC
  Universal time: Tue 2018-08-28 18:22:12 UTC
        RTC time: Tue 2018-08-28 18:22:11
       Time zone: UTC (UTC, +0000)
     NTP enabled: yes
NTP synchronized: yes
 RTC in local TZ: no
      DST active: n/a
```

`chronyd` や `ntpd` を使っておこなった変更は timedatectl に即時通知されるわけではなく、`systemd-timedated.service` の restart が必要となる天に注意。

### timedatectl コマンドによる時刻の設定

- `timedatectl set-time HH:MM:SS` コマンドによりシステムクロックとリアルタイムクロックを設定できます
  - これは `date --set` および `hwclock --systohc` を実行した場合と同様の挙動となる
- リアルタイムクロックをローカルタイムに設定する場合は `timedatectl set-local-rtc [boolean]` を叩く
- タイムゾーンの設定は `timedatectl set-timezone [time_zone]` を叩く
  - 特に JST の場合は、`[time_zone]=Asia/Tokyo` とする
  - タイムゾーンリストは `timedatectl list-timezone` でリストできる
- NTP サーバーとの同期設定は `timedatectl set-ntp [boolean]` を叩く

## date コマンド

- `date` とか `date -u` とか（雑）
- 時刻設定は `date --set [YYYY-MM-DD HH:MM:SS] --utc` とか叩けばいい

### （補足）RHEL6 におけるタイムゾーン

情報ソース: [22.5. UTC, Timezones, and DST - Red Hat Customer Portal](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/6/html/deployment_guide/s1-utc_timezones_and_dst)

`/etc/localtime` の情報をもとに地域標準時を表示に使える。

時差情報は /usr/share/zoneinfo 配下に格納されていて、一例として JST は以下のような内容となっている:

```
$ strings /usr/share/zoneinfo/Asia/Tokyo
TZif2
TZif2
JST-9
```

リアルタイムクロックのタイムゾーンは `/etc/adjtime` の 3 行目を見るとわかる:

```
$ cat /etc/adjtime
0.0 0 0.0
0
UTC
```

date コマンドを用いるとシステムクロックのもつデータをフォーマットして表示できる

```
$ sudo cp /etc/localtime /tmp/localtime
$ sudo ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime
$ date
Wed Aug 29 02:52:17 JST 2018
$ date -u
Tue Aug 28 17:52:26 UTC 2018
```

## hwclock コマンド

情報ソース: [2.3. hwclock コマンドの使用 - Red Hat Customer Portal](https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/system_administrators_guide/sect-configuring_the_date_and_time-hwclock)

- `hwclock` コマンドを用いるとリアルタイムクロックにアクセスできる
- 主にリアルタイムクロックの時刻表示とずれを補正する機能がある
- リアルタイムクロックにはローカルタイムや UTC などのロケールや夏時間を保存することはできない
- RHEL6 と RHEL7 で挙動が違うらしい
  - RHEL6: システムのシャットダウン、再起動時にコマンドが実行される
  - RHEL7: システムクロックが NTP または PTP で同期される場合、カーネルによって 11 分おきにリアルタイムクロックをシステムクロックに同期する

```
$ sudo hwclock
Tue 28 Aug 2018 07:00:23 PM UTC  -0.028421 seconds
```

- `hwclock` コマンドによる設定は `/etc/adjtime` に保存される
- `hwclock --set --date "yyyy/mm/dd HH:MM"` で設定可能
- `hwclock --systohc` でシステムクロックをリアルタイムクロックに同期できる
- `hwclock --hctosys` でリアルタイムクロックをシステムクロックに同期できる

```
$ cat /etc/adjtime
0.0 0 0.0
0
UTC
```
