import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { GitlabServerlessStack } from '../lib/aws-cdk-gitlab-on-ecs-stack';

test('Snapshot test', () => {
    const app = new cdk.App();
    const stack = new GitlabServerlessStack(app, 'TestStack', {
        allowedCidrs: ["0.0.0.0/0"],
        vpcCidr: "10.0.0.0/16",
        useNatInstance: true,
        domainName: "example.com",
        subDomain: "gitlab",
        hostedZoneId: "Z0123456789ABCDEFG",
        gitlabRootEmail: "admin@example.com",
        gitlabImageTag: "17.5.0-ce.0",
    });
    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
});
