import {
  AsyncStorage,
} from 'react-native';

import Constants from 'eboxRN/src/Constants';

async function makeEboxServerRequest(uri, method, params){
	console.log("fetching")
	try{
		var paramsStr = "";
		for (var i = 0; i < Object.keys(params).length; i++){
			var key = Object.keys(params)[i];
			var value = params[key];
			i > 0 && (paramsStr += "&");
			paramsStr += key + "=" + value;
		}
		var isPOST = method == "POST"
		var url = Constants.urls.eboxAPI + uri + ((!isPOST && paramsStr) || "")
		let response = await fetch(url, {
			method: method,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: (isPOST && paramsStr) || null
		});
		console.log("still fetching")
		let res = await response.text();
		if (res) {
			res = JSON.parse(res);
			console.log(res)
			if (res.code == "NOT_LOGGED_IN"){
				try {
					var credentials = await AsyncStorage.getItem('credentials');
					credentials = JSON.parse(credentials)
					if (credentials !== null){
						console.log("asd")
						loginEboxServer(credentials.email, credentials.password)
							.then(res => {
								if (res.status == "successful") {
									return res
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
			}
			else {
				return res
			}
		}
		else {
			throw "No respond"
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