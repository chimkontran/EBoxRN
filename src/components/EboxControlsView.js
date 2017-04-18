import React from 'react';
import {
	ListView,
	Image,
	View,
	StyleSheet,
	Text,
	Modal,
	TouchableHighlight,
	Button,
	TextInput
} from 'react-native';

import EboxSocketView from 'eboxRN/src/components/EboxSocketView';
import HolableOpacity from 'eboxRN/src/components/HoldableOpacity';
import Utils from 'eboxRN/src/utils/Utils';

export default class EboxControlsView extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			isRenaming: false,
			err: ""
		}
		this.state = Object.assign(this.state, this.props.data)
	}

	componentWillReceiveProps(nextProps){
		this.setState(Object.assign(this.state, nextProps.data))
	}

	renameEbox(){
		Utils.makeEboxServerRequest('/Management/Names', 'POST', {
			eboxID: this.state.id,
			socketNum: -1,
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
					name: res.data.name,
					isRenaming: false
				})
			}
		})
		.catch(err => {
			console.log(err)
		})
	}

	render(){
		var range = [0,1,2,3];
		return (
			<View>
				<Modal 
					visible={this.state.isRenaming}
					onRequestClose={()=>{}}
					>
		         	<View style={{marginTop: 22}}>
			            <Text>Enter new name for EBox</Text>
			            <TextInput onChangeText={(text)=>{this.setState({newName: text})}}>
			            	{this.state.newName}
			            </TextInput>
			            <Text>{this.state.err}</Text>
			            <Button onPress={this.renameEbox.bind(this)} title="Rename"/>
			            <TouchableHighlight onPress={()=>{this.setState({isRenaming: false})}}>
			              <Text>Cancel</Text>
			            </TouchableHighlight>
		         	</View>
		        </Modal>
				<HolableOpacity duration={20} 
					onHold={()=>{
						this.setState({
							isRenaming: true, 
							err: "",
							newName: this.state.name
						})}
					}>
					<Text style={{textAlign: 'center', fontSize: 22, fontWeight:'bold'}}>
						{this.state.name || "Unnamed"}
					</Text>
				</HolableOpacity>
				<View style={{flexDirection: 'row'}}>
					{range.map(i => {
						return (
							<EboxSocketView 
								key={
									JSON.stringify({
										eboxID: this.state.id, 
										index: i
									})
								}
								updateEboxesStatus={this.props.updateEboxesStatus}
								socketNames={this.state.socketNames}
								mode={this.state.status == "offline" ? -1 : this.state.status[i]}
								eboxID={this.state.id}
								name={this.state.currentSocketNames[i]}
								index={i}/>
						)
					})}
				</View>
			</View>)
	}
}