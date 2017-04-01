import React from 'react';
import {
	View,
	Text,
	Button
} from 'react-native';

export default class UserScreen extends React.Component {
	static navigationOptions = {
		title: "User"
	}
	render() {
		console.log(this);
		return (
			<View>
				<Text>Hello User!</Text>
			</View>
			);
	}
}