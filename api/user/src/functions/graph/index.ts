import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.default`,
  events: [
    {
      httpApi: {
        authorizer: {
          name: 'cognito'
        },
        method: 'post',
        path: '/graphql'
      },
    },
    {
      httpApi: {
        authorizer: {
          name: 'cognito'
        },
        method: 'get',
        path: '/graphql'
      },
    }
  ],
};
