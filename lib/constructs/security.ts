import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";
import * as efs from "aws-cdk-lib/aws-efs";
import { Construct } from "constructs";

export interface SecurityProps {
    readonly gitlabRootEmail: string;
    readonly fileSystem: efs.IFileSystem;
}

export class Security extends Construct {
    public readonly gitlabSecret: secretsmanager.ISecret;
    public readonly taskRole: iam.Role;

    constructor(scope: Construct, id: string, props: SecurityProps) {
        super(scope, id);

        this.gitlabSecret = new secretsmanager.Secret(this, "Default", {
            description: "Gitlab root credentials",
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ email: props.gitlabRootEmail }),
                generateStringKey: "password"
            }
        });

        this.taskRole = new iam.Role(this, "EcsTaskRole", {
            assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
        });

        // Allow ECS tasks to mount EFS
        props.fileSystem.grantReadWrite(this.taskRole);

        // Allow ECS tasks to login via SSM
        this.taskRole.addToPolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    "ssmmessages:CreateDataChannel",
                    "ssmmessages:OpenDataChannel",
                    "ssmmessages:OpenControlChannel",
                    "ssmmessages:CreateControlChannel",
                ],
                resources: ["*"],
            })
        );
    }
}
