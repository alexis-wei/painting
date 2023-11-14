import { imageMasking } from '@/api/stability';

export default async function handler(req: any, res: any) {
  try {
    await imageMasking(req.body.prompt);
    res.status(200);
  } catch {
    res.status(400);
  }
}
