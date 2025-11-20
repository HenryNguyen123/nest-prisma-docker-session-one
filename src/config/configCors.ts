import 'dotenv/config';

export const cors = (app: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.enableCors({
    origin: ['http://localhost:3000', process.env.FRONTEND_URL],
    credentials: true,
    methods: 'GET,POST,OPTIONS,PUT,PATCH,DELETE',
  });
};
