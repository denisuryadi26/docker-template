'use strict';

const moment = require('moment');
const path = require('path');
const fs = require('fs');
const helper = require('./helper');

class Socket{

    constructor(socket){
        this.io = socket;
    }

    socketEvents(){
        this.io.on('connection', (socket) => {
            // console.log('connect');

            /**
            * get the order unprocess list
            */
            socket.on('unprocessOrderList', async () => {
                const result = await helper.getUnprocessOrderList();
                this.io.to(socket.id).emit('unprocessOrderListRes', {
                    userConnected: false,
                    unprocessOrderList: result.unprocessOrderList
                });

                socket.broadcast.emit('unprocessOrderListRes', {
                    userConnected: true,
                    // userId: userId,
                    socket_id: socket.id
                });
            });

             /**
            * get the user's Chat list
            */
            socket.on('orderList', async () => {
                const result = await helper.getOrderList();
                this.io.to(socket.id).emit('orderListRes', {
                    userConnected: false,
                    orderList: result.orderList
                });

                socket.broadcast.emit('orderListRes', {
                    userConnected: true,
                    socket_id: socket.id
                });
            });

            /**
            * get the user's Chat list
            */
            socket.on('chatList', async (userId) => {
                const result = await helper.getChatList(userId);
                this.io.to(socket.id).emit('chatListRes', {
                    userConnected: false,
                    chatList: result.chatlist
                });

                socket.broadcast.emit('chatListRes', {
                    userConnected: true,
                    socket_id: socket.id
                });
            });
            /**
            * get the get messages
            */
            socket.on('getMessages', async (data) => {
                const result = await helper.getMessages(data.fromUserId, data.toUserId);
				if (result === null) {
                    this.io.to(socket.id).emit('getMessagesResponse', {result:[],toUserId:data.toUserId});
				}else{
                    this.io.to(socket.id).emit('getMessagesResponse', {result:result,toUserId:data.toUserId});
				}
            });


            /**
            * create new order
            */
            socket.on('addOrder', async (response) => {
                // response.date = new moment().format("Y-MM-D");
                // response.time = new moment().format("hh:mm A");
                this.insertOrder(response, socket);
                socket.to(response.toSocketId).emit('addOrderResponse', response);
            });

            /**
            * send the messages to the user
            */
            socket.on('addMessage', async (response) => {
                response.date = new moment().format("Y-MM-D");
                response.time = new moment().format("hh:mm A");
                this.insertMessage(response, socket);
                socket.to(response.toSocketId).emit('addMessageResponse', response);
            });

            socket.on('typing', function (data) {
                socket.to(data.socket_id).emit('typing', {typing:data.typing, to_socket_id:socket.id});
            });

            /*socket.on('connection', async () => {
                console.log('aaa');
                let userId =socket.request._query['id'].trim();
                const isLoggedIn = await helper.loginUser(userId, socket.id);
                socket.broadcast.emit('chatListRes', {
                    userConnected: true,
                    socket_id: socket.id,
                    user_id : userId,
                });
                // console.log('a');
              // const isLoggedOut = await helper.logoutUser(socket.id);
              //   socket.broadcast.emit('chatListRes', {
              //       userDisconnected: true,
              //       socket_id: socket.id
              //   });
            });*/


            

            socket.on('disconnect', async () => {
              const isLoggedOut = await helper.logoutUser(socket.id);
                socket.broadcast.emit('chatListRes', {
                    userDisconnected: true,
                    socket_id: socket.id
                });
        	});
        });
    }

    async insertMessage(data, socket){
        const sqlResult = await helper.insertMessages({
            type: data.type,
            fileFormat: data.fileFormat,
            filePath: data.filePath,
            fromUserId: data.fromUserId,
            toUserId: data.toUserId,
            message: data.message,
            date: data.date,
            time: data.time,
            ip: socket.request.connection.remoteAddress
        });
    }

    async insertOrder(data, socket){
        // console.log(`Here is a test v4 uuid: ${uuid.v4()}`);
        const sqlResult = await helper.insertOrder({
            id: '019856b4-33eb-4d6d-82da-5552cdd6b33a',
            order_code: data.order_code,
            user_detail_id: '26c71eb3-b538-4281-aa70-a21262235166'
            
        });
    }

    socketConfig(){
        this.io.use( async (socket, next) => {
            let userId =socket.request._query['id'].trim();
            let userSocketId =socket.id;
            // console.log(userSocketId);
            const response = await helper.addSocketId(userId, userSocketId);
            if(response &&  response !== null){
                next();
            }else{
                console.error(`Socket connection failed, for  user Id ${userId}.`);
            }
        });
        this.socketEvents();
    }
}
module.exports = Socket;
