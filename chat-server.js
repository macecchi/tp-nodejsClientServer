var sys = require('sys');
var net = require('net');

var sockets = [];
var clientNames = {};
var defaultNames = ['Adriano', 'Adriana', 'Carla', 'João', 'Claudson', 'Paulo', 'Flávia', 'Silvana', 'Maria', 'Marcos', 'Jonathan', 'Daniel', 'Aguiar'];
 
var svraddr = '0.0.0.0'; // endereco do servidor, ex.: localhost, 127.0.0.1, 74.207.235.213
var svrport = 8080; // porta para o ACK

/**
 * Cria o servidor e configura todos os callbacks dos clientes necessários para seu uso
 */
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
	            broadcast(sock, 'O cliente ' + getClientName(sock) + " desconectou-se.");
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

    	// Verificar se a mensagem é uma mensagem direta
    	if (receivedMessage.charAt(0) == '@') {
    		var recipient = receivedMessage.substring(1, receivedMessage.length).split(' ');

    		directMessage(sock, recipient[0], '[PRIVADO] ' + getClientName(sock) + ' diz:\n  ' +recipient.slice(1).join(' '));
    		return;
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

/**
 * Retorna o nome do cliente a partir do seu socket.
 */
function getClientName(sock) {
	return clientNames[sock.remoteAddress + ':' + sock.remotePort];
}

/**
 * Modifica o nome do cliente a partir do seu socket
 */
function setClientName(sock, name) {
	if (!name) {
		var randPos = Math.floor(Math.random() * defaultNames.length);
		name = defaultNames[randPos];
		delete defaultNames[randPos];
	}
    
    clientNames[sock.remoteAddress + ':' + sock.remotePort] = name;
}

/**
 * Deleta o nome do cliente da lista de nomes a partir de seu socket
 */
function deleteClientName(sock) {
	delete clientNames[sock.remoteAddress + ':' + sock.remotePort];
}

/**
 * Manda uma mensagem para todos os sockets conhecidos
 */
function broadcast(sender, message) {
    for (var i in sockets) { // broadcast da mensagem recebida, envia para todos os clientes (sockets conhecidos)
        //if (sockets[i] != sender) {
            if (sockets[i]) {
                sockets[i].write(message + "\n");
            }
        //}
    }
}

/**
 * Manda uma mensagem para um socket específico
 */
function directMessage(sender, recipient, message) {
	for (var i in sockets) {
		if (getClientName(sockets[i]) == recipient) {
			sockets[i].write(message + "\n");
			break;
		}
	}
}

svr.listen(svrport, svraddr); // inicializa a porta de escuta
console.log('Servidor criado em ' + svraddr + ':' + svrport + '\n'); // debug
