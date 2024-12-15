import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";

export interface SecurityProps {
    readonly gitlabRootEmail: string;
}

export class Security extends Construct {
    public readonly gitlabSecret: secretsmanager.ISecret;

    constructor(scope: Construct, id: string, props: SecurityProps) {
        super(scope, id);

        this.gitlabSecret = new secretsmanager.Secret(this, "Default", {
            description: "Gitlab root credentials",
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ email: props.gitlabRootEmail }),
                generateStringKey: "password"
            }
        });
    }
}
