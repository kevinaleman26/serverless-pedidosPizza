'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

var sqs = new AWS.SQS({region: process.env.REGION});
const QUEUE_URL = process.env.PENDING_ORDER_QUEUE;

module.exports.hacerPedido = async (event) => {

  const orderId = uuidv4();

  const params = {
    MessageBody: JSON.stringify({orderId : orderId}),
    QueueUrl: QUEUE_URL
  }

  sqs.sendMessage(params, function(err,data){
    if(err) {
      return sendResponse(500,`No hay pedido`, null)
    } else {
      return sendResponse(200,`El Pedido es: ${orderId}`, orderId)
    }
  });

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

function sendResponse(statusCode,message, orderId){
  
  return {
        statusCode,
        body: JSON.stringify({
          orderId,
          message: message
        })
      };
      
}