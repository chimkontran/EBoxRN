import React from 'react';
import {
	AppRegistry,
	Text,
	View
} from 'react-native';

import { 
	StackNavigator, 
	TabNavigator 
} from 'react-navigation';

import ManageScreen from './src/screens/ManageScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ReportScreen from './src/screens/ReportScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import UserScreen from './src/screens/UserScreen';

const MainNavigator = TabNavigator({
	Manage: { screen: ManageScreen },
	Schedule: { screen: ScheduleScreen },
	Report: { screen: ReportScreen },
	Settings: { screen: SettingsScreen },
}, {
	tabBarOptions: {
    	labelStyle: {
		    fontSize: 11,
		},
		indicatorStyle: {
			backgroundColor: '#e91e63'
		}
	},
});
MainNavigator.navigationOptions = {
	title: 'EBox'
}

const eboxRN = StackNavigator({
	Main: { screen: MainNavigator },
	User: { screen: UserScreen },
});

AppRegistry.registerComponent('eboxRN', () => eboxRN);
