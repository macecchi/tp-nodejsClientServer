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

var socket = net.createConnection(port, host);
console.log('Welcome to an awesome chat!');
console.log('Type "EXIT" to quit');

// Log the response from the HTTP server.
socket.on('data', function(data) { 
  sys.puts(data);
}).on('connect', function() {
  var stdin = process.openStdin();
	stdin.addListener("data", function(data) {
		// note:  data is an object, and when converted to a string it will
		// end with a linefeed.  so we (rather crudely) account for that  
		// with toString() and then substring() 
		if(socket.writable) {
			socket.write(data.toString().substring(0, data.length - 1));
		} else {
			console.log("Socket died :(");
		}
	});
}).on('end', function() {
  console.log('Closing...');
  process.exit(1);
});



  