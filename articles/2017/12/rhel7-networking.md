---
slug: rhel7-networking
title: RHEL7 系のネットワーク設定
category: programming
date: 2017-12-28 03:31:30
tags: [RHEL7, CentOS7, network, NetworkManager]
pinned: true
---

<p>6 系と変わった点、変わってない点を整理するために調査した。主に参照した情報ソースは<a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/">「RHEL7ドキュメント」</a>と<a href="http://www.sbcr.jp/products/4797382686.html">「標準テキスト CentOS7」</a>の2つ。</p>

firewalld については別記事 [RHEL7 系の Firewall 設定](https://53ningen.com/rhel7-firewalld/) にまとめた。

[amazon template=wishlist&asin=4774184268]

<h2>NetworkManger とは</h2>

<h3>ドキュメント</h3>

<ul>
<li><a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-introduction_to_networkmanager">NETWORKMANAGER について</a></li>
<li><a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-NetworkManager_and_the_Network_Scripts">NETWORKMANAGER とネットワークスクリプト</a></li>
<li><a href="https://access.redhat.com/ja/node/1441163">RHEL 7 における Network Initscript と NetworkManager の違い</a></li>
</ul>

<h3>概要</h3>

<ul>
<li>RHEL6 ではネットワークスクリプト（<code>/etc/init.d/network</code>）によりネットワーク設定が行われていた

<ul>
<li>ここが <code>/etc/sysconfig/network-scripts</code> や <code>/etc/sysconfig/static-routes</code> などを読んでいた</li>
</ul></li>
<li>RHEL7 より <code>NetworkManager</code> を使ってネットワーク設定することが推奨されている</li>
<li>ただしそのままスクリプトを継続して使用することもできる</li>
<li>NetworkManager は現在、RHEL 7 でデフォルトで使用されている</li>
<li>NetworkManager を無効すると、ネットワークインターフェイス管理には代わりに initscripts が使用される</li>
<li>NetworkManager の使用が増えてきているため、今後のメジャーリリースで Network Initscript が廃止になる可能性がある</li>
<li>RHEL7 では NetworkManager が最初に起動し、/etc/init.d/network が NetworkManager をチェックして NetworkManager 接続の改ざんを防ぐ</li>
<li>NetworkManager は sysconfig 設定ファイルを使用するプライマリーアプリケーションとされており、/etc/init.d/network はフォールバックとなるセカンダリーとされている</li>
<li>RHEL7 でのネットワーク設定の方法には具体的には以下の4つの方法がある

<ul>
<li><code>nmcli</code></li>
<li><code>nmtui</code></li>
<li>GNOME コントロールセンター</li>
<li>ファイルを直接編集する</li>
</ul></li>
</ul>

<h2>NetworkManager の制御</h2>

<h3>ドキュメント</h3>

<ul>
<li><a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-installing_networkmanager#sec-Interacting_with_NetworkManager">NETWORKMANAGER のインストール</a></li>
</ul>

<h3>概要</h3>

<ul>
<li><code>NetworkManger</code> は <code>systemd</code> によって管理されていて、デフォルトでは起動時に立ち上がる</li>
<li>制御は <code>systemctl</code> コマンドを利用して以下のように行う</li>
</ul>

```
systemctl start NetworkManager
systemctl stop NetworkManager
systemctl restart NetworkManager
systemctl status NetworkManager
```

<ul>
<li>NetworkManager がデーモンで起動していることは次のように確認できる</li>
</ul>

```
# systemctl status NetworkManager
● NetworkManager.service - Network Manager
   Loaded: loaded (/usr/lib/systemd/system/NetworkManager.service; enabled; vendor preset: enabled)
   Active: active (running) since Tue 2017-12-26 05:04:04 JST; 1 day 22h ago
     Docs: man:NetworkManager(8)
 Main PID: 746 (NetworkManager)
   CGroup: /system.slice/NetworkManager.service
           └─746 /usr/sbin/NetworkManager --no-daemon
```

<h2>ネットワーク設定と設定ファイル</h2>

<p>ネットワーク設定ファイルの位置はかわらずだが、ファイルを直接編集せず nmcli, nmtui などを利用することが推奨されている。サーバー構築時に主に設定する内容と対応する設定ファイルは以下のとおり。</p>

<ul>
<li>ホスト名とIPアドレスの対応関係: <code>/etc/hosts</code></li>
<li>問い合わせ先DNSサーバ設定: <code>/etc/resolve.conf</code>

<ul>
<li>nmcli で DNS サーバーを指定すると自動的に更新される</li>
</ul></li>
<li>ネットワーク名とネットワークアドレスの対応関係: <code>/etc/networks</code></li>
<li>インターフェースの設定: <code>/etc/syscnofig/network-scripts/ifcfg-*</code>

<ul>
<li>NIC の命名が eth0, eth1 のような形ではなく、<code>udev</code> によりデバイスに応じて命名されている</li>
</ul></li>
<li>インターフェースごとのルーティング設定: <code>/etc/sysconfig/network-scripts/route-*</code>

<ul>
<li>ip コマンドを使って設定した静的ルートは、システムが終了したり再起動すると失われる</li>
</ul></li>
</ul>

<p>重要な設定を一部抜粋して確認する</p>

<h3>/etc/sysconfig/network-scripts/ifcfg-*</h3>

<h4>ドキュメント</h4>

<ul>
<li><a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-using_the_command_line_interface#sec-Configuring_a_Network_Interface_Using_ifcg_Files">ifcfg ファイルを使用したネットワークインターフェースの設定</a></li>
<li><a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-using_the_networkmanager_command_line_tool_nmcli#sec-Connecting_to_a_Network_Using_nmcli">nmcli を使用したネットワーク接続</a></li>
</ul>

<h4>概要</h4>

<ul>
<li>ip コマンドを使ったネットワークインターフェースの設定は、システムが終了したり再起動すると失われる</li>
<li>システム再起動後も維持されるようにネットワークインターフェースを設定するには、<code>/etc/sysconfig/network-scripts/</code> ディレクトリー内のインターフェースごとの設定ファイルに格納する必要がある</li>
<li>ファイル名は、ifcfg-<ifname></li>
<li>設定項目はざっくりと以下のような具合

<ul>
<li>TYPE(Ehternet, Wireless, Bridge): 種類</li>
<li>BOOTPROTO(none, bootp, dhcp): 起動方法</li>
<li>DEFROUTE(yes, no): デフォルトルートとして使用されるか</li>
<li>IPV4_FAILURE_FATAL(yes, no): IPV4 で初期化に失敗したときにインターフェースを起動失敗扱いにするか</li>
<li>NAME: インターフェースの名前</li>
<li>UUID: そのまま</li>
<li>DEVICE: 物理デバイス名</li>
<li>ONBOOT(yes, no): 起動時にインターフェースを起動するか</li>
<li>IPADDR: IPアドレス</li>
<li>PREFIX: ネットマスク</li>
</ul></li>
</ul>

```
# 動的ネットワーク設定の例
DEVICE=em1
BOOTPROTO=dhcp
ONBOOT=yes

# 静的ネットワーク設定の例
DEVICE=eth0
BOOTPROTO=none
ONBOOT=yes
PREFIX=24
IPADDR=10.0.1.27
```

<ul>
<li>ネットワークインターフェースの設定には以下の方法がある

<ul>
<li>nmcli コマンドを実行する</li>
<li>nmcli エディターを利用する</li>
<li>nmtui を利用する</li>
</ul></li>
</ul>

<p>コネクション名が扱いづらい形なので修正したほうが作業がしやすい</p>

```
$ nmcli connection show
NAME           UUID                 TYPE            DEVICE
System ens192  *******************  802-3-ethernet  ens192

$ nmcli connection modify "System ens192" connection.id eth0
NAME  UUID                 TYPE            DEVICE
eth0  *******************  802-3-ethernet  ens192
```

<p>設定はおおむね以下のような形</p>

```
$ nmcli connection modify \
  connection.autoconnect yes \
  ipv4.dns 8.8.8.8 \
  ipv4.method manual ipv4.addresses 10.*.*.*/24 \
  +ipv4.routes "192.168.0.0/16  10.*.*.254"
  ipv4.ignore-auto-routes no
  ipv4.ignore-auto-dns yes
```

<h3>/etc/sysconfig/network-scripts/route-*</h3>

<h4>ドキュメント</h4>

<ul>
<li><a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-using_the_command_line_interface#sec-Configuring_Static_Routes_in_ifcfg_files">ifcfg ファイルでの静的ルートの設定</a></li>
<li><a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-using_the_networkmanager_command_line_tool_nmcli#sec-Configuring_Static_Routes_Using_nmcli">nmcli を使った静的ルートの設定</a></li>
</ul>

<h4>概要</h4>

<ul>
<li>ip コマンドを使って設定した静的ルートは、システムが終了したり再起動すると失われる</li>
<li>システム再起動後も維持される静的ルートを設定するには、<code>/etc/sysconfig/network-scripts/</code> ディレクトリー内のインターフェースごとの設定ファイルに格納する必要がある</li>
<li>ファイル名は、route-<ifname></li>
<li>このファイルへの記述は次の2つの形式が利用できる

<ul>
<li>IP コマンド引数形式を使用した静的ルート</li>
<li>ネットワーク/ネットマスクディレクティブの形式</li>
</ul></li>
</ul>

```
# IPコマンド引数形式の例
default via 192.168.0.1 dev eth0
10.10.10.0/24 via 192.168.0.10 dev eth0
172.16.1.10/32 via 192.168.0.10 dev eth0

# ネットワークネットマスクディレクティブ形式の例
ADDRESS0=10.10.10.0
NETMASK0=255.255.255.0
GATEWAY0=192.168.0.10
ADDRESS1=172.16.1.10
NETMASK1=255.255.255.0
GATEWAY1=192.168.0.10
```

<ul>
<li>静的ルートを設定するには、以下の方法がある

<ul>
<li>nmcli コマンドを実行する</li>
<li>nmcli エディターを利用する</li>
</ul></li>
</ul>

```
# nmcli コマンドで静的ルート設定を追加
nmcli connection modify eth0 +ipv4.routes "192.168.122.0/24 10.10.10.1"

# nmcli エディタ
nmcli connection edit type ethernet con-name eth0
nmcli> set ipv4.routes 192.168.122.0/24 10.10.10.1
```

<h3>非推奨: <code>/etc/sysconfig/network</code></h3>

<p>個別のデバイス設定を用いることを推奨、グローバルのnetworkファイルは非推奨になった。</p>

<blockquote>
  <p>Red Hat Enterprise Linux ではグローバルの /etc/sysconfig/network ファイルの使用は非推奨となっており、ゲートウェイの指定はインターフェースごとの設定ファイルでのみ行なってください。
  https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-using_the_command_line_interface</p>
</blockquote>

<h2>nmcli コマンドについて</h2>

<p>公式ドキュメント: https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/7/html/networking_guide/sec-using_the_networkmanager_command_line_tool_nmcli</p>

<ul>
<li>nmcli は各種ネットワーク設定をコマンドラインから実行できるツール</li>
<li>各パラメータは全方一致で省略が可能</li>
</ul>

```
nmcli [OPTIONS...] {help | general | networking | radio | connection | device | agent | monitor} [COMMAND] [ARGUMENTS...]
```

<h3>networking</h3>

<p>ネットワークへの接続性を確認/制御できる</p>

<ul>
<li><code>on</code>, <code>off</code>, <code>connectivity</code> の三種類</li>
</ul>

```
$ nmcli network connectivity
full
```

<p>connectivityの状態は、none（切断）, portal（認証前）, limited（インターネットに出れない）, full（インターネットに出れる）, unknown（不明） の5種類</p>

<h3>general</h3>

<ul>
<li>NetworkManager の状態や権限などを表示できる</li>
<li>ホスト名, ログレベル, ドメインを取得できる</li>
</ul>

```
# Usage: nmcli general { COMMAND | help }
# COMMAND := { status | hostname | permissions | logging }

# hostname 表示/変更 => hostnamectl でも操作可能
$ nmcli general hostname
test01
$ nmcli general hostname prod01
$ nmcli general hostname
prod01
$ cat /etc/hostname
prod01

# status 表示
$ nmcli general status
STATE      CONNECTIVITY  WIFI-HW  WIFI     WWAN-HW  WWAN
connected  full          enabled  enabled  enabled  enabled
```

<h2>ip コマンドについて</h2>

<ul>
<li>RHEL7 系では route, ifconfig コマンド(net-tools)に代わり、ip コマンド(iproute2)の利用が推奨されている</li>
<li>ip コマンドはルーティング、デバイスなどを表示・設定できるコマンド</li>
</ul>

```
SYNOPSIS
       ip [ OPTIONS ] OBJECT { COMMAND | help }

       ip [ -force ] -batch filename

       OBJECT := { link | address | addrlabel | route | rule | neigh | ntable | tunnel | tuntap | maddress | mroute | mrule | monitor | xfrm | netns | l2tp | tcp_metrics | token }

       OPTIONS := { -V[ersion] | -h[uman-readable] | -s[tatistics] | -d[etails] | -r[esolve] | -iec | -f[amily] { inet | inet6 | ipx | dnet | link } | -4 | -6 | -I | -D | -B | -0 | -l[oops] { maxi‐
               mum-addr-flush-attempts } | -o[neline] | -rc[vbuf] [size] | -t[imestamp] | -ts[hort] | -n[etns] name | -a[ll] }
```

[amazon template=wishlist&asin=4774184268]
