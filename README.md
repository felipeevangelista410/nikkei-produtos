# API de Produtos

API REST para cadastrar, consultar, atualizar e remover produtos em um banco MongoDB.
Cada produto possui título, descrição, imagem (URL ou caminho), preço e quantidade.

---

## Sumário

1. [Tecnologias utilizadas](#tecnologias-utilizadas)
2. [Estrutura de pastas](#estrutura-de-pastas)
3. [Pré-requisitos](#pré-requisitos)
4. [Configuração do ambiente](#configuração-do-ambiente)
5. [Como rodar localmente](#como-rodar-localmente)
6. [Rotas da API](#rotas-da-api)
7. [Como fazer Deploy na Vercel](#como-fazer-deploy-na-vercel)
8. [Conceitos abordados](#conceitos-abordados)

---

## Tecnologias utilizadas

| Tecnologia   | Para que serve                              |
|--------------|---------------------------------------------|
| Node.js      | Ambiente de execução do JavaScript          |
| Express      | Framework para criar o servidor e as rotas  |
| MongoDB Atlas| Banco de dados na nuvem (NoSQL)             |
| Mongoose     | Biblioteca para modelar os dados do MongoDB |
| dotenv       | Leitura de variáveis de ambiente            |
| CORS         | Permite requisições do frontend             |

---

## Estrutura de pastas

```
vite-project/
├── src/
│   ├── config/
│   │   └── database.js       # Conexão com o MongoDB Atlas
│   ├── controllers/
│   │   └── productController.js # Lógica dos endpoints de produto
│   ├── models/
│   │   └── Product.js        # Schema/modelo do produto
│   ├── routes/
│   │   └── productRoutes.js  # Rotas de produto
│   └── app.js                # Ponto de entrada da aplicação
├── package.json
├── vercel.json               # Configuração para deploy na Vercel
├── .gitignore                # Ignora credenciais e dependências instaladas
└── README.md
```

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18 ou superior
- Conta no [MongoDB Atlas](https://cloud.mongodb.com/) (gratuita)

---

## Configuração do ambiente

### 1. Entre na pasta do projeto

```bash
cd vite-project
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
MONGODB_URI=mongodb+srv://...    # URL do MongoDB Atlas
PORT=3001
JWT_SECRET=use-o-mesmo-segredo-configurado-no-contMB-com-pelo-menos-32-caracteres
```

### 4. Configurando o MongoDB Atlas

1. Acesse [cloud.mongodb.com](https://cloud.mongodb.com/) e crie uma conta
2. Crie um **Cluster gratuito** (M0)
3. Em **Database Access**: crie um usuário com senha
4. Em **Network Access**: adicione `0.0.0.0/0` (permite acesso de qualquer IP)
5. Em **Connect → Drivers**: copie a string de conexão e cole no `.env`

## Como rodar localmente

```bash
npm run dev
```

O servidor estará disponível em: `http://localhost:3001`

Teste se está funcionando acessando `http://localhost:3001` no navegador.

---

## Rotas da API

Base URL local do catálogo: `http://localhost:3001/api/produtos`.
As rotas de compras usam `http://localhost:3001/api/compras`.

| Método | Rota do catálogo | Descrição |
|---|---|---|
| `GET` | `/` | Lista os produtos |
| `GET` | `/:id` | Busca um produto pelo ID |
| `POST` | `/` | Cadastra um produto |
| `PATCH` | `/:id` | Atualiza um ou mais campos |
| `DELETE` | `/:id` | Exclui um produto |

| Método | Rota de compras | Descrição |
|---|---|---|
| `POST` | `/` | Confirma compra e baixa estoque (JWT) |
| `GET` | `/minhas` | Lista compras do usuário autenticado (JWT) |
| `GET` | `/` | Lista todas as compras (JWT de administrador) |

Exemplo de cadastro:

```json
{
  "titulo": "Fone Bluetooth",
  "descricao": "Fone sem fio com estojo de carregamento.",
  "imagem": "https://exemplo.com/fone.jpg",
  "preco": 149.90,
  "quantidade": 25
}
```

Os cinco campos são obrigatórios na criação. O preço deve ser um número não negativo e a quantidade deve ser um inteiro não negativo. A imagem é armazenada como texto (URL ou caminho), não há upload de arquivo nesta API.

O checkout recebe os IDs e quantidades de produtos e os campos de entrega
`cep`, `endereco`, `numero`, `complemento`, `bairro`, `cidade` e `estado`.
Preço e total são calculados no servidor; o estoque e a criação do pedido são
confirmados na mesma transação MongoDB. Configure aqui o mesmo `JWT_SECRET` do
`contMB` (mínimo 32 caracteres). O banco deve suportar transações, como o
MongoDB Atlas ou um replica set. Tokens emitidos antes de incluírem o papel e
os dados de conta devem ser renovados com novo login.

---

## Como fazer Deploy na Vercel

### 1. Instale a CLI da Vercel (opcional, mas facilita)

```bash
npm install -g vercel
```

### 2. Faça login

```bash
vercel login
```

### 3. Publique o projeto

Dentro da pasta `vite-project`:

```bash
vercel
```

Siga as instruções no terminal. Na primeira vez, ele vai criar o projeto.

### 4. Configure as variáveis de ambiente na Vercel

No painel da Vercel ([vercel.com/dashboard](https://vercel.com/dashboard)):

1. Acesse seu projeto → **Settings** → **Environment Variables**
2. Adicione `MONGODB_URI` e, se necessário, `PORT`
3. Clique em **Save**
4. Vá em **Deployments** → clique nos três pontos → **Redeploy**

> ⚠️ **Importante:** Nunca suba o arquivo `.env` para o GitHub. Ele já está no `.gitignore`.

---

## Modelo de dados

Cada documento da coleção `produtos` contém `titulo`, `descricao`, `imagem`, `preco` e `quantidade`, além de `createdAt` e `updatedAt` gerados automaticamente pelo Mongoose.
