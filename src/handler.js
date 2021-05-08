'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

var sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;
const orderManager = require('./dynamoManager')

/*
  hacerPedido
*/

module.exports.hacerPedido = (event, context, callback) => {

  const orderId = uuidv4();
  
  const request = JSON.parse(event.body);
  const {name,address,pizzas} = request;

  const pedido = {
    orderId: orderId ,
    name: name,
    address: address,
    pizzas: pizzas
  }

  const params = {
		MessageBody: JSON.stringify(pedido),
		QueueUrl: QUEUE_URL
	};
	
  sqs.sendMessage(params, function(err,data){
    if(err) {
      sendResponse(500,err, callback)
    } else {
      const message = {
				orderId: orderId,
				messageId: data.MessageId
			};
      sendResponse(200,message, callback)
    }
  });
};

/*
  prepararPedido
*/

module.exports.prepararPedido = (event, context, callback) => {

  console.log("PrepararPedido fue llamada");
  const order = JSON.parse(event.Records[0].body);
  orderManager.saveCompletedOrder(order)
  .then(resp => callback())
  .catch(err => callback(err));
}

/*
  enviarPedido
*/

module.exports.enviarPedido = (event, context, callback) => {
  console.log('LLegaste a enviarPedido');

  const record = event.Records[0];
  if(record.eventName === 'INSERT'){
    console.log('DeliverOrder');
    const orderId = record.dynamodb.Keys.orderId.S;

    orderManager.deliverOrder(orderId)
    .then(resp => {
      console.log(resp);
      callback();
    })
    .then(error => {
      callback(error);
    })

  }

  callback();
}

/*
  listaPedidos
*/

module.exports.listaPedidos = (event, context, callback) => {

  const orderId = event.pathParameters && event.pathParameters.orderId;
	if (orderId !== null) {
		orderMetadataManager
			.getOrder(orderId)
			.then(order => {
				sendResponse(200, `El estado de la orden: ${orderId} es ${order.delivery_status}`, callback);
			})
			.catch(error => {
				sendResponse(500, 'Hubo un error al procesar el pedido', callback);
			});
	} else {
		sendResponse(400, 'Falta el orderId', callback);
	}
}

/*
  Funciones
*/

function sendResponse(statusCode, message, callback) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
	};
	callback(null, response);
}