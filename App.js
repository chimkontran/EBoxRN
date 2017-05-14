import React from 'react';
import {
	AppRegistry,
	View,
	Button,
	Text
} from 'react-native';

import {
	StackNavigator,
	TabNavigator
} from 'react-navigation';

import Constants from 'eboxRN/src/Constants';
import Utils from 'eboxRN/src/utils/Utils';

const MainNavigator = TabNavigator({
	Manage: { screen: Constants.screens.ManageScreen },
	Schedule: { screen: Constants.screens.ScheduleScreen },
	Report: { screen: Constants.screens.ReportScreen },
	Settings: { screen: Constants.screens.SettingsScreen },
}, {
	tabBarOptions: {
		activeBackgroundColor: "white",
		inActiveBackgroundColor: "white",
    	labelStyle: {
		    fontSize: 11,
		},
		indicatorStyle: {
			backgroundColor: Constants.colors.accent,
			height: "5%",
		},
		showIcon: true,
		showLabel: true
	},
});

MainNavigator.navigationOptions = {
	title: 'EBox',
	header: null
}
Utils.globalVariables.MainNavigator = MainNavigator

const AppNavigator = StackNavigator({
	Main: { screen: MainNavigator },
	User: { screen: Constants.screens.UserScreen },
	EBoxConfig: { screen: Constants.screens.EBoxConfigScreen},
	AddSchedule: {screen: Constants.screens.AddSchedule}
}, {
	navigationOptions: {
		headerStyle: {
			backgroundColor: Constants.colors.primary,
		},
		headerTintColor: 'white'
	}
});

export default class eboxRN extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {
	    	loggedIn: false,
	    	loaded: false
	    };
	    this.setLoginState = this.setLoginState.bind(this);
    }

    setLoginState(loggedIn){
    	this.setState({loggedIn: loggedIn})
    }

    componentDidMount(){
    	Utils.globalFunctions.setLoginState = this.setLoginState;
    	Utils.checkUserStatus()
    		.then(res => {
				if (res.status == "successful"){
					this.state.loggedIn = true;
				}
			})
			.catch(err => {
				console.log(err)
			})
			.then(()=>{
				this.setState({
					loaded: true
				})
			})
			.catch(err => {
				console.log(err)
			})
    }

	render(){
		var screen = (<View/>);
		if (this.state.loaded){
			if (!this.state.loggedIn){
				screen = (<Constants.screens.UserScreen isPortal={true}/>)
			}
			else {
				screen = (<AppNavigator ref={nav => { console.log(nav) }}/>);
			}
		}
		return screen;
	}
}

AppRegistry.registerComponent('eboxRN', () => eboxRN);
