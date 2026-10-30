const mongoose = require("mongoose");

const itemPedidoSchema = new mongoose.Schema(
  {
    produtoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    titulo: {
      type: String,
      required: true,
    },
    preco: {
      type: Number,
      required: true,
      min: 0,
    },
    quantidade: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema(
  {
    usuario: {
      id: { type: String, required: true, index: true },
      nome: { type: String, required: true },
      email: { type: String, required: true },
    },
    itens: {
      type: [itemPedidoSchema],
      required: true,
      validate: {
        validator: (itens) => itens.length > 0,
        message: "O pedido precisa ter pelo menos um produto.",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    entrega: {
      cep: { type: String, required: true },
      endereco: { type: String, required: true },
      numero: { type: String, required: true },
      complemento: { type: String, default: "" },
      bairro: { type: String, required: true },
      cidade: { type: String, required: true },
      estado: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["Recebido"],
      default: "Recebido",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pedido", pedidoSchema);
