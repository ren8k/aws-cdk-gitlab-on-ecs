# Deployment Guide Using AWS CloudShell

AWS CloudShell comes with pre-installed AWS CLI and AWS CDK, making it easy to perform deployments. You can use this method if you'd like to try out the deployment process.

## Downloading deploy.sh and Setting Execute Permissions

Launch [CloudShell](https://console.aws.amazon.com/cloudshell/home) and execute the following commands:

```sh
wget https://raw.githubusercontent.com/ren8k/aws-cdk-gitlab-on-ecs/refs/heads/main/deploy.sh -O deploy.sh
chmod +x deploy.sh
```

## Deployment

Execute the following commands. If you need to configure deployment settings such as IP address restrictions or VPC CIDR, do not execute these commands. Instead, clone this repository and follow the deployment instructions in [README.md](../README.md/#deployment).

```sh
export UV_USE_IO_URING=0
./deploy.sh
```

> [!WARNING]
> As of November 23, 2024, there is an issue in the Tokyo region's CloudShell environment where `npm ci` execution does not complete. As reported in the following Issue, this is due to a bug in the Amazon Linux 2023 kernel version `6.1.115-126.197.amzn2023` used in the Tokyo region's CloudShell environment. Specifically, when executing npm cli, the `io_uring` subsystem overflows, causing the process to hang (stop responding).
>
> Currently, as described in the Issue below, you can work around this bug by executing the command `export UV_USE_IO_URING=0` before running `./deploy.sh`. Alternatively, you can avoid this bug by using CloudShell environments in regions other than Tokyo (such as Osaka region or US East (N. Virginia) region), which use Linux kernel version `6.1.112-124.190.amzn2023.x86_64`.
>
> This issue has been reported to AWS Support and is currently being addressed.
>
> https://github.com/amazonlinux/amazon-linux-2023/issues/840#issuecomment-2485782075
