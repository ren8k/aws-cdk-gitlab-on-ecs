#!/bin/bash
cd /tmp || exit
git clone https://github.com/ren8k/aws-cdk-gitlab-on-ecs.git
cd aws-cdk-gitlab-on-ecs || exit
npm ci
npx cdk bootstrap
npx cdk deploy
