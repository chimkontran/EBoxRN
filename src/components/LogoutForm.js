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

export default class LogoutForm extends React.Component {
	async onLogoutPressed(){
		try {
			let response = await Utils.makeEboxServerRequest('/Users/Logout', 'POST', {})
			if (response.status == "successful"){
				await AsyncStorage.removeItem("credentials")
				Utils.globalFunctions.setLoginState(false)
			}

		} catch(error) {
			console.log(error)
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