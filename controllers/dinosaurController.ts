import { Context } from "https://deno.land/x/oak/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.7.0/mod.ts";
import * as yup from "https://cdn.pika.dev/yup@^0.29.1";
import { config } from "https://deno.land/x/dotenv/mod.ts";
const { DB_URI, DB } = config()

const dinosaurSchema = yup.object().shape({
  name: yup.string().trim().min(2).required(),
  image: yup.string().trim().url().required()
})

const client = new MongoClient();
client.connectWithUri(DB_URI);
const db = client.database(DB);

async function index({ response }: { response: any }) {
  response.body = "Hello in the deno world! 🐱‍🐉"
}
 
async function getDinosaurs({ response }: { response: Context["response"] }) {
  response.body = await db.collection("dinosaurs").find({ name: { $ne: null }})
}

async function getDinosaur({ response, params }: { response: Context["response"], params: { oid: string }}) {
  if (params && params.oid)
    response.body = await db.collection("dinosaurs").findOne({ _id: { "$oid": params.oid } })
}

async function postDinosaur({ request, response }: { request: Context["request"], response: Context["response"] }) {
  if (!request.hasBody) {
      response.status = 400
      response.body = {
        message: "wrong/incomplete request body"
      }
    } else {
      const dinosaurData = (await request.body()).value
      try {
        await dinosaurSchema.validate(dinosaurData)
        const dinosaur = await db.collection("dinosaurs").insertOne(dinosaurData)
        response.status = 200
        response.body = dinosaur
      } catch (error) {
        response.status = 400
        response.body = { message: error.message }
      }
    }
}

async function patchDinosaur({ request, response, params }: { request: Context["request"], response: Context["response"], params: { oid: string } }) {
  if (params && params.oid && request.hasBody) {
    const dinosaurNewData = (await request.body()).value
    const dinosaur = await db.collection("dinosaurs").findOne({ _id: { "$oid": params.oid } })
    // compare and modify
    let modificationCounter = 0
    Object.keys(dinosaur).forEach((key) => {
      if (dinosaurNewData.hasOwnProperty(key)) {
        if(dinosaur[key] !== dinosaurNewData[key]) {
          dinosaur[key] = dinosaurNewData[key]
          modificationCounter++
        }
      }
    })
    if (modificationCounter) {
      await db.collection("dinosaurs").updateOne({ _id: { "$oid": params.oid } }, dinosaur)
      response.status = 200
      response.body = {
        message: "Modified.",
        data: dinosaur
      }
    } else {
      response.status = 200
      response.body = {
        message: "Nothing to modify.",
        data: dinosaur
      }
    }
  } else {
    response.status = 400
    response.body = {
      message: "Wrong oid or no body.",
      patched: 0
    }
  }
}

async function deleteDinosaur({ response, params }: { response: Context["response"], params: { oid: string } }) {
  if (params && params.oid) {
    const delCount = await db.collection("dinosaurs").deleteOne({ _id: { "$oid": params.oid } })
    if (!delCount) {
      response.body = {
        status: 400,
        message: "Wrong oid or no oid.",
        count: delCount
      }
    } else {
      response.body = {
        status: 200,
        message: "Deleted.",
        count: delCount
      }
    }
  } else {
    response.body = {
      status: 400,
      message: "Wrong oid or no oid.",
      count: 0
    }
  }
}

export { index, getDinosaurs, getDinosaur, postDinosaur, patchDinosaur, deleteDinosaur }