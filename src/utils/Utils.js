import {
  AsyncStorage,
} from 'react-native';

import Constants from 'eboxRN/src/Constants';

async function makeEboxServerRequest(uri, method, params){
	try {
		var accessToken = await AsyncStorage.getItem('accessToken')
		params['accessToken'] = JSON.parse(accessToken).value
	}
	catch(err){
		console.log(err)
	}
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
		
		res = JSON.parse(res);
		console.log(res)
		if (res.code != "TOKEN_INVALID"){
			return res
		}

		// auto re-login
		try {
			var credentials = await AsyncStorage.getItem('credentials');
			credentials = JSON.parse(credentials)
			if (credentials !== null){
				return loginEboxServer(credentials.email, credentials.password)
					.then(res => {
						if (res.status == "successful") {
							return makeEboxServerRequest(uri, method, params);
						}
						else {
							globalFunctions.setLoginState(false);
							throw "TOKEN_INVALID"
						}
					})
			}
			else {
				globalFunctions.setLoginState(false);
				throw "TOKEN_INVALID"
			}
		}
		catch(err){
			globalFunctions.setLoginState(false);
			throw "TOKEN_INVALID"
		}

	} catch(error) {
		throw error
	}
}

function loginEboxServer(email, password){
	var params = {email: email, password: password};
	return makeEboxServerRequest("/Users/Login", 'POST', params)
		.then(res => {
			if (res.status == "successful") {
				return AsyncStorage.setItem('credentials', JSON.stringify(params))
				.then(()=>{
					return AsyncStorage.setItem('accessToken', JSON.stringify(res.data.accessToken))
				})
				.then(()=>{
					return res
				})
			}
			else {
				return res
			}
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
