#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { GitlabServerlessStack } from "../lib/aws-cdk-gitlab-on-ecs-stack";

const app = new cdk.App();

new GitlabServerlessStack(app, "GitlabServerlessStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  allowedCidrs: ["0.0.0.0/0"],
  /**
   * Available properties for GitlabServerlessStack configuration
   * Please refer to GitlabServerlessStackProps in lib/aws-cdk-gitlab-on-ecs-stack.ts
   */

  // Option 1: Deploy a new VPC (default setting)
  // - Specify CIDR and NAT instance if required
  // vpcCidr: "10.0.0.0/16",       // Optional CIDR for new VPC
  // useNatInstance: true,           // Optional NAT instance usage

  // Option 2: Use an existing VPC
  // vpcId: "vpc-XXXXXXXXXXXXXXXXX", // VPC ID for existing VPC

  // Custom Domain Configuration
  // - Define a domain and subdomain if using a custom domain
  // domainName: "example.com",        // Root domain name
  // subDomain: "gitlab",           // Subdomain for GitLab
  // hostedZoneId: "ZXXXXXXXXXXXXXXXXXXXX", // Hosted zone ID for domain

  // Custom GitLab Version Configuration
  // - Configure GitLab root email and specific GitLab image version if needed
  // gitlabRootEmail: "admin@example.com", // Root email for GitLab
  // gitlabImageTag: "17.5.0-ce.0",        // GitLab version tag
});
