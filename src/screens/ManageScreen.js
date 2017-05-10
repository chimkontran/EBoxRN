import React from 'react';
import {
	ListView,
	Image,
	View,
	StyleSheet,
	Text,
	Button
} from 'react-native';

import Constants from 'eboxRN/src/Constants';
import Utils from 'eboxRN/src/utils/Utils';

import EboxControlsView from 'eboxRN/src/components/EboxControlsView';

export default class ManageScreen extends React.Component 
{
	static navigationOptions = {
		tabBarIcon: ({ tintColor }) => (
		        <Image
		            source={Constants.images.outlinedLogo}
		            style={[Constants.styles.MainStyles.icon, {tintColor: tintColor}]}
		        />
	        ),
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
		this.state.dataRefreshInterval = setInterval(this.updateEboxesStatus, 5000)
	}

	componentWillUnmount(){
		clearInterval(this.state.dataRefreshInterval)
	}

	updateEboxesStatus(){
		Utils.makeEboxServerRequest('/Management', 'GET', {})
		.then(res => {
			// console.log(res)
			this.setState({
				eboxesDataSource: this.state.eboxesDataSource.cloneWithRows(res.data.eboxes || [])
			})
		})
		.catch(err => {
			console.log(err)
		})
	}

	renderEboxView(eboxData){
		// console.log(eboxData)
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
		        <Button 
		        	title="Add EBox" 
		        	onPress={() => 
		        		this.props.navigation.navigate('EBoxConfig') }
	        		/>
		        
	    	</View>);
    }
}