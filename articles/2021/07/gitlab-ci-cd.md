---
slug: gitlab-ci-cd
title: GitLab での CI/CD 入門
category: programming
date: 2021-07-28 03:30:33
tags: [GitLab]
pinned: false
---

GitLab の CI/CD を学んだ記録

- see: [Get started with GitLab CI/CD | GitLab](https://docs.gitlab.com/ee/ci/quick_start/)
- see: [Keyword reference for the .gitlab-ci.yml file | GitLab](https://docs.gitlab.com/ee/ci/yaml/index.html)

## Hello, World!

1. Repository のルートに `.gitlab-ci.yml` を作成
2. ジョブの定義を行うと Hello, World! できる

```yaml
stages:
  - dev

hello-job1:
  stage: dev
  script:
    - echo "Hello, $GITLAB_USER_LOGIN!"
    - echo "This is $CI_COMMIT_BRANCH branch."
    - sleep 5

hello-job2:
  stage: dev
  script:
    - echo "Hello, World!"
```

## イメージの指定

`image` で指定できる

```yaml
default:
  image: ruby:2.7.2

stages:
  - dev

hello-job:
  stage: dev
  script:
    - ruby -v
```

## アーティファクトの指定

生成物は `artifact` で指定できる

```yaml
stages:
  - dev

generate-file:
  stage: dev
  artifacts:
    paths:
      - hoge.txt
  script:
    - echo hoge > hoge.txt
```

このあたりまでおさえれば基本的なことはできそうなので、この記事ではあまり深追いしないこととする

## 便利な事例集

### Markdown テキストから marp での PDF 生成

```yaml
default:
  image: marpteam/marp-cli:latest

stages:
  - build

generate-pdf:
  stage: build
  artifacts:
    paths:
      - slide.pdf
  script:
    - /home/marp/.cli/docker-entrypoint --pdf slide.md -o slide.pdf --allow-local-files
```

### AWS SAM アプリケーションのデプロイ

- 公式にチュートリアルがあるのでそのとおりにやればよい: [Deploying AWS Lambda function using GitLab CI/CD | GitLab](https://docs.gitlab.com/ee/user/project/clusters/serverless/aws.html#aws-serverless-application-model)
- Variables を protected にすると、protected な Branch や Tag でしか環境変数の読み出しができないようになるので注意
  - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION を設定する

```yaml
image: python:3.8

stages:
  - deploy

production:
  stage: deploy
  before_script:
    - pip3 install awscli --upgrade
    - pip3 install aws-sam-cli --upgrade
  script:
    - sam build
    - sam package --output-template-file packaged.yaml --s3-bucket $S3_BUCKET_NAME
    - sam deploy --template-file packaged.yaml --stack-name hoge-fuga-piyo --s3-bucket $S3_BUCKET_NAME --capabilities CAPABILITY_IAM
```
