import { imageMasking } from '@/api/stability';

export default async function handler(req: any, res: any) {
  console.log('called maks handler');
  try {
    await imageMasking(req.body);
    res.status(200);
  } catch {
    res.status(400);
  }
}
