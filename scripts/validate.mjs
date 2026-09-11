import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const errors = [];

async function readJson(relativePath) {
  try {
    return JSON.parse(await readFile(new URL(relativePath, root), "utf8"));
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return undefined;
  }
}

const [document, schema] = await Promise.all([
  readJson("tweets.json"),
  readJson("tweets.schema.json")
]);

if (document !== undefined && schema !== undefined) {
  if (schema === null || typeof schema !== "object" || Array.isArray(schema)) {
    errors.push("tweets.schema.json: root must be an object");
  } else if (document === null || typeof document !== "object" || Array.isArray(document)) {
    errors.push("tweets.json: root must be an object");
  } else {
    const required = schema.required ?? [];
    const allowed = new Set(Object.keys(schema.properties ?? {}));

    for (const key of required) {
      if (!Object.hasOwn(document, key)) {
        errors.push(`tweets.json: missing required property ${key}`);
      }
    }

    for (const key of Object.keys(document)) {
      if (!allowed.has(key)) {
        errors.push(`tweets.json: unexpected property ${key}`);
      }
    }

    const label = document.triggerPhrase;
    if (typeof label !== "string" || !/\S/u.test(label)) {
      errors.push("tweets.json: triggerPhrase must be a non-empty string");
    }

    const tweets = document.tweets;
    if (!Array.isArray(tweets)) {
      errors.push("tweets.json: tweets must be an array");
    } else {
      const rule = schema.properties.tweets;
      if (tweets.length < rule.minItems || tweets.length > rule.maxItems) {
        errors.push(`tweets.json: tweets must contain exactly ${rule.minItems} templates`);
      }

      const seen = new Set();
      tweets.forEach((tweet, index) => {
        if (typeof tweet !== "string" || !/\S/u.test(tweet)) {
          errors.push(`tweets.json: tweets[${index}] must be a non-empty string`);
          return;
        }

        const length = [...tweet].length;
        if (length > rule.items.maxLength) {
          errors.push(`tweets.json: tweets[${index}] is ${length} characters (maximum ${rule.items.maxLength})`);
        }

        if (seen.has(tweet)) {
          errors.push(`tweets.json: tweets[${index}] duplicates an earlier template`);
        }
        seen.add(tweet);
      });
    }
  }
}

if (errors.length > 0) {
  console.error("Template validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Validated tweets.json: 10 unique templates match tweets.schema.json.");
}
