export const responseSuccess = (message: string, code: number, data: any) => ({
  EM: message,
  EC: code,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  DT: data,
});

export const responseError = (message: string, code: number = -1) => ({
  EM: message,
  EC: code,
  DT: [],
});
