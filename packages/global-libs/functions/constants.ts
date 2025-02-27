export const defaultConfig = {
  cors: {
    origin: '*',
    headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent']
  }
};

export const userHeader = {
  authorizer: {
    name: 'motforex-users',
    arn: 'arn:aws:cognito-idp:ap-southeast-1:786487424160:userpool/ap-southeast-1_uFWbndS6d',
    type: 'COGNITO_USER_POOLS'
  },
  cors: {
    origin: '*',
    headers: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent']
  }
};

export const adminHeader = {
  authorizer: {
    name: 'motforex-admins',
    arn: 'arn:aws:cognito-idp:ap-southeast-1:786487424160:userpool/ap-southeast-1_iSsIgz0kc',
    type: 'COGNITO_USER_POOLS'
  },
  cors: {
    origin: '*',
    headers: [
      'Content-Type',
      'X-Amz-Date',
      'Authorization',
      'X-Api-Key',
      'X-Amz-Security-Token',
      'X-Amz-User-Agent',
      'Permission'
    ]
  }
};
