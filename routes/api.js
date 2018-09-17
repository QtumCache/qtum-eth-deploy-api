const database = require('../model/mysql');
const express = require('express');
const router = express.Router();
const fs = require('fs');
const utils = require('../helper/utils');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

//const ETHWALLETADDRESS = '0x5fe92a6d72bf9a68d5fbdb41e997bdf16e160e08';	// PRIVATENET_ADDRESS
const ETHWALLETADDRESS = '0x2efdc39e3223344927fb42694021b89d7cbaeb78';	// TESTNET_ADDRESS

router.post('/deploy', function(req, res, next) {
	let source = req.body.source;
	let jsonArgs = req.body.args ? req.body.args : '[]';
	let contractAddress = {};

	// Ethereum deploy
	result = utils.validateSource(source);
	if (result["status"] == "error") {
		return res.send(utils.makeReturnValue(false, null, result["message"]));
	}
	let compiledContract = result['data'];
	let contracts = compiledContract['contracts'];
	let contractNames = Object.keys(contracts);
	if (contractNames.length == 1 || !targetContract) {
		targetContract = contractNames[0].replace(':', '');
	}
	let targetContractColon = ":" + targetContract;
	let bytecode = utils.get0xPrefixed(contracts[targetContractColon]['bytecode']);
	let abiJson = contracts[targetContractColon]['interface'];
	let abi = JSON.parse(abiJson);
	let constructorValidResult = utils.validateConstructors(abi, jsonArgs);
	if (constructorValidResult["status"] == "error") {
		return res.send(utils.makeReturnValue(false, null, constructorValidResult["message"]));
	}
	let arguments = constructorValidResult["data"];

	let contractInstance = new web3.eth.Contract(abi);
	contractInstance.deploy({
    	data: bytecode,
	    arguments: arguments
	})
	.send({
	    from: ETHWALLETADDRESS,
	    gas: 1500000,
	    gasPrice: '5e9'
	})
	.then(function(newContractInstance) {
		contractAddress['ethereum'] = newContractInstance.options.address;

		// Qtum Deploy (If Ethereum deployment is success)
		let sourceWords = source.split(/\s+/);
		let constructorArgs = req.body.args ? req.body.args : "";
		let contractName;
		for (let i = 0; i < sourceWords.length; i++) {
			if (sourceWords[i] == "contract") {
				contractName = sourceWords[i + 1];
			}
		}
		let filePath = 'contracts/' + contractName;
		fs.writeFileSync(filePath, source);

		const exec = require('child_process').exec;
		exec("solar deploy --force " + filePath + " " + constructorArgs, (error, stdout, stderr) => {
			if (error || stderr) {res.send(utils.makeReturnValue(false, null, "failed to deploy. please try again.")); console.log(error); console.log(stderr); return;}
			let stdoutlines = stdout.split(/\n/);
			let isDeployed = false;
			for (line of stdoutlines) {
				if (line.indexOf("deployed") >= 0) {
					isDeployed = true;
					contractAddress['qtum'] = line.split(/\s+/)[4];
				}
			}
			if (!isDeployed) {
				return res.send(utils.makeReturnValue(false, null, "failed to deploy. please try again."));
			}
			database.insertMonitorAddress(contractAddress['qtum']);
			console.log(contractAddress);
			return res.send(utils.makeReturnValue(true, contractAddress, null));
		});
	}).catch(function(error) {
		console.log(error);
	});

});

module.exports = router;
