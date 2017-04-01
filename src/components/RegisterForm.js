import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableHighlight,
  Text,
  View
} from 'react-native';

export default class RegisterForm extends React.Component {
	constructor() {
		super();

		this.state = {
			email: "",
			pword: "",
			pword_confirm:"",
			errorMess:"",
		}
	}

	async onRegisterPressed(){
		try{

			// console.log(this.state.pword == this.state.pword_confirm)
			let response = await fetch('http://139.59.102.199/API/Users/Register', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: "email=" + this.state.email +
						"&password=" + this.state.pword +
						"&confirm-password=" + this.state.pword_confirm

			});
			
			let res = await response.text();
			res = JSON.parse(res);
			console.log("Response is: " + res.mess)	

			if (res.status == "successful"){
				// let user log in
			}
			else {
				this.setState({errorMess:res.mess})
			}

			///// catch errors
			if (response.status >= 200 && response.status < 300) {
				// print input
				// console.log("Response is: " + res)		
			} else {
				let errors = res;
				console.log(errors)
			}

		} catch(errors) {
			console.log(errors)
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
					onChangeText={(val) => this.setState({pword:val})}
					secureTextEntry={true} placeholder="Password"
				/>
				
				<TextInput
					onChangeText={(val) => this.setState({pword_confirm:val})}
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