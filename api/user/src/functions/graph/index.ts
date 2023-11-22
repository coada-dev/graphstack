import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.default`,
  events: [
    {
      httpApi: {
        method: 'post',
        path: '/graphql'
      },
    },
    {
      httpApi: {
        method: 'get',
        path: '/graphql'
      },
    }
  ],
};
