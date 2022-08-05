# AWS SSM Send-Command

Documentation for AWS SSM: \
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SSM.html

**To apply changes run 'npm run build' command and commit all changes after that**
**Also check version you use in pipeline. Maybe you need to release new version of action**

This action can send command to ec2 instance and get result

## Contents

- [Requirements](#Requirements)
- [Usage example](#Usage-example)
- [Inputs](#Inputs)
- [Outputs](#Outputs)
- [Error Handling](#Error-Handling)

## Requirements

1. Set AWS IAM Role `AmazonSSMFullAccess` to your IAM user.
2. EC2 Instance must have IAM Role including `AmazonSSMFullAccess` and `AmazonEC2ContainerRegistryFullAccess`.

## Usage example

```yml
name: AWS SSM Send-Command Example

on:
  push:
    branches: [master]

jobs:
  start:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: AWS SSM Send Command
        uses: preludedynamics/aws-ssm-action@master
        id: ec2-command
        with:
          aws-region: ${{ secrets.AWS_REGION }}
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          instance-ids: i-3tgrb43g345t4
          mode: send

          working-directory: /home/ec2-user
          command: ls
          comment: Get list

      # Get SSM command result
      - name: AWS SSM Result
        uses: preludedynamics/aws-ssm-action@master
        id: ec2-command-result
        with:
          aws-region: ${{ secrets.AWS_REGION }}
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          instance-ids: i-3tgrb43g345t4
          mode: result
          command-id: ${{ steps.ec2-command.outputs.command-id }}
```

## Inputs

### `mode`

**Required** Action supports 2 mods: **send** and **result**

```yml
mode: send

mode: result
```

### `command-id`

**Required only for result mode** Provide command id to find command result

```yml
command-id: <uuid>

# example of getting command id from previous step
command-id: ${{ steps.ec2-deploy.outputs.command-id }}
```

### `aws-access-key-id`

**Required** IAM access key id.

### `aws-secret-access-key`

**Required** IAM secret access key id.

### `aws-region`

**Required** AWS EC2 Instance region. (e.g. us-west-1, us-northeast-1, ...)

### `instance-ids`

**Required** The id of AWS EC2 instance (e.g i-xxx...)

```yml
# single instance
instance-ids: i-0b1f8b18a1d450000

# multiple instances
instance-ids: |
  i-0b1f8b18a1d450000
  i-0b1f8b18a1d450001
  i-0b1f8b18a1d450002
```

### `command`

**Required only for send mode** Bash command to execute in a EC2 instance.

```yml
# example
command: /bin/sh script.sh
```

### `working-directory`

**Required only for send mode** Where bash command executes.

```yml
working-directory: /home/ec2-user
```

### `comment`

Logging message.

```yml
# default
comment: Executed by Github Actions
```

## Outputs

### command-id

AWS SSM Run command id (uuid)

```bash
07011e6a-f5ad-4f79-a457-75055766e837
```

## Error Handling

### AccessDeniedException

Please, check the requirements for IAM user role

### InvalidInstanceId: null

Please, check the requirements for EC2 IAM permissions
