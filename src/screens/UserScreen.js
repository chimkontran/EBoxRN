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
import LoginForm from '../components/LoginForm';
import LogoutForm from '../components/LogoutForm';

export default class UserScreen extends React.Component {
	static navigationOptions = {
		title: "User"
	}

	constructor(props){
		super(props)
		this.state = {
			loggedIn: false,
			registering: true
		}
	}

	toggleRegistering(){
		this.setState({
			registering: !this.state.registering
		})
	}

	componentWillMount(){
		
	}

	render(){
		var form;
		var toggleRegisterLink = (<View/>);
		if (this.state.loggedIn) {
			// form = (<RegisterForm/>)
			form = (<LogoutForm/>)
		}
		else
		{
			if (this.state.registering){
				form = (<RegisterForm/>)
			}
			else {
				form = (<LoginForm/>)
			}
			toggleRegisterLink = (
				<Text 
					style={{color: 'blue', textAlign: 'center'}}
					onPress={this.toggleRegistering.bind(this)}>
					{this.state.registering ? "Login" : "Register"}
				</Text>)

		}
		return (
			<View>
				{form}
				{toggleRegisterLink}
			</View>)
	}
}