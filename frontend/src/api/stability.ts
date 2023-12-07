import * as Generation from '@/protos/generation_pb';
import { GenerationServiceClient } from '@/protos/generation_pb_service';
import { grpc as GRPCWeb } from '@improbable-eng/grpc-web';
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport';
import {
  buildGenerationRequest,
  executeGenerationRequest,
  onGenerationComplete,
} from './stability_helpers';
// import fs from 'fs';
// import path from 'path';

GRPCWeb.setDefaultTransport(NodeHttpTransport());

const metadata = new GRPCWeb.Metadata();
metadata.set('Authorization', 'Bearer ' + process.env.STABILITY_AI_API_KEY);

// Create a generation client to use with all future requests
const client = new GenerationServiceClient('https://grpc.stability.ai', {});

export const generateOutpaint = async (requestBody: any): Promise<Buffer[]> => {
  const { prompt, initImg, maskImg } = requestBody;
  const initBuffer = Buffer.from(initImg.split(',')[1], 'base64');
  const maskBuffer = Buffer.from(maskImg.split(',')[1], 'base64');

  if (!initBuffer || !maskBuffer) {
    throw new Error('buffers failed to create');
  }

  const request = buildGenerationRequest('stable-diffusion-512-v2-1', {
    type: 'image-to-image-masking',
    initImage: initBuffer,
    maskImage: maskBuffer,
    prompts: [
      {
        text: prompt,
        weight: 1,
      },
      {
        text: 'nudity, nsfw, blurry, blocky, not smooth',
        weight: -1,
      },
    ],
    seed: Math.floor(Math.random() * 99999999),
    samples: 1,
    cfgScale: 7,
    steps: 50,
    sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
  });

  const generatedImageResp = await executeGenerationRequest(
    client,
    request,
    metadata
  );
  return onGenerationComplete(generatedImageResp);
};
