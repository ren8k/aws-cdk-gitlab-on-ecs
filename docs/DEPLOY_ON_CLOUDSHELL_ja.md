# AWS CloudShell を利用したデプロイ方法

CloudShell には，AWS CLI や AWS CDK がプリインストールされているため，容易にデプロイを行うことができます．試しにデプロイしてみたい場合にご利用下さい．

## deploy.sh のダウンロードと実行権限の付与

[CloudShell](https://console.aws.amazon.com/cloudshell/home) を起動し，以下のコマンドを実行します．

```sh
wget https://raw.githubusercontent.com/ren8k/aws-cdk-gitlab-on-ecs/refs/heads/main/deploy.sh -O deploy.sh
chmod +x deploy.sh
```

## デプロイ

以下のコマンドを実行します．なお，デプロイ時の IP アドレス制限や VPC の CIDR 等の設定を行いたい場合，以下のコマンドを実行せず，本リポジトリを clone 後，[README.md](../README.md/#デプロイ)に記載のデプロイ手順に従って下さい．

```sh
export UV_USE_IO_URING=0
./deploy.sh
```

> [!WARNING]
> 執筆時点（2024/11/23）で，東京リージョンの CloudShell 環境において，`npm ci` の実行が終了しない事象が発生しています．この原因は，以下の Issue で報告されている通り，東京リージョンの CloudShell 環境で利用されている Amazon Linux 2023 のカーネルバージョン `6.1.115-126.197.amzn2023` に起因するバグのためです．具体的には，npm cli 実行時，`io_uring` サプシステムがオーバーフローしてしまう結果，プロセスがハング（応答停止）してしまうためです．
>
> このため，現時点では以下の Issue に記載の通り，`./deploy.sh` 実行前にコマンド `export UV_USE_IO_URING=0` を実行することで，本バグを回避することが可能です．その他，東京リージョン以外のリージョン（例えば大阪リージョン，バージニア北部リージョン）の CloudShell 環境で利用されている Linux カーネルバージョンは `6.1.112-124.190.amzn2023.x86_64` なので，こちらを利用することで，本バグを回避することも可能です．
>
> なお，上記事象は AWS サポートに報告しており，現在修正対応中とのことです．
>
> https://github.com/amazonlinux/amazon-linux-2023/issues/840#issuecomment-2485782075
