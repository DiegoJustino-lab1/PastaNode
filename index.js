const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Conexão com o MongoDB
mongoose.connect('mongodb+srv://AC2PROJECT:AC2PROJECT@ac2project.miulncj.mongodb.net/?retryWrites=true&w=majority&appName=AC2PROJECT')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB', err));

// Modelos
const Order = mongoose.model('Order', new mongoose.Schema({
  orderId: String,
  value: Number,
  creationDate: Date,
  items: [{ productId: Number, quantity: Number, price: Number }]
}));

app.use(bodyParser.json());

// Criar um novo pedido
app.post('/order', (req, res) => {
  console.log('Dados recebidos:', req.body);

  const { numeroPedido, valorTotal, dataCriacao, items } = req.body;
  const newOrder = {
    orderId: numeroPedido,
    value: valorTotal,
    creationDate: new Date(dataCriacao).toISOString(),
    items: items.map(item => ({
      productId: parseInt(item.idItem),
      quantity: item.quantidadeItem,
      price: item.valorItem
    }))
  };

  console.log('Dados transformados:', newOrder);

  const order = new Order(newOrder);
  order.save()
    .then(() => {
      console.log('Pedido salvo com sucesso');
      res.status(201).send('Pedido criado com sucesso.');
    })
    .catch(err => {
      console.error('Erro ao salvar pedido:', err);
      res.status(500).send(err);
    });
});

// Obter um pedido pelo ID
app.get('/order/:orderId', (req, res) => {
  Order.findOne({ orderId: req.params.orderId })
    .then(order => {
      if (!order) {
        return res.status(404).send('Pedido não encontrado');
      }
      res.send(order);
    })
    .catch(err => res.status(500).send(err));
});

// Listar todos os pedidos
app.get('/order/list', (req, res) => {
  Order.find()
    .then(orders => res.send(orders))
    .catch(err => res.status(500).send(err));
});

// Atualizar um pedido pelo número do pedido
app.put('/order/:orderId', (req, res) => {
  Order.findOneAndUpdate({ orderId: req.params.orderId }, req.body, { new: true })
    .then(order => {
      if (!order) {
        return res.status(404).send('Pedido não encontrado');
      }
      res.send(order);
    })
    .catch(err => res.status(500).send(err));
});

// Deletar um pedido pelo número do pedido
app.delete('/order/:orderId', (req, res) => {
  Order.findOneAndDelete({ orderId: req.params.orderId })
    .then(order => {
      if (!order) {
        return res.status(404).send('Pedido não encontrado');
      }
      res.send('Pedido deletado com sucesso');
    })
    .catch(err => res.status(500).send(err));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
