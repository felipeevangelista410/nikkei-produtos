const mongoose = require("mongoose");

const produtoSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, "O título é obrigatório."],
      trim: true,
    },
    descricao: {
      type: String,
      required: [true, "A descrição é obrigatória."],
      trim: true,
    },
    imagem: {
      type: String,
      required: [true, "A imagem é obrigatória."],
      trim: true,
    },
    // Opcionais: usados pela vitrine do site (linha de categoria e preço "de").
    categoria: {
      type: String,
      trim: true,
      default: "",
    },
    precoAntigo: {
      type: Number,
      min: [0, "O preço antigo não pode ser negativo."],
      default: 0,
    },
    preco: {
      type: Number,
      required: [true, "O preço é obrigatório."],
      min: [0, "O preço não pode ser negativo."],
    },
    quantidade: {
      type: Number,
      required: [true, "A quantidade é obrigatória."],
      min: [0, "A quantidade não pode ser negativa."],
      validate: {
        validator: Number.isInteger,
        message: "A quantidade deve ser um número inteiro.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Produto", produtoSchema);