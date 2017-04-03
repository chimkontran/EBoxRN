import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableHighlight,
  AsyncStorage,
  Text, 
  View
} from 'react-native';

export default class LogoutForm extends React.Component {
	constructor() {
		super();

		this.state = {
			errorMess:"",
			token:"",
			userState:""
		}		
	}

	componentWillMount(){
		this._checkAsyncStorage().done();
	}

	_checkAsyncStorage = async () => {

		const token = await AsyncStorage.getItem('token');
		this.setState({token: token});
	}


	async onLogoutPressed(){
		try {
			let response = await fetch('http://139.59.102.199/API/Users/Logout', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: ("")

			});

			let res = await response.text();
			res = JSON.parse(res);

			// remove Token
			AsyncStorage.removeItem('token');

			if (res.status == "successful"){
			// Handle success
				this.setState({errorMess:""});
				let accessToken = res; // res.status

				this.setState({userState:"loggedout"});
			}
			else {
			// Handle error
				this.setState({errorMess:res.mess});
				console.log("errorMess: " + this.state.errorMess);
			}

		} catch(error) {
			console.log("error: " + error);
		}
	}

	render(){
		return(
			<TouchableHighlight  style={styles.button}
			onPress={this.onLogoutPressed.bind(this)}>
				<Text style={styles.buttonText}>Log Out</Text>
			</TouchableHighlight>
			);
	}
}

const styles = StyleSheet.create({
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