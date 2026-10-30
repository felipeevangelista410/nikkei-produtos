const express = require("express");
const { mensagem } = require("../controllers/iaController");

const router = express.Router();

// Pública: qualquer visitante pode conversar com a Nini (há limite por visitante).
router.post("/mensagem", mensagem);

module.exports = router;
