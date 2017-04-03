import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableHighlight,
  Text,
  AsyncStorage,
  View
} from 'react-native';

import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm';
import LogoutForm from '../components/LogoutForm'

export default class UserScreen extends React.Component {
	static navigationOptions = {
		title: "User"
	};

	

	constructor(){
		super();
		this.state = {
			token:null,
			userState:"",
		};
	}

	componentWillMount(){
		// this._checkAsyncStorage().done();
	}

	componentDidMount(){
		this._checkAsyncStorage();
	}

	_checkAsyncStorage = async () => {

		const token = await AsyncStorage.getItem('token');
		console.log("Get token from UserScreen: " + token);
		this.setState({token: token});

		console.log("userState: " + this.state.userState);
	}

	render(){
		var form;

		
		if (this.state.userState == 'loggedin') 
		{
			form = (<LogoutForm />)
			return form;
		}
		if (this.state.userState == 'loggedout') 
		{
			form = (<LoginForm />)
			return form;
		}
		if (this.state.userState == 'registering')
		{
			form = (<RegisterForm />)
			return form;
		}
		if (this.state.userState == "") 
		{
			form = (<LoginForm />)
			return form;
		}
		// // if user not logged in -> show login page
		// if (this.state.token != null) {
		// 	// form = (<RegisterForm/>)
		// 	form = (<LogoutForm/>)
		// 	return form
		// }
		// // if user logged in -> show logout page
		// else
		// {
		// 	form = (<LoginForm/>)
		// 	// form = (<RegisterForm/>)
		// 	return form
		// }
	}
}