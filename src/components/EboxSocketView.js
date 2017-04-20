import React from 'react';
import {
	ListView,
	Image,
	View,
	StyleSheet,
	Text,
	Modal,
	TextInput,
	Button,
	TouchableOpacity,
	TouchableHighlight,
	Picker
} from 'react-native';

const socketColors = ['yellow', 'red', 'blue', 'pink'];
const offlineColor = 'grey';

import Utils from 'eboxRN/src/utils/Utils';
import HoldableOpacity from 'eboxRN/src/components/HoldableOpacity';

export default class EboxSocketView extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			height: 0,
			isRenaming: false,
			showNameInput: this.props.name == "",
			err: "",
			name: this.props.name
		}
		this.switchSocket = this.switchSocket.bind(this)
	}

	componentWillReceiveProps(nextProps){
		this.setState({name:nextProps.name})
	}

	switchSocket(){
		if (this.state.offline) return;
		Utils.makeEboxServerRequest('/Management', 'POST', {
			eboxID: this.props.eboxID,
			socketNum: this.props.index,
			mode: this.props.mode == 0 ? 1 : 0
		})
		.then(res => {
			console.log(res)
			if (res.status == "successful"){
				setTimeout(this.props.updateEboxesStatus, 3000)
			}
		})
		.catch(err => {
			console.log(err)
		})
	}

	renameEboxSocket(){
		Utils.makeEboxServerRequest('/Management/Names', 'POST', {
			eboxID: this.props.eboxID,
			socketNum: this.props.index,
			name: this.state.newName
		})
		.then(res => {
			if (res.error){
				this.setState({
					err: res.error
				})
			}
			else {
				this.setState({
					name: res.data.currentSocketNames[this.props.index],
					isRenaming: false
				})
			}
		})
		.catch(err => {
			console.log(err)
		})
	}

	render(){
		var nameOptions = this.props.socketNames.slice()
		nameOptions.push("other")
		var currentOption = 
		(this.state.newName 
			&& nameOptions.indexOf(this.state.newName) != -1) && this.state.newName
				|| "other"
		return (
			<View style={{flex: 1, margin: 10}}>
				<Modal 
					visible={this.state.isRenaming}
					onRequestClose={()=>{}}
					>
		         	<View style={{marginTop: 22}}>
			            <Text>Edit socket/device name</Text>
			            <Picker
							selectedValue={currentOption}
							onValueChange={(name) => {
								if (name == "other"){
									console.log(name)
									this.setState({
										showNameInput: true,
										newName: ""
									})
								}
								else {
									this.setState({
										newName: name,
										showNameInput: false
									})
								}
							}}>
							{nameOptions.map(name => 
								<Picker.Item key={name} label={name} value={name} />
							)}
						</Picker>
						{this.state.showNameInput ?
							(<TextInput onChangeText={(text)=>{this.setState({newName: text})}}>
				            	{this.state.newName}
				            </TextInput>)
				            : (<View/>)
						}
			            <Text>{this.state.err}</Text>
			            <Button onPress={this.renameEboxSocket.bind(this)} title="Rename"/>
			            <TouchableHighlight 
			            	onPress={()=>{
			            		this.setState({
			            			isRenaming: false, 
			            			newName: this.state.name
			            		})
			            	}}>
			              <Text>Cancel</Text>
			            </TouchableHighlight>
		         	</View>
		        </Modal>
				<View 
					style={[
						{
							paddingBottom: 10,
							borderBottomWidth: 5
						}, this.props.mode == 1 ? {
							borderBottomColor: 'green'
						} : {
							borderBottomColor: 'transparent'
						}
					]}>
					<HoldableOpacity duration={this.props.mode == 0 ? 0 : 1000}
						onHold={this.switchSocket}>
						<Image 
				            source={Constants.images.socketIcon}
				            onLayout={
				            	(ev)=>{
				            		this.setState({height: ev.nativeEvent.layout.width}); 
				            	}
				            }
				            style={{
				            	width: "100%", 
				            	height: this.state.height,
				            	backgroundColor: (this.props.mode == -1 ? 
				            		offlineColor 
				            		: socketColors[this.props.index]),
				            	resizeMode: 'contain'
				            }}
				        />
					</HoldableOpacity>
				</View>
				<Text style={{textAlign:'center'}}>
					{(this.props.wattage || 0) + " W"}
				</Text>
				<HoldableOpacity duration={500} 
					style={{marginTop: 10}}
					onHold={()=>{
						this.setState({
							isRenaming: true, 
							err: "",
							newName: this.state.name
						})}
					}>
					<Text style={{textAlign:'center', fontSize: 18}}>
						{this.state.name || "_"}
					</Text>
				</HoldableOpacity>
			</View>)
	}
}