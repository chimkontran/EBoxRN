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
  ScrollView,
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
      status: "",
      repeatDays: [],
      repeatDaysLabel: [],
      commands: [],
      isChoosingRepeatDay: false,
      errorMess: "",
      isDateTimePickerVisible: false,
      eboxCommands: {},
      eboxCommandIdOrder: [],
      eboxCommandCounter: 0
    }

    Utils.makeEboxServerRequest('/Management', 'GET', {})
		.then(res => {
      this.setState({eboxes: res.data.eboxes,})
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
    this.setState({scheduleID: navigationParams.data._id})
    if (this.state.scheduleID != "")
    {
        this.setState({status: "checked"})
    }
    Object.assign(this.state, navigationParams.data)
    this.state.commands.map(command=>{
      if (command.eboxID in this.state.eboxCommands){
        this.state.eboxCommands[command.eboxID][command.socketNum] = command.mode
      }
      else {
        this.state.eboxCommands[command.eboxID] = [-1,-1,-1,-1]
        this.state.eboxCommandIdOrder.push(command.eboxID)
      }
    })
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
    console.log(notAddedEboxes)
    if (notAddedEboxes.length > 0){
      var eboxID = notAddedEboxes[0];
      var eboxName = this.getEboxName(eboxID)
      this.state.eboxCommands[eboxID] = [-1,-1,-1,-1]
      this.state.eboxCommandIdOrder.push(eboxID)
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

  
  _getSchedule = async() => {
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
    this.state.repeatDaysLabel = [];
    console.log("Repeat Days: " + this.state.repeatDays);
    var daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    this.state.repeatDaysLabel = this.state.repeatDays.map(repeatDay=>daysInWeek[repeatDay])
    this.setState({isChoosingRepeatDay:false});
    console.log(this.state.repeatDaysLabel)
  }

  // remove a command
  removeCommand = () => {}

  // {/* Confirm schedule commands */}
  async _confirmSchedule() {
    // Get eboxCommands mode,socketnum,
    var eboxIDs = Object.keys(this.state.eboxCommands); // Array of Ebox IDs

    for (var i = 0; i < eboxIDs.length; i++) 
    {
      var eboxID = eboxIDs[i]
      var modeArray = this.state.eboxCommands[eboxID]
      for (var j = 0; j < modeArray.length; j++) {

        if (modeArray[j] == -1) {
          continue;
        }

        this.state.commands.push({
          eboxID: eboxID,
          socketNum: j,
          mode: modeArray[j]});
      }
    }
    
    
        // console.log("--------------------");
        //   console.log(this.state.commands);


    // POST SCHEDULE
    try {
      var params = {
        scheduleID: this.state.scheduleID,
        name: this.state.name,
        time: this.state.time,
        repeatDays: this.state.repeatDays,
        commands: this.state.commands,
      }
      let res = await Utils.makeEboxServerRequest('/Schedules', 'POST', params)
      console.log(res);
      if (res.status == "successful"){
        console.log(params);
        this.props.navigation.state.params.refreshSchedules();
        this.props.navigation.goBack();
        console.log(this.props.navigation.state.params.refreshSchedules);
      } else if (res.status == "failed") {
        console.log(res.status);
        this.setState({errorMess: res.mess})

      }

    } catch(error) {
      console.log("error: " + error);
    }
  }

  _deleteSchedule = async () => {
      try
      {
        let res = await Utils.makeEboxServerRequest('/Schedules/Cancel', 'POST', {scheduleID: this.state.scheduleID})
        this.props.navigation.state.params.refreshSchedules();
        this.props.navigation.goBack();
        console.log(res);
      }
      catch(error)
      {
        this.setState({errorMess: 'Cannot connect to server. Delete failed!'})
      }
  }

  render(){
    if (this.state.eboxes.length == 0){
      return (
        <View>
          <Text>No Ebox found</Text>
        </View>)
    }

    var notAddedEboxes = this.getNotScheduledEboxes();
    console.log(this.state.eboxCommands)
    console.log(this.state.eboxCommandIdOrder)

    var deleteButton = []
    console.log(this.state.scheduleID)
    if(this.state.scheduleID != null)
    {
      deleteButton.push(
          <TouchableOpacity style={styles.button} onPress={this._deleteSchedule.bind(this)}>
            <Text style={styles.buttonText}>Delete schedule</Text>
          </TouchableOpacity>
      );
    }

    const eboxCommandsView = this.state.eboxCommandIdOrder.map((eboxID,pickerIndex) => {
              var _this = this;
              var eboxCommand = this.state.eboxCommands[eboxID]
              var eboxIDs = notAddedEboxes.slice();
              eboxIDs.push(eboxID);
              var updateEboxCommand = function(eboxID, eboxCommand){
                return function(newEboxID){
                  console.log(eboxID)
                  console.log(newEboxID)
                  delete _this.state.eboxCommands[eboxID]
                  var index = _this.state.eboxCommandIdOrder.indexOf(eboxID)
                  if (index !== -1 ){
                    console.log(index)
                    _this.state.eboxCommandIdOrder[index] = newEboxID
                  }
                  // console.log(this.state.eboxCommandIdOrder)
                  _this.state.eboxCommands[newEboxID] = eboxCommand
                  _this.setState({})
                
                }
              }
              {/* Show Socket Name*/}
              return (
                <View key={this.state.eboxCommandCounter++}>
                  <View style={{flexDirection:'row'}}>
                    <Picker selectedValue={eboxID} style={{width: 300}}
                      onValueChange={updateEboxCommand(eboxID,eboxCommand)}>
                      {eboxIDs.map(
                        (eboxIDChoice, i) => {
                          return (
                              <Picker.Item key={pickerIndex + "-" + i} label={this.getEboxName(eboxIDChoice) || "Unknown"} value={eboxIDChoice} />
                          )
                        })
                      }
                    </Picker>
                    <Button style={{height:50}}
                    title=" Del "
                    onPress={this.removeCommand()}
                    />
                  </View>
                  {/* Show Name of each Socket
                    console.log(this.state.eboxes[0].currentSocketNames[0]);*/}
                  <View style={{flexDirection:'row'}}>
                    {eboxCommand.map((mode,index)=>{
                      return (
                        <View key={pickerIndex+index} style={{flex: 1, flexDirection:'row'}}>

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
                        <View key={pickerIndex+index} style={{flex: 1, flexDirection:'row'}}>

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
              )})
    return(
      <ScrollView style={{flex:1}}>
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
          <Text>{String(this.state.repeatDaysLabel)}</Text>
        </TouchableOpacity>


        {/* Modal for choosing Command*/}
          <View style={{marginTop: 10}}>

            {/* Choose Ebox, choose socket, choose mode*/}
            {eboxCommandsView}
          </View>

        {/* Show ebox commands*/}
        <TouchableOpacity style={styles.button}
        onPress={this.addCommandView.bind(this)}>
  				<Text style={styles.buttonText}>Add commands</Text>
  			</TouchableOpacity>

        <Text style={styles.error}>{this.state.errorMess}</Text>

        {/* Confirm Schedule */}
        <TouchableOpacity style={styles.button} onPress = {this._confirmSchedule.bind(this)}>
  				<Text style={styles.buttonText}>Confirm schedule</Text>
  			</TouchableOpacity>

        {deleteButton}
      </ScrollView>
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

  input: {
    marginTop: 10,
    padding: 4,
    fontSize: 18
  }
});
