var sys = require("sys");
var net = require('net');

var host, port;

//Carregando parametros
process.argv.forEach(function (val, index, array) {
  if (index == 2) { // 1o parametro
	  host = val;
  } else if (index == 3) { // 2o parametro
	  port = val;
  }
});

var socket = net.createConnection(port, host); // cria o socket, instancia o listener
console.log('Bem-vindo!');
console.log('Digite EXIT para encerrar o chat');

socket.on('data', function(data) { // Escuta o stream de dados que vem do servidor
	sys.puts(data); // se chegou algo do servidor, escreve na tela
}).on('connect', function() { // assim que recebe o evento de 'conectado', abre um console para o usuário
	var stdin = process.openStdin(); // abre console
	stdin.addListener("data", function(data) { // listener para tratamento do que foi digitado no console
		// data é um objeto "puro" javascript que precisa ser convertido pra string antes de usar
		// além disso é preciso remover o line feed do final (por isso o substring)		
		if(socket.writable) { // se o socket ainda estiver ativo, escreva nele o que foi digitado
			socket.write(data.toString().substring(0, data.length - 1)); // escrevendo
		} else { // se o socket estiver fechado indevidamente (abortado, falha na rede, etc), avisar e sair do programa
			console.log("O socket morreu :(");
			process.exit(2);
		}
	});
}).on('end', function() { // se o comando de finalização do socket for executado, escutar pelo evento de fechamento normal do socket originado do servidor
	console.log('Adeus...');
	process.exit(1);
});



  