const mongoose = require("mongoose");
const Produto = require("../models/Product");
const Pedido = require("../models/Order");

const camposEntrega = [
  "cep",
  "endereco",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "estado",
];

function dadosEntrega(dados = {}) {
  if (
    camposEntrega.some(
      (campo) =>
        campo !== "complemento" &&
        (typeof dados[campo] !== "string" || !dados[campo].trim())
    ) ||
    (dados.complemento !== undefined && typeof dados.complemento !== "string")
  ) {
    return null;
  }

  const entrega = Object.fromEntries(
    camposEntrega.map((campo) => [campo, (dados[campo] || "").trim()])
  );
  if (
    !/^\d{5}-?\d{3}$/.test(entrega.cep) ||
    !/^[a-z]{2}$/i.test(entrega.estado) ||
    entrega.endereco.length > 160 ||
    entrega.numero.length > 20 ||
    entrega.complemento.length > 80 ||
    entrega.bairro.length > 80 ||
    entrega.cidade.length > 80
  ) {
    return null;
  }
  const cep = entrega.cep.replace(/\D/g, "");
  entrega.cep = `${cep.slice(0, 5)}-${cep.slice(5)}`;
  entrega.estado = entrega.estado.toUpperCase();
  return entrega;
}

async function finalizarCompra(req, res) {
  const { itens, entrega: entregaInformada } = req.body || {};
  const entrega = dadosEntrega(entregaInformada);

  if (!entrega) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "Informe endereço, número, bairro, cidade, estado e CEP válido para entrega.",
    });
  }
  if (
    !Array.isArray(itens) ||
    itens.length === 0 ||
    itens.length > 100 ||
    itens.some(
      (item) =>
        !item ||
        typeof item.produtoId !== "string" ||
        !mongoose.isValidObjectId(item.produtoId) ||
        !Number.isInteger(item.quantidade) ||
        item.quantidade < 1
    )
  ) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "A compra precisa ter até 100 produtos, com IDs válidos e quantidades positivas.",
    });
  }

  if (new Set(itens.map((item) => item.produtoId)).size !== itens.length) {
    return res.status(400).json({
      sucesso: false,
      mensagem: "A lista de compra contém produtos duplicados. Atualize o carrinho e tente novamente.",
    });
  }
  if (!req.conta.nome || !req.conta.email) {
    return res.status(401).json({
      sucesso: false,
      mensagem: "Entre novamente para atualizar seus dados de conta antes de comprar.",
    });
  }

  let sessao;
  try {
    sessao = await mongoose.startSession();
    let pedido;
    await sessao.withTransaction(async () => {
      const itensPedido = [];
      let totalCentavos = 0;

      for (const item of itens) {
        const produto = await Produto.findOneAndUpdate(
          {
            _id: item.produtoId,
            quantidade: { $gte: item.quantidade },
          },
          { $inc: { quantidade: -item.quantidade } },
          { new: true, session: sessao }
        );

        if (!produto) {
          const existente = await Produto.findById(item.produtoId).session(sessao);
          const erro = new Error(
            existente
              ? `Estoque insuficiente para "${existente.titulo}". Atualize a lista antes de comprar.`
              : "Um produto da lista não está mais disponível."
          );
          erro.statusCode = existente ? 409 : 404;
          throw erro;
        }

        const preco = Number(produto.preco);
        const precoCentavos = Math.round(preco * 100);
        itensPedido.push({
          produtoId: produto._id,
          titulo: produto.titulo,
          preco: precoCentavos / 100,
          quantidade: item.quantidade,
        });
        totalCentavos += precoCentavos * item.quantidade;
      }

      const [criado] = await Pedido.create(
        [
          {
            usuario: req.conta,
            itens: itensPedido,
            total: totalCentavos / 100,
            entrega,
          },
        ],
        { session: sessao }
      );
      pedido = criado;
    });

    return res.status(201).json({
      sucesso: true,
      mensagem: "Compra confirmada. O estoque foi atualizado.",
      pedido,
    });
  } catch (erro) {
    if (erro.statusCode) {
      return res.status(erro.statusCode).json({ sucesso: false, mensagem: erro.message });
    }
    if (erro.name === "ValidationError" || erro.name === "CastError") {
      return res.status(400).json({ sucesso: false, mensagem: erro.message });
    }
    console.error("Erro ao finalizar compra:", erro.message);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Não foi possível concluir a compra. O estoque não foi alterado.",
    });
  } finally {
    if (sessao) await sessao.endSession();
  }
}

async function listarMinhasCompras(req, res) {
  try {
    const pedidos = await Pedido.find({ "usuario.id": req.conta.id }).sort({ createdAt: -1 });
    return res.status(200).json({ sucesso: true, pedidos });
  } catch (erro) {
    console.error("Erro ao consultar compras do usuário:", erro.message);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Não foi possível carregar suas compras.",
    });
  }
}

async function listarCompras(req, res) {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    return res.status(200).json({ sucesso: true, total: pedidos.length, pedidos });
  } catch (erro) {
    console.error("Erro ao consultar compras:", erro.message);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Não foi possível carregar as compras.",
    });
  }
}

module.exports = { finalizarCompra, listarMinhasCompras, listarCompras };
