#/bin/bash
CLUSTER_NAME=XXXXXXXXXXXXXXXXXXX
TASK_ID=arn:aws:ecs:ap-northeast-1:123456789123:task/XXXXXXXXXXXXXXXXXXXXXXXXXX
CONTAINER_NAME=GitlabContainer

aws ecs execute-command \
    --cluster $CLUSTER_NAME \
    --task  $TASK_ID\
    --container $CONTAINER_NAME \
    --interactive \
    --command "/bin/bash"
