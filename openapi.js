require('dotenv').config({ path: '.env.local' });
const Joi = require('joi');
const { transpile } = require('postman2openapi');
const { writeFile } = require('fs/promises');

async function main() {
  /**
   * @typedef {Object} PostmanEnv
   * @property {string} POSTMAN_API_KEY
   * @property {string} POSTMAN_COLLECTION_ID
   */

  /** @type {Joi.ObjectSchema<PostmanEnv>} */
  const postmanEnvSchema = Joi.object({
    POSTMAN_API_KEY: Joi.string().required(),
    POSTMAN_COLLECTION_ID: Joi.string().required()
  })
    .options({ stripUnknown: true })
    .required();

  const { value: postmanEnv, error } = postmanEnvSchema.validate(process.env);

  if (error) {
    throw new Error(`Invalid environment variables: ${error.message}`);
  }

  const postmanCollectionResponse = await fetch(
    `https://api.getpostman.com/collections/${postmanEnv.POSTMAN_COLLECTION_ID}`,
    {
      headers: {
        'x-api-key': postmanEnv.POSTMAN_API_KEY
      }
    }
  );

  /**
   * @typedef {{
   *   collection: {
   *     info: Record<string, unknown>;
   *     item: Record<string, unknown>[]; 
   *   };
   * }} PostmanCollection
   */

  /** @type {PostmanCollection} */
  const { collection } = await postmanCollectionResponse.json();

  const openapi = transpile(collection);

  openapi.servers = [
    {
      url: 'http://localhost:2000',
      description: 'Local development server'
    }
  ];

  const stringifiedOpenapi = JSON.stringify(openapi, null, 2);

  await writeFile('./swagger.json', stringifiedOpenapi);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
