import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  AsyncStorage,
  Text, 
  View
} from 'react-native';

import Utils from 'eboxRN/src/utils/Utils';

export default class LogoutForm extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      email: "",
      errorMess: ""
    }
  }

  async getUserInfo(){
    try{
      var credentials = await AsyncStorage.getItem("credentials")
      credentials = JSON.parse(credentials)
      this.setState({
        email: credentials.email
      })
    }
    catch(err){
      console.log(err)
    }
  }

  componentDidMount(){
    this.getUserInfo()
  }

	async onLogoutPressed(){
    this.setState({
        errorMess: ""
      })
		try {
			let response = await Utils.makeEboxServerRequest('/Users/Logout', 'POST', {})
			if (response.status == "successful"){
				await AsyncStorage.removeItem("credentials")
				Utils.globalFunctions.setLoginState(false)
			}
      else {
        this.setState({
          errorMess: res.mess
        })
      }
    } catch(error) {
      this.setState({
        errorMess: "Cannot connect"
      })
    }
	}

	render(){
		return(
      <View>
        <Text style={{fontWeight: 'bold'}}>{this.state.email}</Text>
        <Text style={{color:'red'}}>{this.state.errorMess}</Text>

  			<TouchableOpacity
  			onPress={this.onLogoutPressed.bind(this)}>
          <Text>Log out</Text>
  			</TouchableOpacity>
      </View>
			);
	}
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent: 'center'
  },

  buttonText: {
    fontSize: 22,
    color: '#FFF',
    alignSelf: 'center'
  },

  error: {
    color: 'red',
    paddingTop: 10
  },

  loader: {
    marginTop: 20
  }
});