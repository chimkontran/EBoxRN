import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableHighlight,
  Text,
  View
} from 'react-native';

import RegisterForm from '../components/RegisterForm';
import LoginForm from '../components/LoginForm';
import BluetoothSerialExample from '../components/Bluetooth';

export default class UserScreen extends React.Component {
	static navigationOptions = {
		title: "User"
	}


	render(){
		var form;
		if (true) {
			// form = (<RegisterForm/>)
			// form = (<LoginForm/>)
			form = (<BluetoothSerialExample />)
		}
		return form
	}
}