import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableHighlight,
  AsyncStorage,
  Text,
  View
} from 'react-native';

const ACCESS_TOKEN = 'access_token';

class RegisterForm extends React.Component {
	constructor() {
		super();

		this.state = {
			email: "",
			password: "",
			password_confirm:"",
			errorMess:"",
		}
	}

	async onRegisterPressed(){
		try{

			// console.log(this.state.password == this.state.password_confirm)
			let response = await fetch('http://139.59.102.199/API/Users/Register', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: "email=" + this.state.email +
					"&password=" + this.state.password +
					"&confirm-password=" + this.state.password_confirm

			});
			
			let res = await response.text();
			res = JSON.parse(res);

			if (res.status == "successful"){
				// Handle success
				this.setState({errorMess:""});

				let accessToken = res; // res.status
				console.log("accessToken: " + accessToken);
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
					onChangeText={(val) => this.setState({email:val})}
					placeholder="Email"
				/>
				
				<TextInput
					onChangeText={(val) => this.setState({password:val})}
					secureTextEntry={true} placeholder="Password"
				/>
				
				<TextInput
					onChangeText={(val) => this.setState({password_confirm:val})}
					secureTextEntry={true} placeholder="Confirm password"
				/>

				<TouchableHighlight style={styles.button} 
				onPress={this.onRegisterPressed.bind(this)}>
					<Text style={styles.buttonText}>Register</Text>
				</TouchableHighlight>
			</View>
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

export default RegisterForm