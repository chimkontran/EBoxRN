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
import Moment from 'moment';
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
      newRepeatDays: [],
      repeatDaysLabel: [],
      commands: [],
      isChoosingRepeatDay: false,
      errorMess: "",
      isDateTimePickerVisible: false,
      eboxCommands: {},
      eboxCommandIdOrder: [],
      eboxCommandCounter: 0
    }
  }

  componentDidMount(){
    // get DATA
    var navigationParams = this.props.navigation.state.params
    this.setState({
      scheduleID: navigationParams.data._id || "",
    })
    Object.assign(this.state, navigationParams.data)
    if (!this.state.time){
      this.state.time = Moment().format('YYYY-MM-DD HH:mm:ss')
    }
    this._confirmRepeatDay()
    this.state.commands.map(command=>{
      if (!(command.eboxID in this.state.eboxCommands)){
        this.state.eboxCommands[command.eboxID] = [-1,-1,-1,-1]
        this.state.eboxCommandIdOrder.push(command.eboxID)
      }
      this.state.eboxCommands[command.eboxID][command.socketNum] = command.mode
    })
    Utils.makeEboxServerRequest('/Management', 'GET', {})
    .then(res => {
      this.setState({eboxes: res.data.eboxes})
      if (this.state.eboxCommandIdOrder.length == 0){
        this.addCommandView()
      }
    })
    .catch(err => {
      ////console.log(err)
    })
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
    ////console.log(notAddedEboxes)
    if (notAddedEboxes.length > 0){
      var eboxID = notAddedEboxes[0];
      var eboxName = this.getEboxName(eboxID)
      this.state.eboxCommands[eboxID] = [-1,-1,-1,-1]
      this.state.eboxCommandIdOrder.push(eboxID)
      this.setState({})
      // ////console.log("added");
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
    this.setState({time: Moment(date).format("YYYY-MM-DD HH:mm:ss")});
    this._hideDateTimePicker();
  };

  
  _getSchedule = async() => {
    let response = await Utils.makeEboxServerRequest('/Schedules', 'GET', {})
    ////console.log(response['data'])
  }

  // {/* Modal Repeat Day */}
  _showRepeatDay = () => {
      this.setState({isChoosingRepeatDay:true, newRepeatDays: this.state.repeatDays});
  }

  _dismissRepeatDay = () => {
      this.setState({isChoosingRepeatDay:false});
      ////console.log("Repeat Days cancel: " + this.state.repeatDays);
  }

  _confirmRepeatDay = () => {
    this.state.repeatDays = this.state.newRepeatDays
    this.state.repeatDaysLabel = [];
    var daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    this.state.repeatDaysLabel = this.state.repeatDays.map(repeatDay=>daysInWeek[repeatDay])
    this.setState({isChoosingRepeatDay:false});
  }

  // remove a command
  removeCommand(eboxID){
    if (eboxID in this.state.eboxCommands){
      ////console.log(eboxID)
      delete this.state.eboxCommands[eboxID]
      var index = this.state.eboxCommandIdOrder.indexOf(eboxID)
      this.state.eboxCommandIdOrder.splice(index, 1)
      this.setState({})
    }
  }

  // {/* Confirm schedule commands */}
  async _confirmSchedule() {
    // Get eboxCommands mode,socketnum,
    this.setState({
      commands: [],
      errorMess: ""
    })
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
      if (res.status == "successful"){
        this.props.navigation.state.params.refreshSchedules();
        this.props.navigation.goBack();
      } else if (res.status == "failed") {
        this.setState({errorMess: res.mess})

      }

    } catch(error) {
      ////console.log("error: " + error);
    }
  }

  _deleteSchedule = async () => {
      try
      {
        let res = await Utils.makeEboxServerRequest('/Schedules/Cancel', 'POST', {scheduleID: this.state.scheduleID})
        if (res.status == "successful"){
          this.props.navigation.state.params.refreshSchedules();
          this.props.navigation.goBack();
        }
        // ////console.log(res);
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
    ////console.log(this.state.eboxCommands)
    ////console.log(this.state.eboxCommandIdOrder)

    var deleteButton = (<View/>)
    ////console.log(this.state.scheduleID)
    if(this.state.scheduleID)
    {
      deleteButton = (
          <TouchableOpacity style={styles.button, {backgroundColor: 'transparent'}} 
            onPress={this._deleteSchedule.bind(this)}>
            <Text style={{color:'#48BBEC', textAlign:'right', margin: 20}}>Delete schedule</Text>
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
                  delete _this.state.eboxCommands[eboxID]
                  var index = _this.state.eboxCommandIdOrder.indexOf(eboxID)
                  if (index !== -1 ){
                    _this.state.eboxCommandIdOrder[index] = newEboxID
                  }
                  _this.state.eboxCommands[newEboxID] = eboxCommand
                  _this.setState({})
                
                }
              }
              
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
                    <TouchableOpacity style={{width: 30, alignItems:'center',justifyContent:'center', marginLeft:20}}
                        onPress={this.removeCommand.bind(this, eboxID)}>
                        <Text style={{}}>X</Text>
                    </TouchableOpacity>
                  </View>
                  
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
        {deleteButton}
        {/* Input Name*/}
        <Text style={{fontWeight:'bold'}}>Schedule name: </Text>
        <TextInput style={styles.input}
          value= {this.state.name}
          onChangeText={ (text)=> this.setState({name:text}) }
        />

        {/* Choose Time*/}
        <TouchableOpacity
          onPress={this._showDateTimePicker.bind(this)}>
          <Text style={{fontWeight:'bold'}}>Choose time </Text>
          <Text>{this.state.time}</Text>
        </TouchableOpacity>

        {/* Show DAYS checkboxes*/}
        <DateTimePicker
          mode = 'datetime'
          date={Moment(this.state.time, "YYYY-MM-DD HH:mm:ss").toDate()}
          isVisible={this.state.isDateTimePickerVisible}
          onConfirm={this._handleDatePicked}
          onCancel={this._hideDateTimePicker}
        />

        <Modal
          visible={this.state.isChoosingRepeatDay}
          onRequestClose={()=>{}}>

          <View style={{marginTop: 22}}>

            <CheckboxGroup
            onSelect={(values) => {this.setState({newRepeatDays: values})}}
            checked = {this.state.newRepeatDays}
            items={[
                {value: 0, label: 'Sunday'},
                {value: 1, label: 'Monday'},
                {value: 2, label: 'Tuesday'},
                {value: 3, label: 'Wednesday'},
                {value: 4, label: 'Thursday'},
                {value: 5, label: 'Friday'},
                {value: 6, label: 'Saturday'}
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
          <Text style={{fontWeight:'bold'}}>Choose repeat days</Text>
          <Text>{String(this.state.repeatDaysLabel)}</Text>
        </TouchableOpacity>


        {/* Modal for choosing Command*/}
          <View style={{marginTop: 10}}>

            {/* Choose Ebox, choose socket, choose mode*/}
            {eboxCommandsView}
          </View>

        {/* Show ebox commands*/}
        <TouchableOpacity style={[styles.button, {backgroundColor:'transparent'}]}
        onPress={this.addCommandView.bind(this)}>
  				<Text style={[styles.buttonText, {color: '#3f51b5'}]}>Add command</Text>
  			</TouchableOpacity>

        <Text style={styles.error}>{this.state.errorMess}</Text>

        {/* Confirm Schedule */}
        <TouchableOpacity style={styles.button} onPress = {this._confirmSchedule.bind(this)}>
  				<Text style={styles.buttonText}>Confirm schedule</Text>
  			</TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: '#3f51b5',
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
    height: 40,
    fontSize: 18
  }
});
