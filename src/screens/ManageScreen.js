import React from 'react';
import {
	ListView,
	Image,
	View,
	StyleSheet,
} from 'react-native';
import {
  Container,
  Content,
  Picker,
  Text,
  Button,
  Form,
  Input,
  Label,
  Item,
  Icon
} from 'native-base';

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
			// //console.log(res)
			this.setState({
				eboxesDataSource: this.state.eboxesDataSource.cloneWithRows(res.data.eboxes || [])
			})
		})
		.catch(err => {
			//console.log(err)
		})
	}

	renderEboxView(eboxData){
		return (<EboxControlsView 
          			updateEboxesStatus={this.updateEboxesStatus}
          			data={eboxData} />)
	}

	render() {
	    return (
	    	<Container style={{paddingTop: 22, flex:1, backgroundColor: 'white'}}>
	    		<Content>
			    	<View>
				        <Button full transparent
				        	onPress={() => 
				        		this.props.navigation.navigate('EBoxConfig') }>
			        		<Text>Config EBox</Text>
			        	</Button>
			    		<ListView
			    			style={{flex:-1}}
			    			removeClippedSubviews={false}
			    			enableEmptySections
				          	dataSource={this.state.eboxesDataSource}
				          	renderRow={this.renderEboxView}
				        />
			    	</View>
		    	</Content>
	    	</Container>);
    }
}
