import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableHighlight,
  Text,
  AsyncStorage,
  View
} from 'react-native';

import RegisterForm from '../components/RegisterForm';
import LoginForm from '../components/LoginForm'

export default class UserScreen extends React.Component {
	static navigationOptions = {
		title: "User"
	}
	// constructor()
	// {
	// 	super();
	// 	this.state = {
	// 		token: null;
	// 	}
	// }

	componentWillMount(){
		var getToken = this._loadToken.done();
		console.log("Get token in userscreen: " + getToken)
	}

	_loadToken = async () => {
		const token = await AsyncStorage.getItem('token');
	}

	render(){
		var form;
		if (this.getToken != null) {
			// form = (<RegisterForm/>)
			form = (<LoginForm/>)
			return form
		}
		else
		{
			form = (<RegisterForm/>)
			return form
		}
		
		// if (true) {
		// 	// form = (<RegisterForm/>)
		// 	form = (<LoginForm/>)
		// 	return form
		// }
		
	}
}