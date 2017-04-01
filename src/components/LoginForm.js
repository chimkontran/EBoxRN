import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableHighlight,
  AsyncStorage,
  Text, 
  View
} from 'react-native';

export default class LoginForm extends React.Component {
	constructor() {
		super();

		this.state = {
			email: "",
			password: "",
			errorMess:"",
			token:""
		}		
	}

	componentWillMount(){
		this._checkAsyncStorage().done();
	}

	_checkAsyncStorage = async () => {

		const token = await AsyncStorage.getItem('token');
		this.setState({token: token});
		console.log("Get from state in loginform: " + this.state.token);
	}

	async onLoginPressed() {
		try{
			// console.log(this.state.password == this.state.password_confirm)
			let response = await fetch('http://139.59.102.199/API/Users/Login', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: ("email="+this.state.email+
					"&password="+this.state.password)

			});
			// console.log("email="+this.state.email+"&password="+this.state.password)
			
			let res = await response.text();
			res = JSON.parse(res);
			// console.log("Response is: " + res.mess)


			if (res.status == "successful"){
			// Handle success
				this.setState({errorMess:""});
				let accessToken = res; // res.status

				console.log("accessToken: " + accessToken.data._id);
				AsyncStorage.setItem('token', accessToken.data._id);
				// store accesstoken in AsyncStorage
				// this.storeToken(accessToken);
			}
			else {
			// Handle error
				this.setState({errorMess:res.mess});
				console.log("errorMess: " + this.state.errorMess);
				// let error = errorMess;
				// throw error;
			}

		} catch(error) {
			console.log("error: " + error);
		}

	}

	render() {
		return (
			<View>
				<Text style={styles.error}>{this.state.errorMess}</Text>

				<TextInput
					onChangeText={ (text)=> this.setState({email:text}) }
					placeholder="Email"
				/>

				<TextInput
					onChangeText={ (text)=> this.setState({password:text}) }
					placeholder="Password" secureTextEntry={true}
				/>
				
				
				<TouchableHighlight  style={styles.button}
				onPress={this.onLoginPressed.bind(this)}>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableHighlight>

				
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

