import vision from '@google-cloud/vision';
import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import { Storage } from '@google-cloud/storage';
import { OpenAI } from '@langchain/openai';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';

const visionClient = new vision.ImageAnnotatorClient();
const videoIntelligenceClient = new VideoIntelligenceServiceClient();
const storage = new Storage();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET);

async function analyzeImage(imageUrl) {
  const [result] = await visionClient.annotateImage({
    image: { source: { imageUri: imageUrl } },
    features: [
      { type: 'LABEL_DETECTION' },
      { type: 'SAFE_SEARCH_DETECTION' },
      { type: 'FACE_DETECTION' },
      { type: 'LANDMARK_DETECTION' },
      { type: 'TEXT_DETECTION' },
    ],
  });

  const labels = result.labelAnnotations.map(label => label.description).join(', ');
  const safeSearch = result.safeSearchAnnotation;
  const faces = result.faceAnnotations.length;
  const landmarks = result.landmarkAnnotations.map(landmark => landmark.description).join(', ');
  const text = result.textAnnotations.length > 0 ? result.textAnnotations[0].description : '';

  return { labels, safeSearch, faces, landmarks, text };
}

async function analyzeVideo(videoUrl) {
  const gcsUri = `gs://${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${path.basename(videoUrl)}`;

  const [operation] = await videoIntelligenceClient.annotateVideo({
    inputUri: gcsUri,
    features: ['LABEL_DETECTION', 'SHOT_CHANGE_DETECTION', 'EXPLICIT_CONTENT_DETECTION'],
  });

  const [result] = await operation.promise();

  const labels = result.annotationResults[0].segmentLabelAnnotations
    .map(label => label.entity.description)
    .join(', ');

  const shots = result.annotationResults[0].shotAnnotations.length;

  const explicitContent = result.annotationResults[0].explicitAnnotation.frames
    .some(frame => frame.pornographyLikelihood === 'VERY_LIKELY' || frame.pornographyLikelihood === 'LIKELY');

  return { labels, shots, explicitContent };
}

async function analyzeAudio(audioUrl) {
  const gcsUri = `gs://${process.env.GOOGLE_CLOUD_STORAGE_BUCKET}/${path.basename(audioUrl)}`;

  const [response] = await videoIntelligenceClient.annotateVideo({
    inputUri: gcsUri,
    features: ['SPEECH_TRANSCRIPTION'],
    videoContext: {
      speechTranscriptionConfig: {
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
      },
    },
  });

  const [result] = await response.promise();

  const transcription = result.annotationResults[0].speechTranscriptions
    .map(transcription => transcription.alternatives[0].transcript)
    .join(' ');

  return { transcription };
}

async function analyzeMedia(mediaUrl, mediaType) {
  let analysis;

  switch (mediaType) {
    case 'image':
      analysis = await analyzeImage(mediaUrl);
      break;
    case 'video':
      analysis = await analyzeVideo(mediaUrl);
      break;
    case 'audio':
      analysis = await analyzeAudio(mediaUrl);
      break;
    default:
      throw new Error('Unsupported media type');
  }

  const prompt = `Analyze the following ${mediaType} content in the context of a potential disaster or emergency situation:

${JSON.stringify(analysis, null, 2)}

Provide a detailed interpretation of the content, focusing on:
1. Any signs of danger or emergency situations
2. Potential impact on people or infrastructure
3. Relevance to disaster response or emergency management
4. Any actionable insights for first responders or emergency services`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an AI assistant specializing in disaster and emergency analysis.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
  });

  return response.choices[0].message.content;
}

export { analyzeMedia };