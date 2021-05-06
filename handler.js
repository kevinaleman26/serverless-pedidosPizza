'use strict';

const AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1');

var sqs = new AWS.SQS({region: process.env.REGION});
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

module.exports.hacerPedido = async (event) => {

  console.log('HacerPedido fue llamada');
  const orderId = uuidv1();

  const params = {
    MessageBody: JSON.stringify({orderId : orderId}),
    QueueUrl: QUEUE_URL
  }

  let response = {}

  sqs.sendMessage(params, function(err,data){
    if(err) {
      response = {
        ststusCode = 500,
        body: JSON.stringify({
          message: `No hay pedido`
        })
      };
    } else {
      response = {
        ststusCode = 200,
        body: JSON.stringify({
          orderId,
          message: `El Pedido es: ${orderId}`
        })
      };
    }
  });

  return response;

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
