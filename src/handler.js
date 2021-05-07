'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

var sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;
const orderManager = require('./orderMetadataManager')

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
  Funciones
*/

function sendResponse(statusCode, message, callback) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message)
	};
	callback(null, response);
}