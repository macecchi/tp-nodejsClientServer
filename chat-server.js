var sys = require('sys');
var net = require('net');

var sockets = [];
 
var svr = net.createServer(function(sock) { // callback executado a cada criacao de socket, apos o ACK
    sys.puts('Conectou-se: ' + sock.remoteAddress + ':' + sock.remotePort); 
    sock.write('Oi ' + sock.remoteAddress + ':' + sock.remotePort + '\n'); // envia boas-vindas ao cliente
    sockets.push(sock); // adiciona na lista de sockets
 
    sock.on('data', function(data) {  // callback executado quando o cliente envia mensagem
        if (data == 'EXIT') { // comando de finalizacao do cliente, fecha o socket
            sys.puts('comando EXIT recebido: ' + sock.remoteAddress + ':' + sock.remotePort + '\n');
            sock.destroy();
            var idx = sockets.indexOf(sock);
            if (idx != -1) {
                delete sockets[idx]; // remove da lista de sockets
            }
            return;
        }
        var len = sockets.length;
        for (var i = 0; i < len; i ++) { // broadcast da mensagem recebida, envia para todos os clientes (sockets conhecidos)
            if (sockets[i] != sock) {
                if (sockets[i]) {
                    sockets[i].write(sock.remoteAddress + ':' + sock.remotePort + ':' + data);
                }
            }
        }
    });
 
    sock.on('end', function(data) { // cliente disconecta
		try {
			sys.puts('Desconectou-se: ' + data + data.remoteAddress + ':' + data.remotePort + '\n');
		} catch(err) {
			sys.puts('Uma conexao foi abortada\n');
		}
        var idx = sockets.indexOf(sock);
        if (idx != -1) {
            delete sockets[idx];
        }
    });
	sock.on('error', function(err) { // exibe stack trace no caso de erros imprevistos
		sys.puts('ECONNRESET?\n' + err.stack);
		console.log(err);
	});
});
 
var svraddr = '74.207.235.213'; // endereco do servidor, ex.: localhost, 127.0.0.1, 74.207.235.213
var svrport = 8080; // porta para o ACK

svr.listen(svrport, svraddr); // inicializa a porta de escuta
sys.puts('Servidor criado em ' + svraddr + ':' + svrport + '\n'); // debug