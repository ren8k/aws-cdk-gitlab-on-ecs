# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `npx cdk deploy` deploy this stack to your default AWS account/region
- `npx cdk diff` compare deployed stack with current state
- `npx cdk synth` emits the synthesized CloudFormation template

## Deploy

```
# install npm dependencies
npm ci
# bootstrap the AWS account (required only once per account and region)
npx cdk bootstrap
# deploy the CDK stack
npx cdk deploy
```

---

---

wget https://raw.githubusercontent.com/ren8k/aws-cdk-ecs-gitlab/refs/heads/main/deploy.sh -O deploy.sh
chmod +x deploy.sh

一時的な不具合で，`500: We're sorry, something went wrong on our end` が出た場合，再度デプロイするか，ECS タスクの再デプロイを行ってください．

## References

- https://github.com/aws-samples/generative-ai-use-cases-jp/blob/main/docs/DEPLOY_ON_CLOUDSHELL.md
- https://github.com/aws-samples/well-architected-iac-analyzer
- https://github.com/aws-samples/dify-self-hosted-on-aws/
- https://github.com/aws-samples/bedrock-claude-chat
