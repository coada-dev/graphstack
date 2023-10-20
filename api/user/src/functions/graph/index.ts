import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.default`,
  events: [
    {
      http: {
        method: 'post',
        path: 'graphql'
      },
    },
    {
      http: {
        method: 'get',
        path: 'graphql'
      },
    }
  ],
};
