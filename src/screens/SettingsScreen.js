import React from 'react';
import {
	Text,
	ScrollView,
	Button,
	Image,
	StyleSheet
} from 'react-native';

export default class SettingsScreen extends React.Component {
	static navigationOptions = {
		tabBar: {
			label: 'asd'
		}
	}
	render() {
	    return (
	    	<ScrollView>
	    		<Text>Settings page</Text>
	    		<Button
	    			onPress= {() => this.props.navigation.navigate('User') }
	    			title= "User"
	    		/>
	    	</ScrollView>
    	);
    }
}