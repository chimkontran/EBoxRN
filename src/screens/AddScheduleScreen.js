import React, {Component} from 'react';
import {
  StyleSheet,
  AsyncStorage,
  Modal,
  ScrollView,
  View
} from 'react-native';
import {
  Container,
  Content,
  ListItem, 
  CheckBox,
  Picker,
  List,
  Text,
  Button,
  Form,
  Input,
  Label,
  Item,
  Icon
} from 'native-base';
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Moment from 'moment';

import Constants from 'eboxRN/src/Constants';
import Utils from 'eboxRN/src/utils/Utils';

const fullDaysInWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default class AddScheduleScreen extends React.Component {
  static navigationOptions = {
    title: "Schedule"
  }

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
    var daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    this.state.repeatDaysLabel = this.state.repeatDays.map(repeatDay=>daysInWeek[repeatDay])
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
      var newRepeatDays = fullDaysInWeek.map((day, i)=>false)
      this.state.repeatDays.map(day=>{newRepeatDays[day]=true})
      this.setState({isChoosingRepeatDay:true, newRepeatDays: newRepeatDays});
  }

  _dismissRepeatDay = () => {
      this.setState({isChoosingRepeatDay:false});
      ////console.log("Repeat Days cancel: " + this.state.repeatDays);
  }

  _confirmRepeatDay = () => {
    this.state.repeatDays = []
    this.state.newRepeatDays.map((checked,day)=>{
      if (checked) this.state.repeatDays.push(day)
    })
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
        <View  style={{flexDirection:'row', justifyContent:'flex-end'}}>
          <Button transparent danger
            onPress={this._deleteSchedule.bind(this)}>
            <Text>Delete schedule</Text>
          </Button>
          </View>
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
                <View key={this.state.eboxCommandCounter++} style={{margin:20}}>
                  <Text style={{fontWeight:'bold'}}>Command {pickerIndex + 1}</Text>
                  <View style={{flexDirection:'row'}}>
                    <Picker mode="dropdown" iosHeader="Choose EBox"
                      selectedValue={eboxID} style={{width: 300}}
                      onValueChange={updateEboxCommand(eboxID,eboxCommand)}>
                      {eboxIDs.map(
                        (eboxIDChoice, i) => {
                          return (
                              <Picker.Item key={pickerIndex + "-" + i} label={this.getEboxName(eboxIDChoice) || "Unknown"} value={eboxIDChoice} />
                          )
                        })
                      }
                    </Picker>
                    <Button danger transparent
                      onPress={this.removeCommand.bind(this, eboxID)}>
                        <Icon name='close' />
                    </Button>
                  </View>
                  
                  <View style={{flexDirection:'row'}}>
                    {eboxCommand.map((mode,index)=>{
                      return (
                        <View key={pickerIndex+index} style={{flex: 1, flexDirection:'row'}}>

                          <Picker style={{flex:1}} mode="dropdown"
                            iosHeader={"Socket mode"}
                            selectedValue={mode} onValueChange={(newMode) => {
                            this.state.eboxCommands[eboxID][index] = newMode
                            this.setState({})
                          }}>
                            <Item label="_" value={-1} />
                            <Item label="Off" value={0} />
                            <Item label="On" value={1} />
                          </Picker>
                        </View>
                      )})}
                  </View>
                </View>
              )})
    
    return(
      <Container>
        <Content>
          <ScrollView style={{flex:1}}>
            {deleteButton}
            {/* Input Name*/}
            <Form>
                <Item fixedLabel>
                    <Label>Schedule name: </Label>
                    <Input value= {this.state.name}
                      onChangeText={ (text)=> this.setState({name:text}) }/>
                </Item>
            </Form>

            {/* Choose Time*/}
            <Button transparent
              onPress={this._showDateTimePicker.bind(this)}>
              <Text style={{fontWeight:'bold'}}>Choose time </Text>
              <Text>{this.state.time}</Text>
            </Button>

            <DateTimePicker
              mode = 'datetime'
              date={Moment(this.state.time, "YYYY-MM-DD HH:mm:ss").toDate()}
              isVisible={this.state.isDateTimePickerVisible}
              onConfirm={this._handleDatePicked}
              onCancel={this._hideDateTimePicker}
            />

            {/* Show DAYS checkboxes*/}
            <Modal
              visible={this.state.isChoosingRepeatDay}
              onRequestClose={()=>{}}>

              <View style={{marginTop: 22}}>
                  {this.state.newRepeatDays.map((checked,day)=>
                      <ListItem key={day} onPress={()=>{
                          this.state.newRepeatDays[day] = !checked; 
                          this.setState({})
                      }}>
                          <CheckBox checked={checked} />
                          <Text> {fullDaysInWeek[day]}</Text>
                      </ListItem>
                  )}

                {/* Confirm Repeat*/}
                <Button full
                  onPress={this._confirmRepeatDay.bind(this)}>
                    <Text>Confirm</Text>
                </Button>

                {/* Cancel Repeat*/}
                <Button full transparent danger
                onPress={this._dismissRepeatDay.bind(this)}>
                  <Text>Cancel</Text>
                </Button>
              </View>
            </Modal>

            {/* Choose Repeat*/}
            <Button style={{marginTop: 10}} transparent
              onPress={this._showRepeatDay.bind(this)}>
              <Text style={{fontWeight:'bold'}}>Choose repeat days </Text>
              <Text>{String(this.state.repeatDaysLabel)}</Text>
            </Button>


            {/* Modal for choosing Command*/}
              <View style={{marginTop: 10}}>

                {/* Choose Ebox, choose socket, choose mode*/}
                {eboxCommandsView}
              </View>

            {/* Show ebox commands*/}
            <Button transparent
            onPress={this.addCommandView.bind(this)}>
      				<Text style={{color: Constants.colors.primary, fontWeight:'bold'}}>Add command</Text>
      			</Button>

            <Text style={{color:'red'}}>{this.state.errorMess}</Text>

            {/* Confirm Schedule */}
            <Button full onPress = {this._confirmSchedule.bind(this)}>
      				<Text>Confirm schedule</Text>
      			</Button>
          </ScrollView>
        </Content>
      </Container>
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

  input: {
    marginTop: 10,
    padding: 4,
    height: 40,
    fontSize: 18
  }
});
