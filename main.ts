import { Application } from "https://deno.land/x/oak/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { router } from "./router/router.ts" 
const { HOST, PORT } = config()

const app = new Application()
app.use(router.routes())
app.use(router.allowedMethods())
console.log(`Listening on ${HOST}:${PORT}...`)
await app.listen({ port: +PORT, hostname: HOST });

