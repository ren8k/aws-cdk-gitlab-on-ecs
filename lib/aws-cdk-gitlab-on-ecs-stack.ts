import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Network } from "./constructs/network";
import { Storage } from "./constructs/storage";
import { LoadBalancer } from "./constructs/loadbalancer";
import { Security } from "./constructs/security";
import { Computing } from "./constructs/computing";
import { EfsInitLambda } from "./constructs/efs-init-lambda";

export interface GitlabServerlessStackProps extends cdk.StackProps {
  /**
   * The IP address ranges in CIDR notation that have access to GitLab.
   * You can restrict access to specific IP ranges for security.
   * @example ["1.1.1.1/32", "2.2.2.2/24"]
   */
  readonly allowedCidrs: string[];

  /**
   * The CIDR block for the VPC where GitLab will be deployed.
   * Ignored when you import an existing VPC.
   * @example "10.0.0.0/16"
   */
  readonly vpcCidr?: string;

  /**
   * Use t4g.nano NAT instances instead of NAT Gateway.
   * Set to true to minimize AWS costs.
   * Ignored when you import an existing VPC.
   * @default false
   */
  readonly useNatInstance?: boolean;

  /**
   * If set, it imports the existing VPC instead of creating a new one.
   * The VPC must have public and private subnets.
   * @default create a new VPC
   */
  readonly vpcId?: string;

  /**
   * The domain name for GitLab's service URL.
   * You must own a Route53 public hosted zone for the domain in your account.
   * @default undefined - No custom domain is used
   */
  readonly domainName?: string;

  /**
   * The subdomain to use for GitLab.
   * This will be combined with the domain name to form the complete URL.
   * @example "gitlab" will result in "gitlab.yourdomain.com"
   * @default undefined
   */
  readonly subDomain?: string;

  /**
   * The ID of Route53 hosted zone for the domain.
   * Required if domainName is specified.
   * @default undefined
   */
  readonly hostedZoneId?: string;

  /**
   * The email address for the GitLab root user.
   * This will be used to create the initial admin account.
   * @default "admin@example.com"
   */
  readonly gitlabRootEmail?: string;

  /**
   * The version tag of the GitLab container image to deploy.
   * The image will be pulled from [here](https://hub.docker.com/r/gitlab/gitlab-ce)
   * @example "17.5.0-ce.0"
   * @default "latest"
   */
  readonly gitlabImageTag?: string;
}

export class GitlabServerlessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GitlabServerlessStackProps) {
    super(scope, id, props);

    const {
      gitlabRootEmail: rootEmail = "admin@example.com",
      gitlabImageTag: imageTag = "latest",
    } = props;

    if ((props.hostedZoneId != null) !== (props.domainName != null) ||
      (props.hostedZoneId != null) !== (props.subDomain != null)) {
      throw new Error(`You have to set hostedZoneId, domainName, and subDomain together! Or leave them all blank.`);
    }

    const useHttps = Boolean(props.domainName && props.subDomain && props.hostedZoneId);

    // Network (VPC)
    const network = new Network(this, "Network", {
      useNatInstance: props.useNatInstance,
      vpcId: props.vpcId,
    });

    // Storage (EFS)
    const storage = new Storage(this, "Storage", {
      vpc: network.vpc,
    });

    // Security (Secrets Manager)
    const security = new Security(this, "Security", {
      gitlabRootEmail: rootEmail,
    });

    // LoadBalancer (ALB, DNS)
    const loadBalancer = new LoadBalancer(this, "LoadBalancer", {
      vpc: network.vpc,
      allowedCidrs: props.allowedCidrs,
      domainName: props.domainName,
      subDomain: props.subDomain,
      hostedZoneId: props.hostedZoneId,
      useHttps,
    });

    // EFS Initialization (Lambda)
    const efsInitializer = new EfsInitLambda(this, "EfsInitLambda", {
      vpc: network.vpc,
      fileSystem: storage.fileSystem,
    });

    // Computing (ECS, Fargate)
    const computing = new Computing(this, "Computing", {
      vpc: network.vpc,
      fileSystem: storage.fileSystem,
      targetGroup: loadBalancer.targetGroup,
      gitlabSecret: security.gitlabSecret,
      gitlabImageTag: imageTag,
      externalUrl: loadBalancer.url,
      useHttps,
    });

    // Dependencies (VPC -> Lambda -> ECS)
    efsInitializer.initFunction.node.addDependency(network.vpc);
    computing.node.addDependency(efsInitializer.initFunction);

    new cdk.CfnOutput(this, "GitlabUrl", {
      value: loadBalancer.url,
    });
  }
}
