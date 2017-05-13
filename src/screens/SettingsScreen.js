import React from 'react';
import {
	Text,
	ScrollView,
	TextInput,
	Button,
	Image,
	StyleSheet,
	View
} from 'react-native';

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
	    	<ScrollView style={{flex:1, paddingTop: 20}}>
	    		<Text style={{fontWeight:'bold'}}>Power Plan</Text>
	    		<View style={styles.field}>
	    			<Text>Max Session Time</Text>
	    			<TextInput keyboardType='numeric' style={{flex:1}}
	    				onChangeText={(value)=>{
		    				this.setState({
		    					maxSessionTime: value
		    				})
	    				}}
	    				value={this.state.maxSessionTime}
    				/>
    			</View>
    			<View style={styles.field}>
	    			<Text>Max Wattage</Text>
	    			<TextInput keyboardType='numeric' style={{flex:1}}
	    				onChangeText={(value)=>{
		    				this.setState({
		    					maxWattage: value
		    				})
	    				}}
	    				value={this.state.maxWattage}
    				/>
    			</View>
    			<View style={styles.field}>
	    			<Text>Warning Interval</Text>
	    			<TextInput keyboardType='numeric' style={{flex:1}}
	    				onChangeText={(value)=>{
		    				this.setState({
		    					warningInterval: value
		    				})
	    				}}
	    				value={this.state.warningInterval}
    				/>
    			</View>
    			<View style={styles.field}>
	    			<Text>Report Interval</Text>
	    			<TextInput keyboardType='numeric' style={{flex:1}}
	    				onChangeText={(value)=>{
		    				this.setState({
		    					reportInterval: value
		    				})
	    				}}
	    				value={this.state.reportInterval}
    				/>
    			</View>
    			<Text style={{color: this.state.error ? "red":'green'}}>
    				{this.state.error || this.state.mess}</Text>
    			<Button title="Save" onPress={this.updatePowerPlan}/>
    			<View style={{marginTop: 100}}/>
	    		<Button
	    			onPress= {() => this.props.navigation.navigate('User') }
	    			title= "User"
	    		/>
	    	</ScrollView>
    	);
    }
}

const styles = {
	field: {
		flex: 1,
		flexDirection:'row', 
		justifyContent:'center',
		alignItems:'center'
	}
}