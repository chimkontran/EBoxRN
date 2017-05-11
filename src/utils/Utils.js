import {
  AsyncStorage,
} from 'react-native';

import Constants from 'eboxRN/src/Constants';

async function makeEboxServerRequest(uri, method, params){
	console.log("fetching " + uri)
	try{
		var paramsStr = "";
		var isPOST = method == "POST"
		if (!isPOST){
			for (var i = 0; i < Object.keys(params).length; i++){
				var key = Object.keys(params)[i];
				var value = params[key];
				paramsStr += i > 0 ? "&" : "?";
				paramsStr += key + "=" + value;
			}
		}

		var url = Constants.urls.eboxAPI + uri + paramsStr
		let response = await fetch(url, {
			method: method,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: (isPOST && JSON.stringify(params)) || null
		});
		let res = await response.text();
		if (!res) {
			throw "No respond"
		}
		console.log("parsing")
		console.log(res)
		res = JSON.parse(res);
		if (res.code != "NOT_LOGGED_IN"){
			return res
		}

		// auto re-login
		try {
			var credentials = await AsyncStorage.getItem('credentials');
			credentials = JSON.parse(credentials)
			if (credentials !== null){
				console.log("asd")
				return loginEboxServer(credentials.email, credentials.password)
					.then(res => {
						if (res.status == "successful") {
							return makeEboxServerRequest(uri, method, params);
						}
						else {
							globalFunctions.setLoginState(false);
							throw "NOT_LOGGED_IN"
						}
					})
			}
			else {
				globalFunctions.setLoginState(false);
				throw "NOT_LOGGED_IN"
			}
		}
		catch(err){
			globalFunctions.setLoginState(false);
			throw "NOT_LOGGED_IN"
		}

	} catch(error) {
		throw error
	}
}

function loginEboxServer(email, password){
	var params = {email: email, password: password};
	var _res;
	return makeEboxServerRequest("/Users/Login", 'POST', params)
		.then(res => {
			_res = res;
			if (res.status == "successful") {
				console.log("xyz")
				return AsyncStorage.setItem('credentials', JSON.stringify(params))
			}
		})
		.then(() => {
			console.log("res:" + JSON.stringify(_res))
			return _res
		})
}

function checkUserStatus(){
	return makeEboxServerRequest('/Users/Status', 'GET', {})
}

const globalFunctions = {
	setLoginState: function(){},
}

export default Utils = {
	makeEboxServerRequest: makeEboxServerRequest,
	loginEboxServer: loginEboxServer,
	globalFunctions: globalFunctions,
	checkUserStatus: checkUserStatus
}