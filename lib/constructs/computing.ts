import * as cdk from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as efs from "aws-cdk-lib/aws-efs";
import { Construct } from "constructs";

export interface ComputingProps {
    readonly vpc: ec2.IVpc;
    readonly taskRole: iam.IRole;
    readonly fileSystem: efs.IFileSystem;
    readonly targetGroup: elbv2.IApplicationTargetGroup;
    readonly gitlabSecret: secretsmanager.ISecret;
    readonly gitlabImageTag: string;
    readonly externalUrl: string;
    readonly useHttps: boolean;
}

export class Computing extends Construct {
    private readonly gitlabDir = {
        container: {
            data: "/var/opt/gitlab",
            logs: "/var/log/gitlab",
            config: "/etc/gitlab"
        },
        efs: {
            data: "/srv/gitlab/data",
            logs: "/srv/gitlab/logs",
            config: "/srv/gitlab/config"
        }
    } as const;

    constructor(scope: Construct, id: string, props: ComputingProps) {
        super(scope, id);

        const cluster = new ecs.Cluster(this, "GitlabCluster", {
            vpc: props.vpc,
            containerInsights: true,
        });

        const taskDefinition = new ecs.FargateTaskDefinition(this, "GitlabTaskDefinition", {
            cpu: 2048,
            memoryLimitMiB: 6144, // require more than 6GB in my experience
            taskRole: props.taskRole,
            runtimePlatform: { cpuArchitecture: ecs.CpuArchitecture.X86_64 },
        });

        const container = taskDefinition.addContainer("GitlabContainer", {
            image: ecs.ContainerImage.fromRegistry(
                `gitlab/gitlab-ce:${props.gitlabImageTag}`
            ),
            portMappings: [{ containerPort: 80 }],
            secrets: {
                GITLAB_ROOT_PASSWORD: ecs.Secret.fromSecretsManager(props.gitlabSecret, "password"),
                GITLAB_ROOT_EMAIL: ecs.Secret.fromSecretsManager(props.gitlabSecret, "email"),
            },
            environment: {
                GITLAB_OMNIBUS_CONFIG: props.useHttps
                    ? // If HTTPS is enabled, set the external URL to use the domain name with HTTPS.
                    // Also, configure NGINX to listen on port 80 and disable HTTPS inside the GitLab container,
                    // as SSL termination is handled by the ALB (reverse proxy).
                    // https://stackoverflow.com/questions/51487180/gitlab-set-external-url-to-https-without-certificate
                    `external_url '${props.externalUrl}'; nginx['listen_port'] = 80; nginx['listen_https'] = false;`
                    : // If HTTPS is not enabled, use the ALB's DNS name and set the external URL.
                    `external_url '${props.externalUrl}'`,
            },
            logging: ecs.LogDrivers.awsLogs({ streamPrefix: "gitlab" }),
        });

        container.addMountPoints(
            {
                sourceVolume: "data",
                containerPath: this.gitlabDir.container.data,
                readOnly: false,
            },
            {
                sourceVolume: "logs",
                containerPath: this.gitlabDir.container.logs,
                readOnly: false,
            },
            {
                sourceVolume: "config",
                containerPath: this.gitlabDir.container.config,
                readOnly: false,
            }
        );

        // Mount EFS directories
        // Not using EFS access points because multiple UID/GID operations are required for file operations at mount points
        const addEfsVolume = (
            taskDefinition: ecs.FargateTaskDefinition,
            name: string,
            fileSystemId: string,
            rootDirectory: string
        ) => {
            taskDefinition.addVolume({
                name: name,
                efsVolumeConfiguration: {
                    fileSystemId: fileSystemId,
                    transitEncryption: "ENABLED",
                    authorizationConfig: {
                        iam: "ENABLED",
                    },
                    rootDirectory: rootDirectory
                },
            });
        };

        addEfsVolume(taskDefinition, "data", props.fileSystem.fileSystemId, this.gitlabDir.efs.data);
        addEfsVolume(taskDefinition, "logs", props.fileSystem.fileSystemId, this.gitlabDir.efs.logs);
        addEfsVolume(taskDefinition, "config", props.fileSystem.fileSystemId, this.gitlabDir.efs.config);

        const service = new ecs.FargateService(this, "GitlabService", {
            cluster,
            taskDefinition,
            desiredCount: 1,
            assignPublicIp: false,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
            healthCheckGracePeriod: cdk.Duration.seconds(540), // gitlab requires a long grace period for health checks
            enableExecuteCommand: true,
        });

        service.attachToApplicationTargetGroup(props.targetGroup);

        // Allow inbound NFS traffic from ECS
        props.fileSystem.connections.allowDefaultPortFrom(service, "Allow inbound NFS traffic from ECS");
    }
}
