import React from 'react';
import {
	Text,
	ScrollView,
	Button,
	Image,
	AsyncStorage,
	StyleSheet
} from 'react-native';

export default class ManageScreen extends React.Component 
{
	componentWillMount(){
		this._checkAsyncStorage().done();
	}

	_checkAsyncStorage = async () => {

		const token = await AsyncStorage.getItem('token');
	}

	static navigationOptions = {
		tabBar: {
			icon: ({ tintColor }) => (
		        <Image
		            source={Constants.images.outlinedLogo}
		            style={[Constants.styles.MainStyles.icon, {tintColor: tintColor}]}
		        />
	        ),
		}
	}
	render() {
	    return (<Text>Manage page</Text>);
    }
}