/*
  Must be run in the Amplify project root directory.
  To install the Amplify backend package, run:  
    npm install --save-dev @aws-amplify/backend
*/
import { defineFunction } from "@aws-amplify/backend";

const MODEL_ID = "stability.stable-image-core-v1:0";
const REGION = "us-west-2";
const BUCKET_NAME =  'your-course-files-bucket'
const BEDROCK_REGION = 'us-east-1'

const generateImage = defineFunction({
  name: "generateImage",
  entry: "./handler.ts",
  environment: {
    MODEL_ID,
    REGION,
  },
  timeoutSeconds: 500,
});

const parseCourseDocument = defineFunction({
  name: 'parseCourseDocument',
  runtime: 'python3.11' as any,
  entry: './parseCourseDocument/index.py',
  environment: {
    BUCKET_NAME
  },
  timeoutSeconds: 10,
  memoryMB: 512,
  /*
  permissions: {
    's3:GetObject': ['arn:aws:s3:::your-course-files-bucket/*'],
    'bedrock:InvokeModel': ['*'],                    
  }*/
 });

const gptEvaluateAnswer = defineFunction({
  name: 'gptEvaluateAnswer',
  runtime: 'python3.11' as any,
  entry: './gptEvaluateAnswer/index.py',
  timeoutSeconds: 30,
  memoryMB: 512,  
  environment: {
    BEDROCK_REGION,
  },
 });

const generateQuestions = defineFunction({
  name: 'generateQuestions',
  runtime: 'python3.11' as any,
  entry: './generateQuestions/index.py',
  environment: {
    BEDROCK_REGION,
  }
});

const imageGen = defineFunction({
  name: 'imageGen',
  runtime: 'python3.11' as any,
  entry: './imageGen/index.py',
  environment: {
    BEDROCK_REGION,
  }
});

const textGen = defineFunction({
  name: 'imageGen',
  runtime: 'python3.11' as any,
  entry: './textGen/index.py',
  environment: {
    BEDROCK_REGION,
  }
});


export {
  generateImage,
  gptEvaluateAnswer,
  parseCourseDocument,
  generateQuestions,
  textGen,
  imageGen,
};
