import React from 'react';
import {
	ListView,
	Image,
	View,
	StyleSheet,
	Text
} from 'react-native';

import Constants from 'eboxRN/src/Constants';
import Utils from 'eboxRN/src/utils/Utils';

import EboxControlsView from 'eboxRN/src/components/EboxControlsView';

export default class ManageScreen extends React.Component
{
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
	constructor(props){
		super(props);
		const eboxesDs = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		this.state = {
			eboxesDataSource: eboxesDs.cloneWithRows([]),
			dataRefreshInterval: null
		}
		this.updateEboxesStatus = this.updateEboxesStatus.bind(this)
		this.renderEboxView = this.renderEboxView.bind(this)
	}

	componentDidMount(){
		this.updateEboxesStatus();
		this.state.dataRefreshInterval = setInterval(this.updateEboxesStatus, 10000)
	}

	updateEboxesStatus(){
		Utils.makeEboxServerRequest('/Management', 'GET', {})
		.then(res => {
			console.log(res)
			this.setState({
				eboxesDataSource: this.state.eboxesDataSource.cloneWithRows(res.data.eboxes || [])
			})
		})
		.catch(err => {
			console.log(err)
		})
	}

	renderEboxView(eboxData){
		console.log(eboxData)
		return (<EboxControlsView
          			updateEboxesStatus={this.updateEboxesStatus}
          			data={eboxData} />)
	}

	render() {
	    return (
	    	<View style={{paddingTop: 22, flex:1}}>
	    		<ListView
	    			style={{flex:-1}}
	    			enableEmptySections
		          	dataSource={this.state.eboxesDataSource}
		          	renderRow={this.renderEboxView}
		        />
		        <View style={{flex: 1}}></View>
	    	</View>);
    }
}
