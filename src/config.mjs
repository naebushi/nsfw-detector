const parseBool = (value) => ['true', 'on', '1'].includes((value ?? '').toString().toLowerCase());

export const NSFW_DETECTOR_PORT = process.env.NSFW_DETECTOR_PORT ?? '3000';
export const NSFW_DETECTOR_HOST = process.env.NSFW_DETECTOR_HOST ?? '0.0.0.0';
export const NSFW_DETECTOR_POST_SIZE_LIMIT = parseInt(process.env.NSFW_DETECTOR_POST_SIZE_LIMIT ?? 1024 * 1024 * 5, 10);
export const NSFW_DETECTOR_ALLOW_URL_UPLOADS = parseBool(process.env.NSFW_DETECTOR_ALLOW_URL_UPLOADS);
export const NSFW_DETECTOR_ALLOWED_SOURCES = process.env.NSFW_DETECTOR_ALLOWED_SOURCES;
export const NSFW_DETECTOR_MODEL_NAME = process.env.NSFW_DETECTOR_MODEL_NAME ?? 'MobileNetV2'; //'InceptionV3'
