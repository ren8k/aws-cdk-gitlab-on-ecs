# Deployment Options

You can specify deployment options by editing [`bin/aws-cdk-gitlab-on-ecs.ts`](../bin/aws-cdk-gitlab-on-ecs.ts). The following options can be combined as needed.

## Specifying IP Ranges Allowed to Access ALB

Specify `allowedCidrs` as shown below:

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

## Specifying CIDR for New VPC and Using NAT Instance

Specify `vpcCidr` and `useNatInstance` as shown below:

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

## Using an Existing VPC

Specify `vpcId` as shown below:

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

## Using an Existing Domain

Specify `domainName`, `subDomain`, and `hostedZoneId` as shown below. Here, `hostedZoneId` is the hosted zone ID of the domain managed in Route 53.(The following example also enables NAT Instance.)

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

## Specifying GitLab Version and Administrator Email

Specify `gitlabRootEmail` and `gitlabImageTag` as shown below:

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
