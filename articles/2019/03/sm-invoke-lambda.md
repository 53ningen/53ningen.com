---
title: Lambda 関数を Invoke するだけの State Machine
category: programming
date: 2019-03-04 04:35:45
tags: [Lambda, StepFunctions]
pinned: false
---

```
{
  "Comment": "Just Invoke A Lambda Function",
  "StartAt": "Invoke Lambda Function",
  "States": {
    "Invoke Lambda Function": {
      "Type": "Task",
      "Resource": "(Lambda Function の ARN)",
      "Retry" : [
        {
          "ErrorEquals": [ "States.ALL" ],
          "IntervalSeconds": 30,
          "MaxAttempts": 3,
          "BackoffRate": 1.333
        }
      ],
      "End": true
    }
  }
}
```
