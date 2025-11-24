import { join } from 'path';
import { existsSync, promises as fs } from 'fs';

export const multerImage = async (file: Express.Multer.File) => {
  let avatarUrl: string | null = null;
  let finalPath: string = '';
  if (file) {
    const uploadPath = join(process.cwd(), 'public', 'images', 'avatar');
    if (!existsSync(uploadPath))
      await fs.mkdir(uploadPath, { recursive: true });

    const uniqueName =
      Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    finalPath = join(uploadPath, uniqueName);
    const url = `public/images/avatar/${uniqueName}`;
    avatarUrl = url;
    // upload image avatar into public
    await fs.rename(file.path, finalPath);
    return avatarUrl;
  }
  return null;
};
