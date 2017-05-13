import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableHighlight,
  Text,
  AsyncStorage,
  View
} from 'react-native';

import Utils from 'eboxRN/src/utils/Utils';

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
			registering: true,
			loaded: false
		}
	}

	toggleRegistering(){
		this.setState({
			registering: !this.state.registering
		})
	}

	setLoginState(loggedIn){
		if (this.props.isPortal){
			//console.log("returning")
			Utils.globalFunctions.setLoginState(true)
		}
		else {
			this.setState({
				loggedIn: loggedIn
			})
		}
	}

	componentWillMount(){
		Utils.checkUserStatus()
			.then(res => {
				if (res.status == "successful"){
					this.setLoginState(true)
				}
			})
			.catch(err => {
				//console.log(err)
			})
			.then(()=>{
				this.setState({
					loaded: true
				})
			})
	}

	render(){
		var form;
		var toggleRegisterLink = (<View/>);
		if (this.state.loaded){
			if (this.state.loggedIn) {
				form = (<LogoutForm setLoginState={this.setLoginState.bind(this)}/>)
			}
			else
			{
				if (this.state.registering){
					form = (<RegisterForm setLoginState={this.setLoginState.bind(this)}/>)
				}
				else {
					form = (<LoginForm setLoginState={this.setLoginState.bind(this)}/>)
				}
				toggleRegisterLink = (
					<Text
						style={{color: 'blue', textAlign: 'center', fontSize: 20}}
						onPress={this.toggleRegistering.bind(this)}>
						{this.state.registering ? "Login" : "Register"}
					</Text>)

			}
		}
		return (
			<View>
				{form}
				{toggleRegisterLink}
			</View>)
	}
}
