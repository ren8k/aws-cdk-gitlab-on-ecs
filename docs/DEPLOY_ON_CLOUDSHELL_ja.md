# AWS CloudShell を利用したデプロイ方法

CloudShell には，AWS CDK がプリインストールされているため，容易にデプロイを行うことができます．

## deploy.sh のダウンロードと実行権限の付与

[CloudShell](https://console.aws.amazon.com/cloudshell/home) を起動し，以下のコマンドを実行します．

```
wget https://raw.githubusercontent.com/ren8k/aws-cdk-gitlab-on-ecs/refs/heads/main/deploy.sh -O deploy.sh
chmod +x deploy.sh
```

## デプロイ

`deploy.sh` を実行します．

```
./deploy.sh
```

> [!CAUTION]
> 2024/11/23 時点で，本リポジトリの利用にかかわらず，CloudShell 上で `npm ci` を実行すると実行が終了しない事象が発生しています．原因が判明次第，追記する予定です．
