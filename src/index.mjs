import process from 'node:process';
import Server from 'fastify';
import { detectFromUrl, detectFromRaw } from '#src/detector.mjs';
import {
    NSFW_DETECTOR_PORT,
    NSFW_DETECTOR_HOST,
    NSFW_DETECTOR_ALLOW_URL_UPLOADS,
    NSFW_DETECTOR_ALLOWED_SOURCES,
    NSFW_DETECTOR_POST_SIZE_LIMIT,
} from '#src/config.mjs';

const fastify = Server({
    logger: { level: 'warn' },
    bodyLimit: NSFW_DETECTOR_POST_SIZE_LIMIT,
});

fastify.addSchema({
    $id: 'ClassifierResponse',
    type: 'object',
    properties: {
        neutral: { type: 'number' },
        porn: { type: 'number' },
        sexy: { type: 'number' },
        hentai: { type: 'number' },
        drawing: { type: 'number' },
    },
    additionalProperties: false,
    required: ['neutral', 'porn', 'sexy', 'hentai', 'drawing'],
});

fastify.addContentTypeParser('*', { parseAs:'buffer' }, function (request, payload, done) {
    return done(null, payload);
});

fastify.route({
    url: '/api/detect',
    method: ['GET'],
    schema: {
        querystring: {
            type: 'object',
            additionalProperties: false,
            properties: {
                url: {
                    type: 'string',
                    minLength: 4,
                },
            },
            required: ['url'],
        },
        response: {
            200: { $ref: 'ClassifierResponse#' },
        },
    },

    handler: async (request, reply) => {
        const imageUrl = request.query.url;

        if (!NSFW_DETECTOR_ALLOW_URL_UPLOADS) {
            return reply.send('URL uploads are not allowed', 400);
        }

        if (typeof NSFW_DETECTOR_ALLOWED_SOURCES === 'string') {
            if (!imageUrl.startsWith(NSFW_DETECTOR_ALLOWED_SOURCES)) {
                return reply.send('This URL source is not allowed', 400);
            }
        }

        const url = new URL(imageUrl);

        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Invalid URL', 400);
        }

        return reply.send(await detectFromUrl(imageUrl));
    },
});

fastify.route({
    url: '/api/detect',
    method: ['POST'],
    schema: {
        response: {
            200: { $ref: 'ClassifierResponse#' },
        },
    },
    handler: async (request, reply) => {
        return reply.send(await detectFromRaw(request.body));
    },
});

await fastify.ready();

fastify.listen({ port: NSFW_DETECTOR_PORT, host: NSFW_DETECTOR_HOST })
    .then(address => console.log(`server listening on ${address}`))
    .catch((error) => {
        fastify.log.error(error);
        process.exit(1);
    });
