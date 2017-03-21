import React from 'react';
import {
	Text,
	ScrollView,
	Button,
	Image,
	StyleSheet
} from 'react-native';

export default class ReportScreen extends React.Component {
	static navigationOptions = {
		tabBar: {
			icon: ({ tintColor }) => (
		        <Image
		            source={Constants.images.reportIcon}
		            style={[Constants.styles.MainStyles.icon, {tintColor: tintColor}]}
		        />
	        ),
		}
	}
	render() {
	    return (<Text>Manage page</Text>);
    }
}