import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableHighlight,
  AsyncStorage,
  Text,
  View
} from 'react-native';

import Utils from 'eboxRN/src/utils/Utils';

export default class LoginForm extends React.Component {
	constructor() {
		super();

		this.state = {
			email: "",
			password: "",
			errorMess:""
		}
	}

	async onLoginPressed() {
		this.setState({
			errorMess: ""
		})
		try{
			let res = await Utils.loginEboxServer(this.state.email, this.state.password)
			//console.log(res)
			if (res.status == "successful"){
				this.props.setLoginState(true)
			}
			else {
				this.setState({
					errorMess: res.mess
				})
			}
		} catch(error) {
			//console.log(error)
			this.setState({
				errorMess: "Cannot connect"
			})
		}

	}

	render() {
		return (
			<View style={{paddingTop:20}}>
				<Text style={styles.error}>{this.state.errorMess}</Text>

				<TextInput style={{height:40}}
					onChangeText={ (text)=> this.setState({email:text}) }
					placeholder="Email"
				/>

				<TextInput style={{height:40}}
					onChangeText={ (text)=> this.setState({password:text}) }
					placeholder="Password" secureTextEntry={true}
				/>


				<TouchableHighlight  style={styles.button}
				onPress={this.onLoginPressed.bind(this)}>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableHighlight>

        <Text style={{color: 'black', textAlign: 'center'}}>Do not have an account yet?</Text>				
			</View>

				// <ActivityIndicatorIOS animating={this.state.showProgress} size="large" style={styles.loader} />
		);
  }
}

const styles = StyleSheet.create({

  input: {
    height: 50,
    marginTop: 10,
    padding: 4,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#48bbec'
  },

  button: {
    height: 50,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent: 'center'
  },

  buttonText: {
    fontSize: 22,
    color: '#FFF',
    alignSelf: 'center'
  },

  error: {
    color: 'red',
    paddingTop: 10
  },

  loader: {
    marginTop: 20
  }
});
