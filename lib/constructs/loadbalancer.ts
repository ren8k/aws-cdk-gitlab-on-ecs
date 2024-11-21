import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";

export interface LoadBalancerProps {
    vpc: ec2.IVpc;
    allowedCidrs: string[];
    domainName?: string;
    subDomain?: string;
    hostedZoneId?: string;
    useHttps: boolean;
}

export class LoadBalancer extends Construct {
    public readonly alb: elbv2.ApplicationLoadBalancer;
    public readonly targetGroup: elbv2.ApplicationTargetGroup;
    public readonly url: string;

    constructor(scope: Construct, id: string, props: LoadBalancerProps) {
        super(scope, id);

        this.alb = new elbv2.ApplicationLoadBalancer(this, "Default", {
            vpc: props.vpc,
            internetFacing: true,
            vpcSubnets: props.vpc.selectSubnets({ subnets: props.vpc.publicSubnets }),
        });

        this.targetGroup = new elbv2.ApplicationTargetGroup(this, "GitlabTargetGroup", {
            vpc: props.vpc,
            port: 80,
            protocol: elbv2.ApplicationProtocol.HTTP,
            targetType: elbv2.TargetType.IP,
            healthCheck: {
                path: "/users/sign_in",
                port: "80",
            },
        });

        let certificate: acm.ICertificate | undefined;
        if (props.useHttps) {
            const hostedZone = route53.PublicHostedZone.fromHostedZoneAttributes(this, "HostedZone", {
                zoneName: props.domainName!,
                hostedZoneId: props.hostedZoneId!,
            });

            certificate = new acm.Certificate(this, "GitlabCertificate", {
                domainName: `${props.subDomain}.${props.domainName}`,
                validation: acm.CertificateValidation.fromDns(hostedZone),
            });

            new route53.ARecord(this, "GitlabDnsRecord", {
                zone: hostedZone,
                recordName: props.subDomain,
                target: route53.RecordTarget.fromAlias(new route53targets.LoadBalancerTarget(this.alb)),
            });
        }

        const listener = this.alb.addListener("GitlabListener", {
            protocol: props.useHttps
                ? elbv2.ApplicationProtocol.HTTPS
                : elbv2.ApplicationProtocol.HTTP,
            open: false,
            certificates: props.useHttps ? [certificate!] : undefined,
            defaultTargetGroups: [this.targetGroup],
        });

        props.allowedCidrs.forEach((cidr) =>
            listener.connections.allowDefaultPortFrom(ec2.Peer.ipv4(cidr))
        );

        this.url = props.useHttps
            ? `https://${props.subDomain}.${props.domainName}`
            : `http://${this.alb.loadBalancerDnsName}`;
    }
}
