const Produto = require("../models/Product");

const camposPermitidos = [
  "titulo",
  "descricao",
  "imagem",
  "preco",
  "quantidade",
  "categoria",
  "precoAntigo",
];

const selecionarCampos = (dados = {}) =>
  Object.fromEntries(
    camposPermitidos
      .filter((campo) => dados[campo] !== undefined)
      .map((campo) => [campo, dados[campo]])
  );

const responderErro = (res, erro) => {
  const erroDeValidacao =
    erro.name === "ValidationError" || erro.name === "CastError";

  return res.status(erroDeValidacao ? 400 : 500).json({
    sucesso: false,
    mensagem: erroDeValidacao ? erro.message : "Erro interno no servidor.",
  });
};

const listar = async (req, res) => {
  try {
    const produtos = await Produto.find().sort({ createdAt: -1 });

    return res.status(200).json({
      sucesso: true,
      total: produtos.length,
      produtos,
    });
  } catch (erro) {
    return responderErro(res, erro);
  }
};

const buscarPorId = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id);

    if (!produto) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Produto não encontrado.",
      });
    }

    return res.status(200).json({ sucesso: true, produto });
  } catch (erro) {
    return responderErro(res, erro);
  }
};

const criar = async (req, res) => {
  try {
    const produto = await Produto.create(selecionarCampos(req.body));

    return res.status(201).json({
      sucesso: true,
      mensagem: "Produto cadastrado com sucesso.",
      produto,
    });
  } catch (erro) {
    return responderErro(res, erro);
  }
};

const atualizar = async (req, res) => {
  try {
    const dados = selecionarCampos(req.body);

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Informe ao menos um campo válido para atualizar.",
      });
    }

    const produto = await Produto.findByIdAndUpdate(req.params.id, dados, {
      new: true,
      runValidators: true,
    });

    if (!produto) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Produto não encontrado.",
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Produto atualizado com sucesso.",
      produto,
    });
  } catch (erro) {
    return responderErro(res, erro);
  }
};

const remover = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndDelete(req.params.id);

    if (!produto) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Produto não encontrado.",
      });
    }

    return res.status(200).json({
      sucesso: true,
      mensagem: "Produto removido com sucesso.",
    });
  } catch (erro) {
    return responderErro(res, erro);
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };