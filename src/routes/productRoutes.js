const express = require("express");
const {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
} = require("../controllers/productController");
const { autenticarToken, somenteAdministrador } = require("../middleware/auth");

const router = express.Router();

// Leitura é pública (vitrine do site). Escrita exige login de administrador.
router.get("/", listar);
router.get("/:id", buscarPorId);
router.post("/", autenticarToken, somenteAdministrador, criar);
router.patch("/:id", autenticarToken, somenteAdministrador, atualizar);
router.delete("/:id", autenticarToken, somenteAdministrador, remover);

module.exports = router;
