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
		return (
			<View>
				<Text>Hello User!</Text>
			</View>
			);
	}
}