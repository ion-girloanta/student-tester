import json
import os
def handler(event, context):
  region = os.environ.get("BEDROCK_REGION")
  model = os.environ.get("MODEL_ID")
  return {
      "statusCode": 200,
      "body": json.dumps({
          "message": "Hello World",
      }),
  }
