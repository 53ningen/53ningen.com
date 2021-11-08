---
slug: docker-handson-1
title: Docker でドカーンとやるハンズオン 入門編
category: programming
date: 2018-09-08 19:17:24
tags: [Docker]
pinned: false
---

- Docker でドカーンってやる入門ハンズオン資料
  - docker, docker-compose のキホンがわかるように書いた

## Docker とは

- 仮想化ソフトウェアを使わずリソースを隔離し、仮想 OS を稼働させる、コンテナ型の仮想化技術
- オーバーヘッドが少なく、高速でマシンリソースも少量で済む
- 対して Virtual Box はハードウェアをソフトウェアでエミュレーションしているホスト OS 型の仮想化技術
  - Host OS の上に仮想化ソフトウェア/ゲスト OS という階層構造になるためオーバーヘッドが大きい

### MacOS 上での Docker

- Docker for Mac は Hypervisor.framework を利用してコンテナがなるべく直接ハードウェアを制御できるようにしているため、オーバーヘッドが抑えられている
  - [Hypervisor | Apple Developer Documentation](https://developer.apple.com/documentation/hypervisor)

導入は以下のとおり

```
$ brew cask install docker docker-machine docker-compose
$ docker --version
Docker version 18.06.1-ce, build e68fc7a
$ docker-machine --version
docker-machine version 0.15.0, build b48dc28d
$ docker-compose --version
docker-compose version 1.22.0, build f46880f
```

## Hello, World! in Docker

node.js の簡単な HTTP サーバーをコンテナ上で稼働させてみる。まずはサーバーを書く。

```
$ mkdir hello
$ vi main.js

var http = require('http');

var PORT = 8080;

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello Docker\n');
    console.log('receive request');
}).listen(PORT, null, function () {

});

console.log('start server');
```

つづいて `Dockerfile` を書く

```
$ docker search node
NAME                                   DESCRIPTION                                     STARS               OFFICIAL            AUTOMATED
node                                   Node.js is a JavaScript-based platform for s…   6127                [OK]
mhart/alpine-node                      Minimal Node.js built on Alpine Linux           379
mongo-express                          Web-based MongoDB admin interface, written w…   290                 [OK]
nodered/node-red-docker                Node-RED Docker images.                         188                                     [OK]
...

$ docker search

$ vi Dockerfile

FROM node:8.11.4-alpine

ENV NODE_ENV=development

RUN mkdir /hello
COPY main.js /hello/main.js

CMD ["node", "/hello/main.js"]
```

docker イメージをビルドして走らせてみる

- docker image build [-t repository:tag] [path]
- docker container run [-d] [-p from:to] repository:tag
  - `-d`: デーモンとして起動
  - `-p`: ポートフォワーディング

```
$ docker image build -t example/hello:latest .
Sending build context to Docker daemon  4.096kB
Step 1/5 : FROM node:8.9.4-alpine
 ---> 406f227b21f5
...

 $ docker image ls
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
example/hello       latest              471884b23453        3 minutes ago       68.1MB
...

$ docker container run -d -p 9000:8080 example/hello:latest
f1e953420d3ad21190be0a96541642f9b2f66821eea5bf528d83bb32c4a75950

$ curl localhost:9000
Hello Docker

$ docker container logs f1e953420d3ad21
start server
receive request

$ docker container stop $(docker container ls --filter "ancestor=example/hello" -q)
f1e953420d3a
```

## Docker の基本操作

`docker image push` で DockerHub へ push する

```
$ docker login -u 53ningen
Password:
WARNING! Your password will be stored unencrypted in /home/ec2-user/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credentials-store

Login Succeeded

$ docker image tag example/hello:latest 53ningen/hello:latest
$ docker image push 53ningen/hello:latest
The push refers to repository [docker.io/53ningen/hello]
3f78e27e9a3f: Pushed
969ad174f7b7: Pushed
f846841ed47f: Mounted from library/node
0198944a9875: Mounted from library/node
9dfa40a0da3b: Mounted from library/node
latest: digest: sha256:73db09a176faacde5a8a34d33011bfed94640ab9e4083240cc5fc4950e4225ca size: 1365
```

`docker container rm` でいらなくなったコンテナは破棄しておく、`docker container prune` で一括削除可能

```
 $ docker container ls -a
CONTAINER ID        IMAGE                   COMMAND                 CREATED             STATUS                       PORTS               NAMES
27f5644f3a06        53ningen/hello:latest   "node /hello/main.js"   2 minutes ago       Exited (137) 4 seconds ago                       stupefied_bartik
$ docker container rm 27f5644f3a06
27f5644f3a06

$ docker container prune
WARNING! This will remove all stopped containers.
Are you sure you want to continue? [y/N] y
Deleted Containers:
9fdae0051e3c8d3be347afc49b7377d1af3d244910ba7528b5eef570b146885d

Total reclaimed space: 570B
```

`dcoker exec` でコンテナ内でコマンド実行可能、`-i` オプションでインタラクティブモード

```
 $ docker container ls
CONTAINER ID        IMAGE                   COMMAND                 CREATED             STATUS              PORTS                    NAMES
9fdae0051e3c        53ningen/hello:latest   "node /hello/main.js"   44 minutes ago      Up 44 minutes       0.0.0.0:9000->8080/tcp   dazzling_mirzakhani
$ docker exec 9fdae0051e3c pwd
/
$ docker exec -i 9fdae0051e3c sh
pwd
/
```

`docker container copy` でファイルをコピー可能

```
$ docker container cp ./main.js 9fdae0051e3c:/hello/main2.js
$ docker exec 9fdae0051e3c ls /hello/
main.js
main2.js
```

## docker-composer を利用する

### docker-compose の導入

MacOS なら docker for mac いれた時点ですでに入ってる。Linux 環境では次のような感じ。

```
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
$ docker-compose --version
docker-compose version 1.22.0, build f46880fe
```

### docker-compose を使う

カンタン

```
vi docker-compose.yml

version: "3"
services:
  echo:
    build: .
    ports:
      - 9000:8080

$ docker-compose up -d
$ curl localhost:9000
Hello Docker
$ docker-compose down
Stopping hello_echo_1 ... done
Removing hello_echo_1 ... done
Removing network hello_default
```

## その他

### Docker でシェルに入る

```
docker exec -i -t <container> bash
```
