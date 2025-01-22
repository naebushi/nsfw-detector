import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs';
import sharp from 'sharp';
import { NSFW_DETECTOR_MODEL_NAME } from '#src/config.mjs';

tf.enableProdMode();

const model = await nsfwjs.load(NSFW_DETECTOR_MODEL_NAME);

/**
 * @param  {Buffer} img
 * @return {Promise<tf.Tensor>}
 */
const toTensor = async function (img) {
    const { data, info } = await sharp(img).raw().toBuffer({ resolveWithObject: true });

    const numChannels = 3;
    const values = new Int32Array(info.width * info.height * numChannels);

    for (let i = 0; i < values.length; i++) {
        values[i] = data[i];
    }

    return tf.tensor3d(values, [info.height, info.width, numChannels], 'int32');
};

/**
 * @param  {Array} input
 * @return {Object}
 */
const arrayToResponseObject = function (input) {
    const entries = input.map(({ className, probability }) => [
        className.toLowerCase(),
        parseFloat(probability.toFixed(4).replace(/\.?0+$/, '')),
    ]);

    return Object.fromEntries(entries);
};

/**
 * @param  {Buffer} rawData
 * @return {Promise<Object>}
 */
export const detectFromRaw = async function (rawData) {
    const tensor = await toTensor(rawData);
    const classification = await model.classify(tensor);
    return arrayToResponseObject(classification);
};

/**
 * @param  {String} url
 * @return {Promise<Object>}
 */
export const detectFromUrl = async function (url) {
    const contents = await fetch(url);
    const buffer = Buffer.from(await contents.arrayBuffer());

    return await detectFromRaw(buffer);
};
