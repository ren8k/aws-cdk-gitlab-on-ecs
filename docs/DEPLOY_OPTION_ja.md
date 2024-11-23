# デプロイオプション

`bin/aws-cdk-gitlab-on-ecs.ts` を編集することで，デプロイオプションを指定することができます．以降に紹介するオプションを組み合わせることも可能です．

## ALB にアクセス可能な IP レンジを指定する場合

以下のように，`allowedCidrs` を指定して下さい．

```typescript
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GitlabServerlessStack } from "../lib/aws-cdk-gitlab-on-ecs-stack";

const app = new cdk.App();

new GitlabServerlessStack(app, "GitlabServerlessStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  allowedCidrs: ["1.1.1.1/16", "2.2.2.2/16"],
});
```

## 新規作成する VPC の CIDR の指定や， NAT インスタンスを利用する場合

以下のように，`vpcCidr` と `useNatInstance` を指定して下さい．

```typescript
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GitlabServerlessStack } from "../lib/aws-cdk-gitlab-on-ecs-stack";

const app = new cdk.App();

new GitlabServerlessStack(app, "GitlabServerlessStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  allowedCidrs: ["0.0.0.0/0"],
  /**
   * Available properties for GitlabServerlessStack configuration
   * Please refer to GitlabServerlessStackProps in lib/aws-cdk-gitlab-on-ecs-stack.ts
   */

  // Option 1: Deploy a new VPC (default setting)
  // - Specify CIDR and NAT instance if required
  vpcCidr: "10.1.0.0/16", // Optional CIDR for new VPC
  useNatInstance: true, // Optional NAT instance usage
});
```

## 既存の VPC を利用する場合

以下のように，`vpcId` を指定して下さい．

```typescript
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GitlabServerlessStack } from "../lib/aws-cdk-gitlab-on-ecs-stack";

const app = new cdk.App();

new GitlabServerlessStack(app, "GitlabServerlessStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  allowedCidrs: ["0.0.0.0/0"],

  // Option 2: Use an existing VPC
  vpcId: "vpc-XXXXXXXXXXXXXXXXX", // VPC ID for existing VPC
});
```

## 既存のドメインを利用する場合

以下のように，`domainName`，`subDomain`，`hostedZoneId` を指定して下さい．（以下の例では，NAT Instance の有効化も行っています．）

```typescript
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GitlabServerlessStack } from "../lib/aws-cdk-gitlab-on-ecs-stack";

const app = new cdk.App();

new GitlabServerlessStack(app, "GitlabServerlessStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  useNatInstance: true, // Optional NAT instance usage

  // Custom Domain Configuration
  // - Define a domain and subdomain if using a custom domain
  domainName: "example.com", // Root domain name
  subDomain: "gitlab", // Subdomain for GitLab
  hostedZoneId: "ZXXXXXXXXXXXXXXXXXXXX", // Hosted zone ID for domain
});
```

## Gitlab のバージョン指定，管理者の email 指定する場合

以下のように，`gitlabRootEmail`，`gitlabImageTag` を指定して下さい．

```typescript
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GitlabServerlessStack } from "../lib/aws-cdk-gitlab-on-ecs-stack";

const app = new cdk.App();

new GitlabServerlessStack(app, "GitlabServerlessStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  allowedCidrs: ["0.0.0.0/0"],

  // Custom GitLab Version Configuration
  // - Configure GitLab root email and specific GitLab image version if needed
  gitlabRootEmail: "admin@example.com", // Root email for GitLab
  gitlabImageTag: "17.5.0-ce.0", // GitLab version tag
});
```
