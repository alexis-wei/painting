import { imageMasking } from '@/api/stability';

export default async function handler(req: any, res: any) {
  await imageMasking(req.body.prompt);
  res.end();
}
