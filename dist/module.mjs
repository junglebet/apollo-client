import { createJiti } from "../node_modules/.pnpm/jiti@2.4.2/node_modules/jiti/lib/jiti.mjs";

const jiti = createJiti(import.meta.url, {
  "interopDefault": true,
  "alias": {
    "@junglebet/apollo-client": "E:/Tasks/JB/apollo-client"
  },
  "transformOptions": {
    "babel": {
      "plugins": []
    }
  }
})

/** @type {import("E:/Tasks/JB/apollo-client/src/module.js")} */
const _module = await jiti.import("E:/Tasks/JB/apollo-client/src/module.ts");

export default _module?.default ?? _module;
export const defineApolloClient = _module.defineApolloClient;