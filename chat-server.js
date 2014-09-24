// http://www.zhihua-lai.com/acm
// http://helloacm.com/node-js-tutorial-3-creating-a-chat-server-using-tcp-sockets/

var sys = require('sys');
var net = require('net');
var sockets = [];
 
var svr = net.createServer(function(sock) {
    sys.puts('Connected: ' + sock.remoteAddress + ':' + sock.remotePort); 
    sock.write('Hello ' + sock.remoteAddress + ':' + sock.remotePort + '\n');
    sockets.push(sock);
 
    sock.on('data', function(data) {  // client writes message
        if (data == 'EXIT') {
            sys.puts('exit command received: ' + sock.remoteAddress + ':' + sock.remotePort + '\n');
            sock.destroy();
            var idx = sockets.indexOf(sock);
            if (idx != -1) {
                delete sockets[idx];
            }
            return;
        }
        var len = sockets.length;
        for (var i = 0; i < len; i ++) { // broad cast
            if (sockets[i] != sock) {
                if (sockets[i]) {
                    sockets[i].write(sock.remoteAddress + ':' + sock.remotePort + ':' + data);
                }
            }
        }
    });
 
    sock.on('end', function() { // client disconnects
		try {
			sys.puts('Disconnected: ' + data + data.remoteAddress + ':' + data.remotePort + '\n');
		} catch(err) {
			sys.puts('A connection was aborted\n');
		}
        var idx = sockets.indexOf(sock);
        if (idx != -1) {
            delete sockets[idx];
        }
    });
	sock.on('error', function(err) {
		sys.puts('ECONNRESET?\n' + err.stack);
	});
});
 
var svraddr = '74.207.235.213';
var svrport = 8080;

svr.listen(svrport, svraddr);
sys.puts('Server Created at ' + svraddr + ':' + svrport + '\n');