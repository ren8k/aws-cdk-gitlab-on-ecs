import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface NetworkProps {
    vpcCidr?: string;
    useNatInstance?: boolean;
    vpcId?: string;
}

export class Network extends Construct {
    public readonly vpc: ec2.IVpc;

    constructor(scope: Construct, id: string, props: NetworkProps) {
        super(scope, id);

        if (props.vpcId) {
            this.vpc = ec2.Vpc.fromLookup(this, "Default", {
                vpcId: props.vpcId,
            });
        } else {
            const natInstance = props.useNatInstance
                ? ec2.NatProvider.instanceV2({
                    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.NANO),
                    defaultAllowedTraffic: ec2.NatTrafficDirection.OUTBOUND_ONLY,
                })
                : undefined;

            this.vpc = new ec2.Vpc(this, "Default", {
                natGatewayProvider: natInstance ? natInstance : undefined,
                natGateways: 1,
                ipAddresses: props.vpcCidr ? ec2.IpAddresses.cidr(props.vpcCidr) : undefined,
                maxAzs: 2,
                subnetConfiguration: [
                    {
                        name: "Public",
                        subnetType: ec2.SubnetType.PUBLIC,
                    },
                    {
                        name: "Private",
                        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    },
                ],
            });

            if (natInstance) {
                natInstance.connections.allowFrom(ec2.Peer.ipv4(this.vpc.vpcCidrBlock), ec2.Port.tcp(443), "Allow HTTPS from VPC"); // for SecretManager
            }
        }
    }
}
