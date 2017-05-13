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

class RegisterForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			email: "",
			password: "",
			password_confirm:"",
			errorMess:"",
		}
	}

	async onRegisterPressed(){
		try{
			this.setState({
				errorMess: ""
			})
			var params = {
				email: this.state.email,
				password: this.state.password,
				"confirm-password": this.state.password_confirm
			}
			let res = await Utils.makeEboxServerRequest('/Users/Register', 'POST', params)
			if (res.status == "successful"){
				delete params["confirm-password"]
				await AsyncStorage.setItem('credentials', JSON.stringify(params))
				this.props.setLoginState(true)
			}
			else {
				this.setState({
					errorMess: res.mess
				})
			}
		} catch(error) {
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
					onChangeText={(val) => this.setState({email:val})}
					placeholder="Email"
				/>

				<TextInput style={{height:40}}
					onChangeText={(val) => this.setState({password:val})}
					secureTextEntry={true} placeholder="Password"
				/>

				<TextInput style={{height:40}}
					onChangeText={(val) => this.setState({password_confirm:val})}
					secureTextEntry={true} placeholder="Confirm password"
				/>

				<TouchableHighlight style={styles.button}
				onPress={this.onRegisterPressed.bind(this)}>
					<Text style={styles.buttonText}>Register</Text>
				</TouchableHighlight>

        <Text style={{color: 'black', textAlign: 'center'}}>Already have an account?</Text>
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
