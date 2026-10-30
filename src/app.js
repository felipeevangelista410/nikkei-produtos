require("dotenv").config();

const express = require("express");
const cors = require("cors");
const conectarBanco = require("./config/database");
const app = express();
app.use(cors({ origin: "*" }));
// 2mb: a imagem do produto pode vir como texto (data URL) já reduzida pelo site.
app.use(express.json({ limit: "2mb" }));
app.get("/", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "API de produtos funcionando",
    versao: "1.0.0",
  });
});

// Rotas
const produtoRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const iaRoutes = require("./routes/iaRoutes");
app.use("/api/produtos", produtoRoutes);
app.use("/api/compras", orderRoutes);
app.use("/api/ia", iaRoutes);

// Tratamento de rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: `Rota "${req.method} ${req.url}" não encontrada.`,
  });
});

// Inicializa o servidor
const PORT = process.env.PORT || 3001;

const iniciar = async () => {
  // Primeiro conecta ao banco, depois sobe o servidor
  await conectarBanco();

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
};

iniciar();

// Exporta o app para o Vercel poder usar como serverless function
module.exports = app;
