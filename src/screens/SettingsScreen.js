import React from 'react';
import {
	Text,
	ScrollView,
	Button,
	Image,
	StyleSheet
} from 'react-native';

import Constants from 'eboxRN/src/Constants';

export default class SettingsScreen extends React.Component {
	static navigationOptions = {
		tabBar: {
			icon: ({ tintColor }) => (
		        <Image
		            source={Constants.images.settingsIcon}
		            style={[Constants.styles.MainStyles.icon, {tintColor: tintColor}]}
		        />
	        ),
		}
	}
	render() {
	    return (
	    	<ScrollView>
	    		<Text>Settings page</Text>
	    		<Image
	            	source={Constants.images.logo}
		            style={[Constants.styles.MainStyles.icon]}
		        />
	    		<Button
	    			onPress= {() => this.props.navigation.navigate('User') }
	    			title= "User"
	    		/>
	    	</ScrollView>
    	);
    }
}