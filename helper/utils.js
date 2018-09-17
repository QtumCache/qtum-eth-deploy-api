const solc = require('solc');

function strToType(str, type) {
	// int*, uint*は文字列をそのまま受け付けられるので対応不要
	// byte系はbytes, bytes1 - bytes32, byte (=bytes1) の3種類が存在。
	// bytesは型ではなくArrayだが、まとめて変換出来ることを確認済み。
	if (type.match(/byte/)) {
		// 元々16進数ならそのまま返す
		if (str.match(/0x[0-9a-f]+/)) {
			return str;
		} else {
			return web3.utils.utf8ToHex(str);
		}
	} else if(type.match(/bool/)) {
		if (str == "false" || str == "False") {
			return false;
		}
	}
	return str;
}

exports.makeReturnValue = function(is_success, data, message) {
	if (is_success) status = "success"; else status = "error";
	return {
		"status": status,
		"data": data,
		"message": message
	};
}

exports.validateSource = function(source) {
	if (!source) {
		return module.exports.makeReturnValue(false, null, "Source is empty");
	}
	let compiledContract = solc.compile(source, 1);
	if (compiledContract.hasOwnProperty('errors')) {
		onlyWarning = true;
		for (let error of compiledContract['errors']) {
			if (error.indexOf('Warning') < 0) {
				onlyWarning = false;
			}
		}
		if (!onlyWarning) {
			return module.exports.makeReturnValue(false, null, compiledContract['errors']);
		}
	}
	return module.exports.makeReturnValue(true, compiledContract, null);
}

exports.get0xPrefixed = function(key) {
	if (key == null) {
			return '0x';
	}
	if (key.startsWith('0x')) {
		return key;
	} else {
		return '0x' + key;
	}
}

exports.validateConstructors = function(abi, json_args) {
	let arguments;
	try {
		arguments = JSON.parse(json_args);
	} catch (e) {
		return module.exports.makeReturnValue(false, null, "invalid json argument");
	}
	let constructor_inputs = [];
	for (let item of abi) {
		if (item.type == "constructor") {
			constructor_inputs = item.inputs;
		}
	}
	if (constructor_inputs.length != arguments.length) {
		return module.exports.makeReturnValue(false, null, "invalid number of arguments");
	}
	try {
		for (index in constructor_inputs) {
			let input = constructor_inputs[index];
			let type = input.type;
			if (type.match(/\[\]/)) {
				// 配列の場合
				for (child_index in arguments[index]) {
					arguments[index][child_index] = strToType(arguments[index][child_index], type);
				}
			} else {
				arguments[index] = strToType(arguments[index], type);
			}
		}
	} catch (err) {
		return module.exports.makeReturnValue(false, null, "invalid args");
	}
	return(module.exports.makeReturnValue(true, arguments, null));
}
