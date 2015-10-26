var sys = require('sys');
var net = require('net');

var sockets = [];
 
var svr = net.createServer(function(sock) { // callback executado a cada criacao de socket, apos o ACK
    console.log('Novo cliente conectou: ' + sock.remoteAddress + ':' + sock.remotePort); 
    sock.write('Oi ' + sock.remoteAddress + ':' + sock.remotePort + '\n'); // envia boas-vindas ao cliente
    sockets.push(sock); // adiciona na lista de sockets
 
    sock.on('data', function(data) {  // callback executado quando o cliente envia mensagem
    	var receivedMessage = data.toString();

    	// Verificar se a mensagem é um comando
    	if (receivedMessage.charAt(0) == '/') {
    		var command = receivedMessage.substring(1, receivedMessage.length).split(' ');
	        if (command == 'exit') { // comando de finalizacao do cliente, fecha o socket
	            console.log('Comando /exit recebido de ' + sock.remoteAddress + ':' + sock.remotePort + '\n');
	            sock.destroy();
	            var idx = sockets.indexOf(sock);
	            if (idx != -1) {
	                delete sockets[idx]; // remove da lista de sockets
	            }
	            return;
	        }
    	}

        var len = sockets.length;
        for (var i = 0; i < len; i ++) { // broadcast da mensagem recebida, envia para todos os clientes (sockets conhecidos)
            if (sockets[i] != sock) {
                if (sockets[i]) {
                    sockets[i].write(sock.remoteAddress + ':' + sock.remotePort + ':' + receivedMessage);
                }
            }
        }
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