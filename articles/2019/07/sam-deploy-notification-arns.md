---
slug: sam-deploy-notification-arns
title: AWS SAM CLI で sam deploy 時に notification-arns を指定する
category: programming
date: 2019-07-27 03:15:52
tags: [SAM]
pinned: false
---

SAM CLI の sam deploy コマンドは単に aws cloudformation deploy コマンドのエイリアスに過ぎないので、普通に notification-arns を指定できる。

stack の更新状態を Email とか Lambda + Slack 連携とかで通知したいみたいなときにコンソールいじらなくてよくて便利です。

これはソースコードをみると、簡単にわかる。

samcli/commands/deploy/__init__.py: [aws-sam-cli/__init__.py at b6daabdcbc54af311a7a9c582e2429d3e622dcf5 · awslabs/aws-sam-cli](https://github.com/awslabs/aws-sam-cli/blob/b6daabdcbc54af311a7a9c582e2429d3e622dcf5/samcli/commands/deploy/__init__.py#L11)

```
    
"""
CLI command for "deploy" command
"""

import click

from samcli.cli.main import pass_context, common_options
from samcli.lib.samlib.cloudformation_command import execute_command


SHORT_HELP = "Deploy an AWS SAM application. This is an alias for 'aws cloudformation deploy'."


@click.command("deploy", short_help=SHORT_HELP, context_settings={"ignore_unknown_options": True})
@click.argument("args", nargs=-1, type=click.UNPROCESSED)
@common_options
@pass_context
def cli(ctx, args):

    # All logic must be implemented in the ``do_cli`` method. This helps with easy unit testing

    do_cli(args)  # pragma: no cover


def do_cli(args):
    execute_command("deploy", args)
```

samcli/lib/samlib/cloudformation.py: [aws-sam-cli/cloudformation_command.py at b6daabdcbc54af311a7a9c582e2429d3e622dcf5 · awslabs/aws-sam-cli](https://github.com/awslabs/aws-sam-cli/blob/b6daabdcbc54af311a7a9c582e2429d3e622dcf5/samcli/lib/samlib/cloudformation_command.py#L17)

```
"""
Utility to call cloudformation command with args
"""

import logging
import platform
import subprocess
import sys

LOG = logging.getLogger(__name__)


def execute_command(command, args):
    LOG.debug("%s command is called", command)
    try:
        aws_cmd = 'aws' if platform.system().lower() != 'windows' else 'aws.cmd'
        subprocess.check_call([aws_cmd, 'cloudformation', command] + list(args))
        LOG.debug("%s command successful", command)
    except subprocess.CalledProcessError as e:
        # Underlying aws command will print the exception to the user
        LOG.debug("Exception: %s", e)
        sys.exit(e.returncode)
```


まあそもそも sam deploy --help とすると以下のように表示され、cloudformation deploy のヘルプを参照してね、と出てくるのですけどね...。 教訓: help はちゃんと読みましょう。

```
Usage: sam deploy [OPTIONS] [ARGS]...

  The sam deploy command creates a Cloudformation Stack and deploys your
  resources.

  e.g. sam deploy --template-file packaged.yaml --stack-name sam-app --capabilities CAPABILITY_IAM

  This is an alias for aws cloudformation deploy. To learn about other parameters you can use,
  run aws cloudformation deploy help.
```
