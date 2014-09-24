var sys = require("sys");
var net = require('net');

var host, port;

process.argv.forEach(function (val, index, array) {
  if (index == 2) { // 1o parametro
	host = val;
  } else if (index == 3) { // 2o parametro
	port = val;
  }
});


var socket = net.createConnection(port, host);
console.log('Socket created.');

socket.on('data', function(data) {
  // Log the response from the HTTP server.
  sys.puts(data);
}).on('connect', function() {
	var stdin = process.openStdin(); // inicializando o console
	stdin.addListener("data", function(d) {
		// note:  d is an object, and when converted to a string it will
		// end with a linefeed.  so we (rather crudely) account for that  
		// with toString() and then substring() 
			
		socket.write(d.toString().substring(0, d.length-1));
	});
  
}).on('end', function() {
  console.log('DONE');
});



  