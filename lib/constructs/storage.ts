import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as efs from "aws-cdk-lib/aws-efs";
import { Construct } from "constructs";

export interface StorageProps {
    readonly vpc: ec2.IVpc;
}

export class Storage extends Construct {
    public readonly fileSystem: efs.FileSystem;

    constructor(scope: Construct, id: string, props: StorageProps) {
        super(scope, id);

        this.fileSystem = new efs.FileSystem(this, "Default", {
            vpc: props.vpc,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
            enableAutomaticBackups: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
    }
}
