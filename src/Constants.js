import ManageScreen from 'eboxRN/src/screens/ManageScreen';
import ScheduleScreen from 'eboxRN/src/screens/ScheduleScreen';
import ReportScreen from 'eboxRN/src/screens/ReportScreen';
import SettingsScreen from 'eboxRN/src/screens/SettingsScreen';
import UserScreen from 'eboxRN/src/screens/UserScreen';

import MainStyles from 'eboxRN/src/styles/MainStyles';

const path = {
	screensFolder: 'eboxRN/src/screens/',
	imagesFolder: 'eboxRN/src/images/',
	stylesFolder: 'eboxRN/src/styles/'
}

const colors = {
	accent: '#e91e63',
	primary: '#2196F3',
	darkPrimary: '#1976D2',
	lightPrimary: '#BBDEFB',
	primaryText: '#212121',
	secondaryText: '#757575',
	divider: '#BDBDBD'
}

const images = {
	logo: require('eboxRN/src/images/logo.png'),
	outlinedLogo: require('eboxRN/src/images/outlinedLogo.png'),
	alarmIcon: require('eboxRN/src/images/alarmIcon.png'),
	reportIcon: require('eboxRN/src/images/reportIcon.png'),
	settingsIcon: require('eboxRN/src/images/settingsIcon.png'),
}

const styles = {
	MainStyles: MainStyles
}

const screens = {
	ManageScreen: ManageScreen,
	ScheduleScreen: ScheduleScreen,
	ReportScreen: ReportScreen,
	SettingsScreen: SettingsScreen,
	UserScreen: UserScreen
}

export default Constants = {
	styles: styles,
	colors: colors,
	images: images,
	path: path,
	screens: screens
};