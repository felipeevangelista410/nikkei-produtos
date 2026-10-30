const Produto = require("../models/Product");
const { processarMensagem, chamarGroq } = require("../services/iaService");

// Limite simples por visitante (em memória): protege a cota da chave da Groq.
// Na Vercel cada instância tem a sua contagem, então é uma proteção "boa o
// bastante" para um site pequeno, não um limite exato.
const JANELA_MS = 10 * 60 * 1000;
const MAX_PEDIDOS = 25;
const visitas = new Map();

function dentroDoLimite(ip) {
  const agora = Date.now();
  const lista = (visitas.get(ip) || []).filter((t) => agora - t < JANELA_MS);
  if (lista.length >= MAX_PEDIDOS) {
    visitas.set(ip, lista);
    return false;
  }
  lista.push(agora);
  visitas.set(ip, lista);
  if (visitas.size > 5000) visitas.clear(); // evita crescer sem fim
  return true;
}

const mensagem = async (req, res) => {
  try {
    const ip = String(req.headers["x-forwarded-for"] || req.ip || "").split(",")[0].trim();
    if (!dentroDoLimite(ip)) {
      return res.status(429).json({
        sucesso: false,
        mensagem: "Você enviou muitas mensagens em pouco tempo. Aguarde alguns minutos e tente de novo.",
      });
    }

    const resultado = await processarMensagem({
      mensagens: req.body?.mensagens,
      Produto,
      chamarLLM: chamarGroq,
    });
    return res.status(200).json({ sucesso: true, ...resultado });
  } catch (erro) {
    const status = erro.status || 500;
    if (!erro.status) console.error("Erro na IA:", erro.message);
    return res.status(status).json({
      sucesso: false,
      mensagem: erro.status ? erro.message : "Não foi possível falar com a assistente agora.",
    });
  }
};

module.exports = { mensagem };
