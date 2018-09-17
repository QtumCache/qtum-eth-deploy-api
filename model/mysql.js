let mysql = require('mysql');
let connection;
let database = {
	initialize: function() {
		connection = mysql.createConnection({
			host     : 'localhost',
			database : 'qtum_cache',
			user     : 'root',
			password : 'QtumCache1234'
		});
		connection.connect();
		console.log("Connected to MySQL");
	},
	insertMonitorAddress: function(address) {
		connection.query('INSERT INTO monitor_contracts SET ?', {contract_address: address}, function (error, results, fields) {
			console.log(error);
			console.log(results);
			console.log(fields);
		});
	}
}

module.exports = database;
