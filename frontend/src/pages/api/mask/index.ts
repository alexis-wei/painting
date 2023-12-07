import { generateOutpaint } from '@/api/stability';

export default async function handler(req: any, res: any) {
  try {
    const resultArr: Buffer[] = await generateOutpaint(req.body);
    const body = {
      images: resultArr,
    };
    res.status(200).json(body);
  } catch (error) {
    res.status(500).json({ error });
  }
}
