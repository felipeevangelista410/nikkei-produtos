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
    // Só guardamos a forma escolhida; dados de cartão nunca chegam ao servidor.
    pagamento: {
      metodo: { type: String, enum: ["pix", "cartao", "boleto"], default: "pix" },
      parcelas: { type: Number, min: 1, max: 12, default: 1 },
    },
    status: {
      type: String,
      enum: ["Recebido", "Aguardando pagamento"],
      default: "Recebido",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pedido", pedidoSchema);
