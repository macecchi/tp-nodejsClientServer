var sys = require('sys');
var net = require('net');

var sockets = [];
var clientNames = {};
var defaultNames = ['Adriano', 'Adriana', 'Carla', 'João Carlos', 'Claudson', 'Paulo', 'Flávia', 'Silvana', 'Maria Luiza', 'Marcos', 'Jonathan', 'Daniel', 'Aguiar'];

function getClientName(sock) {
	return clientNames[sock.remoteAddress + ':' + sock.remotePort];
}

function setClientName(sock, name) {
	if (!name) {
		var randPos = Math.floor(Math.random() * defaultNames.length);
		name = defaultNames[randPos];
		delete defaultNames[randPos];
	}
    
    clientNames[sock.remoteAddress + ':' + sock.remotePort] = name;
}

function deleteClientName(sock) {
	delete clientNames[sock.remoteAddress + ':' + sock.remotePort];
}

function broadcast(sock, message) {
    for (var i = 0; i < sockets.length; i++) { // broadcast da mensagem recebida, envia para todos os clientes (sockets conhecidos)
        //if (sockets[i] != sock) {
            if (sockets[i]) {
                sockets[i].write(message + "\n");
            }
        //}
    }
}
 
var svr = net.createServer(function(sock) { // callback executado a cada criacao de socket, apos o ACK
    sockets.push(sock); // adiciona na lista de sockets
    setClientName(sock);

    console.log('Novo cliente conectou: ' + getClientName(sock) + ' (' + sock.remoteAddress + ':' + sock.remotePort + ')');
    sock.write('Olá! Seu nome é ' + getClientName(sock) + '.\nPara trocar seu nome, envie /name seguido do novo nome.\nPara sair, envie /exit.\n\n'); // envia boas-vindas ao cliente
    broadcast(sock, getClientName(sock) + ' conectou-se.');
 
    sock.on('data', function(data) {  // callback executado quando o cliente envia mensagem
    	var receivedMessage = data.toString();

    	// Verificar se a mensagem é um comando
    	if (receivedMessage.charAt(0) == '/') {
    		var command = receivedMessage.substring(1, receivedMessage.length).split(' ');

	        if (command[0] == 'exit') { // comando de finalizacao do cliente, fecha o socket
	            console.log('Comando /exit recebido de ' + sock.remoteAddress + ':' + sock.remotePort + '\n');
	            sock.destroy();
	            var idx = sockets.indexOf(sock);
	            if (idx != -1) {
	                delete sockets[idx]; // remove da lista de sockets
	            }
	            return;
	        }
	        if (command[0] == 'name' && command[1] != '') {
	        	var oldName = getClientName(sock);
	        	var newName = command[1];
	        	setClientName(sock, newName);
	            var nameUpdateMessage = 'O cliente "' + oldName + '" mudou seu nome para "' + newName + '".';
	            console.log(nameUpdateMessage);
	            broadcast(sock, nameUpdateMessage);
	        	return;
	        }
    	}

        broadcast(sock, getClientName(sock) + ' diz:\n  ' + receivedMessage);
    });
 
    sock.on('end', function(data) { // cliente disconecta
		try {
			console.log('Desconectou-se: ' + data + data.remoteAddress + ':' + data.remotePort + '\n');
		} catch(err) {
			console.log('Uma conexao foi abortada\n');
		}
        var idx = sockets.indexOf(sock);
        if (idx != -1) {
            delete sockets[idx];
            deleteClientName(sock);
        }
    });

	sock.on('error', function(err) { // exibe stack trace no caso de erros imprevistos
		console.log('ECONNRESET?\n' + err.stack);
		console.log(err);
	});
});
 
var svraddr = '0.0.0.0'; // endereco do servidor, ex.: localhost, 127.0.0.1, 74.207.235.213
var svrport = 8080; // porta para o ACK

svr.listen(svrport, svraddr); // inicializa a porta de escuta
console.log('Servidor criado em ' + svraddr + ':' + svrport + '\n'); // debug