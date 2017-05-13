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
import HoldableOpacity from 'eboxRN/src/components/HoldableOpacity';
import Utils from 'eboxRN/src/utils/Utils';

export default class EboxControlsView extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			isRenaming: false,
			err: "",
			loaded: false
		}
		this.state = Object.assign(this.state, this.props.data)
	}

	componentDidMount(){
		this.setState({loaded: true})
	}

	componentWillReceiveProps(nextProps){
		if (!this.state.loaded) return
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
			//console.log(err)
		})
	}

	render(){
		var range = [0,1,2,3];
		return (
			<View>
				{/* Rename Ebox */}
				<Modal
					visible={this.state.isRenaming}
					onRequestClose={()=>{}}
					>
		         	<View style={{marginTop: 22}}>
			            <Text>Enter new name for EBox</Text>
			            <TextInput value={this.state.newName}
			            style={{height: 40}}
			            onChangeText={(text)=>{
			            	this.setState({newName: text, err:""})
			            }}>
			            </TextInput>
			            <Text>{this.state.err}</Text>
			            <Button onPress={this.renameEbox.bind(this)} title="Rename"/>
			            <TouchableHighlight onPress={()=>{this.setState({isRenaming: false})}}>
			              <Text>Cancel</Text>
			            </TouchableHighlight>
		         	</View>
		        </Modal>
				<HoldableOpacity duration={500} 
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
				</HoldableOpacity>

				{/*  Show Ebox info */}
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
								data={{
									updateEboxesStatus:this.props.updateEboxesStatus,
									socketNames:this.state.socketNames,
									mode:this.state.status == "offline" ? -1 : this.state.status[i],
									wattage:this.state.status == "offline" ? 0 : this.state.wattages[i],
									smartOffMode:this.state.smartOffModes[i],
									eboxID:this.state.id,
									name:this.state.currentSocketNames[i],
									index:i
								}}/>
						)
					})}
				</View>
			</View>)
	}
}
