import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  ListView,
  Button
} from 'react-native';

import Utils from 'eboxRN/src/utils/Utils';
import BluetoothSerial from 'react-native-bluetooth-serial'

export default class EBoxConfigScreen extends React.Component {
	static navigationOptions = {
		title: "EBox config"
	}

	constructor(props){
		super(props)
		const btDevicesDs = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
		this.state = {
			deviceList: btDevicesDs.cloneWithRows([]),
			chosenDevice: null,
			loading: false,
			status: "",
			errMess: "",
			eboxKey: "eboxebox",
			ssid: "Ebox",
			wifiPw: "eboxebox",
			btTimeouts: 0
		}
		this.configBtDevice = this.configBtDevice.bind(this)
	}

	componentDidMount(){
		BluetoothSerial.list()
		.then(list => {
			this.setState({
				deviceList: this.state.deviceList.cloneWithRows(list)
			})
		})
		.catch(err => {
			//console.log(err)
		})
	}

	chooseBtDevice(device){
		if (this.state.loading) return;
		this.setState({
			loading: true,
			status: "Connecting",
			errMess: ""
		})
		BluetoothSerial.connect(device.id)
		.then(res => {
			this.state.chosenDevice = device;
		})
		.catch(err => {
			this.setState({
				errMess: err.message
			})
		})
		.then(()=>{
			this.setState({
				loading: false,
				status: ""
			})
		})
	}

	configBtDevice(){
		if (this.state.loading) return;
		this.setState({
			loading: true,
			status: "Sending",
			errMess: "",
			btTimeouts: 0
		})
		Utils.checkUserStatus()
		.then(res => {
			return res.data._id
		})
		.then(userID => {
			var btMess = 'key=' + this.state.eboxKey
				+ '&userID=' + userID
			return BluetoothSerial.write(btMess)
			.then(res=>{
				return new Promise((resolve, reject)=>{
					btMess = '&ssid=' + this.state.ssid
						+ '&pw=' + this.state.wifiPw
					setTimeout(()=>{
						BluetoothSerial.write(btMess)
						.then(sent=>{
							setTimeout(()=>{
								BluetoothSerial.write('&connect=.')
								.then(sent=>{resolve(sent)})
								.catch(err=>{reject(sent)})
							}, 5000)
						})
						.catch(err=>{reject(sent)})
					}, 5000)
				})
			})
		})
		.then(sent => {
			this.waitForEBoxSuccess();
		})
		.catch(err => {
			this.setState({
				loading: false,
				errMess: err.message || err
			})
		})
	}

	waitForEBoxSuccess(){
		if (this.state.btTimeouts == 6) {
			this.setState({
				loading: false,
				errMess: "Time out"
			})
			return;
		}
		setTimeout(()=>{
			BluetoothSerial.readFromDevice()
			.then(data => {
				//console.log(data)
				if (data.indexOf('TCP connection ready') >= 0){
					BluetoothSerial.disconnect()
					this.props.navigation.goBack()
				}
				else {
					throw 'TCP not connected'
				}
			})
			.catch(err=>{
				this.state.btTimeouts++;
				this.waitForEBoxSuccess();
			})
		}, 1000)
		
	}

	render() {
		var btDeviceListView = (
			<ListView
    			style={{flex:-1}}
    			enableEmptySections
	          	dataSource={this.state.deviceList}
	          	renderRow={device => {
	          		return (
	          			<TouchableOpacity
	          				style={{margin: 20}}
	          				onPress={this.chooseBtDevice.bind(this, device)}
	          				>
	          				<Text style={{fontWeight:"bold"}}>
	          					{device.name}
          					</Text>
	          				<Text>{device.address}</Text>
	          			</TouchableOpacity>)
	          	}}
	        />)
		var configBtDeviceView = (
			<View style={{paddingTop: 20}}>
				<Text>EBox key</Text>
				<TextInput
					onChangeText={(text)=>{this.setState({eboxKey:text})}}
					value={this.state.eboxKey}/>

				<Text>Wifi SSID</Text>
				<TextInput
					onChangeText={(text)=>{this.setState({ssid:text})}}
					value={this.state.ssid}/>

				<Text>Wifi password</Text>
				<TextInput
					onChangeText={(text)=>{this.setState({wifiPw:text})}}
					value={this.state.wifiPw}/>

				<Button
					disabled={
						!this.state.eboxKey
						|| !this.state.ssid
						|| !this.state.wifiPw
					}
					title="Submit"
					onPress={this.configBtDevice}/>
			</View>)

		return (
			<View>
				<Text style={{margin: 20, textAlign: 'center'}}>
					{this.state.errMess || this.state.status}
				</Text>
				{this.state.chosenDevice ?
					configBtDeviceView
					: btDeviceListView}		
			</View>)
	}
}