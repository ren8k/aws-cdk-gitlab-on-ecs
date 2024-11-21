import logging
import os
from typing import Any, Dict

logger = logging.getLogger()
logger.setLevel(logging.INFO)

MOUNT_POINT = "/mnt/efs"

GITLAB_DIRS = [
    "/srv/gitlab/data",
    "/srv/gitlab/logs",
    "/srv/gitlab/config",
]


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    try:
        # check if the EFS mount point exists
        if not os.path.exists(MOUNT_POINT):
            logger.error(f"EFS mount point {MOUNT_POINT} does not exist")
            raise FileNotFoundError(f"EFS mount point {MOUNT_POINT} does not exist")

        # make 3 directories
        for dir_path in GITLAB_DIRS:
            full_path = os.path.join(MOUNT_POINT, dir_path.lstrip("/"))
            os.makedirs(full_path, exist_ok=True)
            logger.info(f"Successfully created directory: {full_path}")

        return {
            "StatusCode": 200,
            "Message": "Successfully initialized EFS directories",
        }

    except Exception as e:
        logger.error(f"Error during EFS initialization: {str(e)}")
        raise e
