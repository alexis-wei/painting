import * as Generation from '@/protos/generation_pb';
import { GenerationServiceClient } from '@/protos/generation_pb_service';
import { grpc as GRPCWeb } from '@improbable-eng/grpc-web';
import { NodeHttpTransport } from '@improbable-eng/grpc-web-node-http-transport';
import {
  buildGenerationRequest,
  executeGenerationRequest,
  onGenerationComplete,
} from './stability_helpers';
import fs from 'fs';
import path from 'path';

// This is a NodeJS-specific requirement - browsers implementations should omit this line.
GRPCWeb.setDefaultTransport(NodeHttpTransport());

const metadata = new GRPCWeb.Metadata();
metadata.set('Authorization', 'Bearer ' + process.env.STABILITY_AI_API_KEY);

// Create a generation client to use with all future requests
const client = new GenerationServiceClient('https://grpc.stability.ai', {});

export const imageMasking = async (prompt: string) => {
  const initImagePath = path.join(process.cwd(), 'public', 'img.png');
  const initBuffer = fs.readFileSync(initImagePath);
  const initMaskPath = path.join(process.cwd(), 'public', 'mask.jpg');
  const maskBuffer = fs.readFileSync(initMaskPath);

  if (!initBuffer || !maskBuffer) {
    console.log('buffers failed to create');
    return;
  }

  const request = buildGenerationRequest('stable-inpainting-v1-0', {
    type: 'image-to-image-masking',
    initImage: initBuffer,
    maskImage: maskBuffer,
    prompts: [
      {
        text: prompt,
      },
    ],
    seed: 2362349534,
    samples: 1,
    cfgScale: 8,
    steps: 50,
    sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
  });

  try {
    const generatedImageResp = await executeGenerationRequest(
      client,
      request,
      metadata
    );
    onGenerationComplete(generatedImageResp);
  } catch (err) {
    console.log(err);
  }
};
