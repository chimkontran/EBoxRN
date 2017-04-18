import React from 'react';
import {
	ListView,
	Image,
	View,
	StyleSheet,
	Text,
	TouchableOpacity
} from 'react-native';

export default class HoldableOpacity extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			timer: null
		}
		this._onPressIn = this._onPressIn.bind(this)
		this._onPressOut = this._onPressOut.bind(this)
	}

	_onPressIn(){
		if (this.state.timer == null){
			this.state.timer = setTimeout(this.props.onHold, this.props.duration)
		}
	}

	_onPressOut(){
		clearTimeout(this.state.timer)
		this.state.timer = null
	}

	render(){
		return (<TouchableOpacity 
					onPressIn={this._onPressIn}
					onPressOut={this._onPressOut}>
					{this.props.children}
				</TouchableOpacity>)
	}
}