import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const salt = await bcrypt.genSalt(10);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const hashPassword = await bcrypt.hash(password, salt);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return hashPassword;
};

export const checkPassword = async (
  setPassword: string,
  getPassword: string,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const verify: boolean = await bcrypt.compare(setPassword, getPassword);
  return verify;
};
