import React from 'react';
import {
	AppRegistry,
} from 'react-native';

import { 
	StackNavigator, 
	TabNavigator 
} from 'react-navigation';

import Constants from 'eboxRN/src/Constants';

const MainNavigator = TabNavigator({
	Manage: { screen: Constants.screens.ManageScreen },
	Schedule: { screen: Constants.screens.ScheduleScreen },
	Report: { screen: Constants.screens.ReportScreen },
	Settings: { screen: Constants.screens.SettingsScreen },
}, {
	tabBarOptions: {
		style: {
			backgroundColor: Constants.colors.darkPrimary
		},
    	labelStyle: {
		    fontSize: 11,
		},
		indicatorStyle: {
			backgroundColor: Constants.colors.accent
		},
		showIcon: true,
		showLabel: true
	},
});
MainNavigator.navigationOptions = {
	title: 'EBox',
	header: {
		visible: false
	}
}

const eboxRN = StackNavigator({
	Main: { screen: MainNavigator },
	User: { screen: Constants.screens.UserScreen },
}, {
	navigationOptions: {
		header: {
			style: {
				backgroundColor: Constants.colors.primary,
			},
			tintColor: 'white'
		}
	}
});

AppRegistry.registerComponent('eboxRN', () => eboxRN);
