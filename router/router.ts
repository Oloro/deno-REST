import { Router } from "https://deno.land/x/oak/mod.ts"
import * as Dinosaur from "../controllers/dinosaurController.ts"

const router = new Router()
router
  .get("index", "/", Dinosaur.index)
  .get("getDinosaurs", "/dinosaurs", Dinosaur.getDinosaurs)
  .get("getDinosaurByOid", "/dinosaurs/:oid", Dinosaur.getDinosaur)
  .post("postDinosaur", "/dinosaurs", Dinosaur.postDinosaur)
  .patch("patchDinosaurByOid", "/dinosaurs/:oid", Dinosaur.patchDinosaur)
  .delete("deleteDinosaur", "/dinosaurs/:oid", Dinosaur.deleteDinosaur)

  export { router };
