#!/bin/bash
cd /tmp
git clone https://github.com/ren8k/aws-cdk-gitlab-on-ecs.git
cd aws-cdk-gitlab-on-ec
npm ci
npx cdk bootstrap
npx cdk deploy
