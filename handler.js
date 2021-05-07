'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

var sqs = new AWS.SQS({ region: process.env.REGION });
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

module.exports.hacerPedido = (event, context, callback) => {

  const orderId = uuidv4();

  const params = {
		MessageBody: JSON.stringify({ orderId: orderId }),
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

module.exports.prepararPedido = (event, context, callback) => {

  console.log("PrepararPedido fue llamada");
  console.log(event);

  callback();

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