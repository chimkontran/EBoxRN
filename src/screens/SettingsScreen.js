import React from 'react';
import {
	ScrollView,
	TextInput,
	Image,
	StyleSheet,
	View,
	Platform
} from 'react-native';
import {
  Container,
  Content,
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

export default class SettingsScreen extends React.Component {
	static navigationOptions = {
		tabBarIcon: ({ tintColor }) => (
		        <Image
		            source={Constants.images.settingsIcon}
		            style={[Constants.styles.MainStyles.icon, {tintColor: tintColor}]}
		        />
	        ),
	}

	constructor(props){
		super(props);
		this.state = {
			maxSessionTime: "",
			maxWattage: "",
			warningInterval: "",
			reportInterval: "",
			error: "",
			mess: ""
		}
		this.processPowerPlanToString = this.processPowerPlanToString.bind(this)
		this.fetchPowerPlan = this.fetchPowerPlan.bind(this)
		this.updatePowerPlan = this.updatePowerPlan.bind(this)
	}

	componentDidMount(){
		this.fetchPowerPlan()
	}

	processPowerPlanToString(powerPlan){
		var fields = Object.keys(powerPlan)
		for (var i = 0; i < fields.length; i++){
			if (powerPlan[fields[i]] == -1){
				powerPlan[fields[i]] = ""
			} 
			else {
				powerPlan[fields[i]] += ""
			}
		}
	}

	fetchPowerPlan(){
		Utils.makeEboxServerRequest('/PowerPlans', 'GET', {})
		.then(res=>{
			if (res.successful){
				this.processPowerPlanToString(res.data)
				this.setState({
					error: "",
					mess: "",
					maxSessionTime:res.data.maxSessionTime,
					maxWattage:res.data.maxWattage,
					warningInterval:res.data.warningInterval,
					reportInterval:res.data.reportInterval
				})
			}
			else {
				this.setState({
					error: res.error
				})
			}
		})
		.catch(err=>{
			//console.log(err)
			this.setState({error:"Cannot get data"})
		})
	}

	updatePowerPlan(){
		this.setState({
			error: "",
			mess: "",
		})
		var maxSessionTime = parseInt(this.state.maxSessionTime),
			maxWattage = parseInt(this.state.maxWattage),
			warningInterval = parseInt(this.state.warningInterval),
			reportInterval = parseInt(this.state.reportInterval)
		if (isNaN(maxSessionTime) || maxSessionTime == ""){
			maxSessionTime = -1;
		}
		else if (maxSessionTime < 6000000){
			maxSessionTime = 6000000
		}

		if (isNaN(maxWattage) || maxWattage == ""){
			maxWattage = -1;
		}
		else if (maxWattage < 10){
			maxWattage = 10
		}

		if (isNaN(warningInterval) || warningInterval == ""){
			warningInterval = -1;
		}
		else if (warningInterval < 6000000){
			warningInterval = 6000000
		}

		if (isNaN(reportInterval) || reportInterval == ""){
			reportInterval = -1;
		}
		else if (reportInterval < 1800000){
			reportInterval = 1800000
		}

		var newPowerPlan = {
			maxSessionTime:maxSessionTime,
			maxWattage:maxWattage,
			warningInterval:warningInterval,
			reportInterval:reportInterval
		}

		Utils.makeEboxServerRequest('/PowerPlans', 'POST', newPowerPlan)
		.then(res=>{
			if (res.successful){
				this.processPowerPlanToString(newPowerPlan)
				Object.assign(this.state,newPowerPlan)
				this.setState({
					mess: "Saved"
				})
			}
			else {
				this.setState({
					error: res.error
				})
			}
		})
		.catch(err=>{
			this.setState({error:"Cannot edit power plan"})
		})
	}

	render() {
	    return (
	    	<Container style={{paddingTop: (Platform.OS === 'ios') ? 40 : 20}}>
	    		<Content>
		    		<View>
			    		<Form style={{paddingLeft: 20, paddingRight:20}}>
				    		<Text style={{fontWeight:'bold'}}>Power Plan</Text>
				    		<Item>
				    			<Label>Max Session Time</Label>
				    			<Input fixedLabel
				    				keyboardType='numeric' style={{flex:1}}
				    				onChangeText={(value)=>{
					    				this.setState({
					    					maxSessionTime: value
					    				})
				    				}}
				    				value={this.state.maxSessionTime}
			    				/>
			    			</Item>
			    			<Item>
				    			<Label>Max Wattage</Label>
				    			<Input fixedLabel
				    				keyboardType='numeric' style={{flex:1}}
				    				onChangeText={(value)=>{
					    				this.setState({
					    					maxWattage: value
					    				})
				    				}}
				    				value={this.state.maxWattage}
			    				/>
			    			</Item>
			    			<Item>
				    			<Label>Warning Interval</Label>
				    			<Input fixedLabel
				    				keyboardType='numeric' style={{flex:1}}
				    				onChangeText={(value)=>{
					    				this.setState({
					    					warningInterval: value
					    				})
				    				}}
				    				value={this.state.warningInterval}
			    				/>
			    			</Item>
			    			<Item>
				    			<Label>Report Interval</Label>
				    			<Input fixedLabel
				    				keyboardType='numeric' style={{flex:1}}
				    				onChangeText={(value)=>{
					    				this.setState({
					    					reportInterval: value
					    				})
				    				}}
				    				value={this.state.reportInterval}
			    				/>
		    				</Item>
		    				<Text style={{color: this.state.error ? "red":'green'}}>
		    					{this.state.error || this.state.mess}</Text>
						</Form>
		    			<Button onPress={this.updatePowerPlan} full transparent>
		    				<Text>Save Power Plan</Text>
						</Button>
						<Button full danger transparent
							onPress={this.fetchPowerPlan}>
		    				<Text>Revert</Text>
						</Button>
		    			<View style={{marginTop: 100}}/>
			    		<Button full
			    			onPress= {() => this.props.navigation.navigate('User') }>
			    			<Text>User</Text>
			    		</Button>
		    		</View>
		    	</Content>
	    	</Container>
    	);
    }
}

const styles = {

}