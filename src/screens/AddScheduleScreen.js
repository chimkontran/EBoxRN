import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Picker,
  AsyncStorage,
  Button,
  Modal,
  Text,
  View
} from 'react-native';

import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import {CheckboxGroup} from 'react-native-material-design';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Utils from 'eboxRN/src/utils/Utils';

export default class AddScheduleScreen extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      scheduleID: "",
      eboxes:[],
      name: "",
      time: "",
      date: "",
      repeatDays: [],
      commands: [],
      isChoosingRepeatDay: false,
      isChoosingCommand: false,
      errorMess: "",
      isDateTimePickerVisible: false,
      eboxCommands: {}
    }

    Utils.makeEboxServerRequest('/Management', 'GET', {})
		.then(res => {
      this.setState({eboxes: res.data.eboxes})
      this.addCommandView()
      console.log(this.state.eboxes);

		})
		.catch(err => {
			console.log(err)
		})


  }

  componentDidMount(){
    // get DATA
    var navigationParams = this.props.navigation.state.params
    console.log(this.props.navigation.state)
    Object.assign(this.state, navigationParams.data)
    this.setState({})
  }

  getNotScheduledEboxes(){
    var notAddedEboxes = []
    var eboxes = this.state.eboxes
    var addedEboxIDs = Object.keys(this.state.eboxCommands)
    for (var i = 0; i< eboxes.length; i++){
      var isNotAdded = true;
      for (var j = 0; j < addedEboxIDs.length; j++){
        if (eboxes[i].id == addedEboxIDs[j]) {
          isNotAdded = false;
          break;
        }
      }
      if (isNotAdded){
        notAddedEboxes.push(eboxes[i].id)
      }
    }
    return notAddedEboxes
  }

  addCommandView(){
    var notAddedEboxes = this.getNotScheduledEboxes();
    if (notAddedEboxes.length > 0){
      var eboxID = notAddedEboxes[0];
      var eboxName = this.getEboxName(eboxID)
      this.state.eboxCommands[eboxID] = [-1,-1,-1,-1]
      this.setState({})
      // console.log("added");
    }
  }

  getEboxName(eboxID){
    var eboxName = ''
    this.state.eboxes.map(ebox=>{
      if (ebox.id == eboxID){
        eboxName = ebox.name
      }
    })
    return eboxName
  }

  _showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

  _hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

  _handleDatePicked = (date) => {
    var stringDate = String(date);
    this.setState({date: stringDate});
    var sliced = this.state.date.split(" ");

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var changedMonth = "";
    for (var i = 0; i < months.length; i++)
    {
        if(sliced[1] == months[i])
        {
            if (i + 1 < 10)
            {
              changedMonth = "0" + String(i+1);
            }
            else {
              changedMonth = String(i+1);
            }
        }
    }
    var datetime = sliced[3]+ "-" + changedMonth + "-" + sliced[2] + " " + sliced[4];
    // console.log("Picked date time: " + datetime)
    this.setState({time: datetime});
    this._hideDateTimePicker();
  };

  _addSchedules = () =>
  {
    var object = {
      scheduleID: this.state.scheduleID,
      name: this.state.name,
      time: this.state.time,
      repeatDays: this.state.repeatDays,
      commands: JSON.stringify(this.state.commands),
    };

    // console.log(JSON.stringify(object));

    let response = Utils.makeEboxServerRequest('/Schedules', 'POST', {
    name: this.state.name,
    time: this.state.time,
    repeatDays: this.state.repeatDays,
    commands: this.state.commands});
    if (response.status == "successful")
    {
        // console.log("Successfully add schedule: " + this.state.name);
    }
    else
    {
        // console.log(response);
        // console.log("Failed to add schedules");
    }
  }

  _getEbox = async() => {
    let response = await Utils.makeEboxServerRequest('/Schedules', 'GET', {})
    console.log(response['data'])
  }

  // {/* Modal Repeat Day */}
  _showRepeatDay = () => {
      this.setState({isChoosingRepeatDay:true});
  }

  _dismissRepeatDay = () => {
      this.setState({isChoosingRepeatDay:false, repeatDays: ""});
      console.log("Repeat Days cancel: " + this.state.repeatDays);
  }

  _confirmRepeatDay = () => {
    this.setState({isChoosingRepeatDay:false});
    console.log("Repeat Days: " + this.state.repeatDays);
  }

  // {/* Modal commands */}
  _showCommand = () => {
      this.setState({isChoosingCommand:true});
  }

  _dismissCommand = () => {
      this.setState({isChoosingCommand:false, commands: ""});
      console.log("Command cancel: " + this.state.commands);
  }

  _confirmCommand = () => {
    this.setState({isChoosingCommand:false});

    // Get eboxCommands mode,socketnum,
    var eboxIDs = Object.keys(this.state.eboxCommands); // Array of Ebox IDs
    // console.log("--------------------");
    // console.log(eboxIDs);
    // console.log("--------------------");
    for (var i = 0; i < eboxIDs.length; i++) {
      var eboxID = eboxIDs[i]
      var modeArray = this.state.eboxCommands[eboxID]
      for (var j = 0; j < modeArray.length; j++) {

        if (modeArray[j] == -1) {
          continue;
        }

        console.log("--------------------");
        this.state.commands.push({
          eboxID: eboxID,
          socketNum: j,
          mode: modeArray[j]})
      }
      console.log(this.state.commands);
    }

  }



  render(){
    if (this.state.eboxes.length == 0){
      return (
        <View>
          <Text>No Ebox found</Text>
        </View>)
    }

    var addedEboxIDs = Object.keys(this.state.eboxCommands);
    var notAddedEboxes = this.getNotScheduledEboxes();
    return(
      <View>
{/*
      {this.state.eboxes.map(ebox => {
        return (
            <Text key={ebox.id}>Ebox name: {ebox.name}</Text>
        )
      })}
      */}


        {/* Input Name*/}
        <Text>Schedule name: </Text>
        <TextInput style={styles.input}
          value= {this.state.name}
          onChangeText={ (text)=> this.setState({name:text}) }
        />

        {/* Choose Time*/}
        <TouchableOpacity
          onPress={this._showDateTimePicker.bind(this)}>
          <Text>Choose time </Text>
          <Text>{this.state.time}</Text>
        </TouchableOpacity>

        {/* Show DAYS checkboxes*/}
        <DateTimePicker
          mode = 'datetime'
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
        />

        <Modal
          visible={this.state.isChoosingRepeatDay}
          onRequestClose={()=>{}}>

          <View style={{marginTop: 22}}>

            <CheckboxGroup
            onSelect={(values) => {this.setState({repeatDays: values})}}
            checked = {[]}
            items={[
                {value: 0, label: 'Monday'},
                {value: 1, label: 'Tuesday'},
                {value: 2, label: 'Wednesday'},
                {value: 3, label: 'Thursday'},
                {value: 4, label: 'Friday'},
                {value: 5, label: 'Saturday'},
                {value: 6, label: 'Sunday'}
              ]} />

            {/* Confirm Repeat*/}
            <TouchableOpacity
              style={styles.button}
              onPress={this._confirmRepeatDay.bind(this)}>
                <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>

            {/* Cancel Repeat*/}
            <TouchableOpacity style={styles.button}
            onPress={this._dismissRepeatDay.bind(this)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Choose Repeat*/}
        <TouchableOpacity
          onPress={this._showRepeatDay.bind(this)}>
          <Text>Choose repeat </Text>
          <Text>{String(this.state.repeatDays)}</Text>
        </TouchableOpacity>


        {/* Modal for choosing Command*/}
        <Modal
          visible={this.state.isChoosingCommand}
          onRequestClose={()=>{}}>
          <View style={{marginTop: 50}}>

            {/* Choose Ebox, choose socket, choose mode*/}
            {addedEboxIDs.map(eboxID => {
              var eboxCommand = this.state.eboxCommands[eboxID]
              var eboxIDs = notAddedEboxes.slice();
              eboxIDs.push(eboxID);
              {/* Show Socket Name*/}
              return (
                <View key={eboxID}>
                  <Picker selectedValue={eboxID}
                    onValueChange={(newEboxID) => {
                      this.state.eboxCommands[newEboxID] = eboxCommand
                      delete this.state.eboxCommands[eboxID]
                      this.setState({})
                    }}>
                    {eboxIDs.map(eboxID => {
                      return (
                          <Picker.Item key={eboxID} label={this.getEboxName(eboxID)} value={eboxID} />
                      )})}
                  </Picker>
                  {/* Show Name of each Socket
                    console.log(this.state.eboxes[0].currentSocketNames[0]);*/}
                  <View style={{flexDirection:'row'}}>
                    {eboxCommand.map((mode,index)=>{
                      return (
                        <View key={eboxID+index} style={{flex: 1, flexDirection:'row'}}>

                          <Text style={{flex:1}} selectedValue={mode} onValueChange={(newMode) => {
                            this.state.eboxCommands[eboxID][index] = newMode
                            this.setState({})
                          }}> Socket {index+1}</Text>
                        </View>
                      )})}
                  </View>
                  {/* Show Mode of each Socket*/}
                  <View style={{flexDirection:'row'}}>
                    {eboxCommand.map((mode,index)=>{
                      return (
                        <View key={eboxID+index} style={{flex: 1, flexDirection:'row'}}>

                          <Picker style={{flex:1}} selectedValue={mode} onValueChange={(newMode) => {
                            this.state.eboxCommands[eboxID][index] = newMode
                            this.setState({})
                          }}>
                            <Picker.Item label="_" value={-1} />
                            <Picker.Item label="Off" value={0} />
                            <Picker.Item label="On" value={1} />
                          </Picker>
                        </View>
                      )})}
                  </View>
                </View>
              )})}

              {/* Confirm Repeat*/}
              <TouchableOpacity
                style={styles.button}
                onPress={this._confirmCommand.bind(this)}>
                  <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>

              {/* Cancel Repeat*/}
              <TouchableOpacity style={styles.button}
              onPress={this._dismissCommand.bind(this)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
          </View>
        </Modal>

        {/* Show ebox commands*/}
        <TouchableOpacity
        onPress={this._showCommand.bind(this)}>
  				<Text >Add commands</Text>
  			</TouchableOpacity>

        {/* Confirm Schedule */}
        <TouchableOpacity style={styles.button} onPress = {this._getEbox.bind(this)}>
  				<Text style = {styles.buttonText}>Confirm schedule</Text>
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

  input: {
    marginTop: 10,
    padding: 4,
    fontSize: 18
  }
});
