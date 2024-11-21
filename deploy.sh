#!/bin/bash
cd /tmp
git clone https://github.com/ren8k/aws-cdk-ecs-gitlab.git
cd aws-cdk-ecs-gitlab
npm ci
npx cdk bootstrap
npx cdk deploy
