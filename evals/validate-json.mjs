import fs from "node:fs";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";

const [schemaPath, documentPath] = process.argv.slice(2);
if (!schemaPath || !documentPath) {
  console.error("Usage: node validate-json.mjs <schema> <document>");
  process.exit(1);
}

try {
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const document = JSON.parse(fs.readFileSync(documentPath, "utf8"));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  if (!validate(document)) {
    for (const error of validate.errors ?? []) {
      console.error(`${error.instancePath || "/"} ${error.message}`);
    }
    process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
