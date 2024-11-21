import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as efs from "aws-cdk-lib/aws-efs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cr from "aws-cdk-lib/custom-resources";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export interface EfsInitLambdaProps {
    vpc: ec2.IVpc;
    fileSystem: efs.FileSystem;
}

export class EfsInitLambda extends Construct {
    public readonly initFunction: lambda.IFunction;

    // Define Lambda function to initialize EFS.
    // This function makes 3 directories in EFS root: data, logs, config.
    constructor(scope: Construct, id: string, props: EfsInitLambdaProps) {
        super(scope, id);

        this.initFunction = new lambda.Function(this, "Default", {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: "index.handler",
            code: lambda.Code.fromAsset("lambda"),
            vpc: props.vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
            timeout: cdk.Duration.minutes(1),
            allowAllOutbound: false,
            filesystem: lambda.FileSystem.fromEfsAccessPoint(
                props.fileSystem.addAccessPoint("LambdaAccessPoint", {
                    createAcl: {
                        ownerGid: "0",
                        ownerUid: "0",
                        permissions: "755"
                    },
                    posixUser: {
                        uid: "0",
                        gid: "0"
                    },
                    path: "/"
                }),
                "/mnt/efs"
            ),
            environment: {
                EFS_ID: props.fileSystem.fileSystemId
            }
        });

        const efsInitProvider = new cr.Provider(this, "EfsInitProvider", {
            onEventHandler: this.initFunction,
            logRetention: logs.RetentionDays.ONE_WEEK
        });

        new cdk.CustomResource(this, "EfsInitializer", {
            serviceToken: efsInitProvider.serviceToken
        });
    }
}
