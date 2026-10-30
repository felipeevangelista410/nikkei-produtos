const express = require("express");
const {
  finalizarCompra,
  listarMinhasCompras,
  listarCompras,
} = require("../controllers/orderController");
const { autenticarToken, somenteAdministrador } = require("../middleware/auth");

const router = express.Router();

router.post("/", autenticarToken, finalizarCompra);
router.get("/minhas", autenticarToken, listarMinhasCompras);
router.get("/", autenticarToken, somenteAdministrador, listarCompras);

module.exports = router;
