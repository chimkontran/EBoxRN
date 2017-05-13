import React, {Component} from 'react';
import {
  AppRegistry,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  AsyncStorage,
  Text,
  ScrollView,
	Image,
  View
} from 'react-native';

import Constants from 'eboxRN/src/Constants';
import Utils from 'eboxRN/src/utils/Utils';

export default class ScheduleScreen extends React.Component {
	static navigationOptions = {
		tabBarIcon: ({ tintColor }) => (
		        <Image
		            source={Constants.images.alarmIcon}
		            style={[Constants.styles.MainStyles.icon, {tintColor: tintColor}]}
		        />
	        ),
	}

  constructor(props){
    super(props);

    this.state = {
      scheduleID: [],
      name: [],
      time: [],
      repeatDays: [],
      commands: [],
      objectData: [],
    }

    this._getSchedule = this._getSchedule.bind(this);
    this._getSchedule();
  }

  // {/* Run _getSchedule on constructor */}
  _getSchedule = async() => {
    let response = await Utils.makeEboxServerRequest('/Schedules', 'GET', {})
    this.state.objectData = []
    // {/* var i = 1 in order to avoid 0 (currently error, will change back to 0 by production) */}
    for (var i = 0; i < Object.keys(response['data']).length; i++)
    {
        this.state.objectData.push(response['data'][i]);
        // this.state.scheduleID.push(response['data'][i]['_id']);
        // this.state.name.push(response['data'][i]['name']);
        // this.state.time.push(response['data'][i]['time']);
        // this.state.repeatDays.push(response['data'][i]['repeatDays']);
        // for (var a = 0; a < Object.keys(response['data'][i]['commands']).length; a++)
        // {
        //   this.state.commands.push(response['data'][i]['commands'][a]);
        // }
    }
    this.setState({});
    //console.log(this.state.objectData);
  }

  editSchedule(scheduleData){
    this.props.navigation.navigate('AddSchedule', {data: scheduleData, refreshSchedules: this._getSchedule})
  }

	render() {
      // {/* Fetch information dynamic to render view */}
      var fetchInformation = [];

      var daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      for (var i = 0; i < this.state.objectData.length; i++) {
        var scheduleData = this.state.objectData[i]
        fetchInformation.push(
          <View key={i} style={{"paddingBottom": 30}}>
            <TouchableOpacity onPress={this.editSchedule.bind(this, scheduleData)}>
              <Text>Name: {scheduleData['name']}</Text>
              <Text>Time: {scheduleData['time']}</Text>
              <Text>Repeat Days: {
                scheduleData['repeatDays'].map(repeatDay=>daysInWeek[repeatDay]+' ')
              }</Text>
            </TouchableOpacity>
          </View>
        );
      }

	    return (
        <View style={{position:'relative', flex:1, paddingTop: 20}}>
        <ScrollView>
          {fetchInformation}
        </ScrollView>
          <TouchableOpacity style={styles.button}
          onPress= {() => this.props.navigation.navigate('AddSchedule', {data: {}, refreshSchedules: this._getSchedule})}>
            <Image
              source={Constants.images.plusIcon}
              style={styles.addButton}
            />
          </TouchableOpacity>
        </View>
			);
    }
}

var styles = StyleSheet.create({

  button: {
  	padding: 15,
  	borderRadius: 5,
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  addButton: {
    width: 70,
    height: 70,
  }
});
