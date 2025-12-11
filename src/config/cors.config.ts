import 'dotenv/config';

export const cors = (app: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: 'GET,POST,OPTIONS,PUT,PATCH,DELETE',
  });
};

export const corsDev = (app: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: 'GET,POST,OPTIONS,PUT,PATCH,DELETE',
  });
};
