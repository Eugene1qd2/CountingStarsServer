const webSocket = require('ws');
const UserController = require('./controllers/user.controller').UserController;
const userController = new UserController();



const serverPORT = process.env.port || 5000;


const webSocketServer = new webSocket.Server({
    port: serverPORT,
}, () => { console.log("WebSocket server started on port " + serverPORT) });

var currentNumber = 0;

webSocketServer.on('connection', function connection(webSocket) {
    webSocket.on('message', async function message(message) {
        message = JSON.parse(message);
        switch (message.event) {
            case 'message':
                //тут я проверяю правильное ли число пришло, решаю давать временную блокировку или нет, заношу данные в бд и обновляю статистику (асинхронно)
                if (tryGetNumber(message.message) != NaN) {
                    if (currentNumber + 1 === Number(message.message)) {
                        currentNumber = currentNumber + 1;
                        broadcastNewNumber({
                            event: 'updateNumber',
                            id: Date.now(),
                            username: message.username,
                            currentNumber: currentNumber,
                        });
                    }
                    else {
                        //тута даю временную блокировку
                    }
                }
                break;

            case 'connection':
                console.log('device connected ' + message.id);
                break;
            case 'login':

                //проверяю есть ли такой пользователь в бд
                //если есть, шлю ответ что ты вошел с данными пользователя (логин, id, цвет, ранг)
                //если нет возвращаю сообщение с отказом
                //у пользователя это всё ещё форма входа
                //после успешного подключения рассылаю бродкаст          

                var res = userController.getUserByLogin(message.username);
                if ((await res).rowCount != 0) {
                    webSocket.send(JSON.stringify({
                        event: 'loginSucced',
                        userId: res.userId,
                        userName: res.userName,
                        userColor: res.userColor,
                        userRank: res.userRank,
                        id: Date.now(),
                    }));
                    broadcastOnlineStats();
                }
                else {
                    webSocket.send(JSON.stringify({
                        event: 'loginFailed',
                        errorMessage: 'No such user or wrong data!',
                        id: Date.now(),
                    }));
                }
                break;

            case 'registration':
                //проверяю существует ли пользователь с таким логином или почтой
                //если нет заношу данные в базу данных и возвращаю успешно пройденную регистрацию
                //если есть, возвращаю пользователю сообщение об ошибке
                // await userController.createUser({
                //     login: message.username,
                //     password: message.password,
                //     email: message.email
                // });
                break;

            default:
                //возвращаю сообщение о некорректном запросе
                break;
        }
    });
    webSocket.on('close', function (reasonCode, description) {
        broadcastOnlineStats();
    });
})


function broadcastNewNumber(message) {
    webSocketServer.clients.forEach(client => {
        client.send(JSON.stringify(message));
    });
}

function tryGetNumber(messageText) {
    return Number(messageText);
}

function broadcastOnlineStats() {
    webSocketServer.clients.forEach(client => {
        client.send(JSON.stringify({
            event: 'updateOnlineStats',
            id: Date.now(),
            usersCount: webSocketServer.clients.size,
            currentNumber: currentNumber,
        }));
    });
}

//примерная структура сообщения (от пользователя)
// const message = {
//     event: 'updateNumber/connection',
//     id: 123,
//     date: '29.10.2023',
//     time: '17:21:10.123',
//     message: '',
//     userid: 12313
// }