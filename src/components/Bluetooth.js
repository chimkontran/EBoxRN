import React, { Component } from 'react'
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Modal,
  ActivityIndicator,
  ToastAndroid,
  Image
} from 'react-native'

// import streams from 'iconv-lite'

import BluetoothSerial from 'react-native-bluetooth-serial'
import { Buffer } from 'buffer'

global.Buffer = Buffer
// const iconv = require('iconv-lite')

const Button = ({ title, onPress, style, textStyle }) =>
  <TouchableOpacity style={[ styles.button, style ]} onPress={onPress}>
    <Text style={[ styles.buttonText, textStyle ]}>{title.toUpperCase()}</Text>
  </TouchableOpacity>


const DeviceList = ({ devices, connectedId, showConnectedIcon, onDevicePress }) =>
  <ScrollView style={styles.container}>
    <View style={styles.listContainer}>
      {devices.map((device, i) => {
        return (
          <TouchableHighlight
            underlayColor='#DDDDDD'
            key={`${device.id}_${i}`}
            style={styles.listItem} onPress={() => onDevicePress(device)}>
            <View style={{ flexDirection: 'row' }}>
              {showConnectedIcon
              ? (
                <View style={{ width: 48, height: 48, opacity: 0.4 }}>
                  {connectedId === device.id
                  ? (
                    <Image style={{ resizeMode: 'contain', width: 24, height: 24, flex: 1 }} />
                  ) : null}
                </View>
              ) : null}
              <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontWeight: 'bold' }}>{device.name}</Text>
                <Text>{`<${device.id}>`}</Text>
              </View>
            </View>
          </TouchableHighlight>
        )
      })}
    </View>
  </ScrollView>

export default class BluetoothSerialExample extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isEnabled: false,
      discovering: false,
      devices: [],
      unpairedDevices: [],
      connected: false,
      section: 0
    }
  }

  componentWillMount () {
    Promise.all([
      BluetoothSerial.isEnabled(),
      BluetoothSerial.list()
    ])
    .then((values) => {
      const [ isEnabled, devices ] = values
      this.setState({ isEnabled, devices })
    })

    BluetoothSerial.on('bluetoothEnabled', () => console.log('Bluetooth enabled'))
    BluetoothSerial.on('bluetoothDisabled', () => console.log('Bluetooth disabled'))
    BluetoothSerial.on('error', (err) => console.log(`Error: ${err.message}`))
    BluetoothSerial.on('connectionLost', () => {
      if (this.state.device) {
        console.log(`Connection to device ${this.state.device.name} has been lost`)
      }
      this.setState({ connected: false })
    })
  }

  /**
   * [android]
   * request enable of bluetooth from user
   */
  requestEnable () {
    BluetoothSerial.requestEnable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => console.log(err.message))
  }

  /**
   * [android]
   * enable bluetooth on device
   */
  enable () {
    BluetoothSerial.enable()
    .then((res) => this.setState({ isEnabled: true }))
    .catch((err) => console.log(err.message))
    ToastAndroid.show('Ran', ToastAndroid.SHORT);
  }

  /**
   * [android]
   * disable bluetooth on device
   */
  disable () {
    BluetoothSerial.disable()
    .then((res) => this.setState({ isEnabled: false }))
    .catch((err) => console.log(err.message))
  }

  /**
   * [android]
   * toggle bluetooth
   */
  toggleBluetooth (value) {
    if (value === true) {
      this.enable()
    } else {
      this.disable()
    }
  }

  /**
   * [android]
   * Discover unpaired devices, works only in android
   */
  discoverUnpaired () {
    if (this.state.discovering) {
      return false
    } else {
      this.setState({ discovering: true })
      BluetoothSerial.discoverUnpairedDevices()
      .then((unpairedDevices) => {
        this.setState({ unpairedDevices, discovering: false })
      })
      .catch((err) => console.log(err.message))
    }
  }

  /**
   * [android]
   * Discover unpaired devices, works only in android
   */
  cancelDiscovery () {
    if (this.state.discovering) {
      BluetoothSerial.cancelDiscovery()
      .then(() => {
        this.setState({ discovering: false })
      })
      .catch((err) => console.log(err.message))
    }
  }

  /**
   * [android]
   * Pair device
   */
  pairDevice (device) {
    BluetoothSerial.pairDevice(device.id)
    .then((paired) => {
      if (paired) {
        console.log(`Device ${device.name} paired successfully`)
        const devices = this.state.devices
        devices.push(device)
        this.setState({ devices, unpairedDevices: this.state.unpairedDevices.filter((d) => d.id !== device.id) })
      } else {
        console.log(`Device ${device.name} pairing failed`)
      }
    })
    .catch((err) => console.log(err.message))
  }

  /**
   * Connect to bluetooth device by id
   * @param  {Object} device
   */
  connect (device) {
    this.setState({ connecting: true })
    BluetoothSerial.connect(device.id)
    .then((res) => {
      console.log(`Connected to device ${device.name}`)
      this.setState({ device, connected: true, connecting: false })
    })
    .catch((err) => console.log(err.message))
  }

  /**
   * Disconnect from bluetooth device
   */
  disconnect () {
    BluetoothSerial.disconnect()
    .then(() => this.setState({ connected: false }))
    .catch((err) => console.log(err.message))
  }

  /**
   * Toggle connection when we have active device
   * @param  {Boolean} value
   */
  toggleConnect (value) {
    if (value === true && this.state.device) {
      this.connect(this.state.device)
    } else {
      this.disconnect()
    }
  }

  /**
   * Write message to device
   * @param  {String} message
   */
  write (message) {
    if (!this.state.connected) {
      console.log('You must connect to device first')
    }

    BluetoothSerial.write(message)
    .then((res) => {
      console.log('Successfuly wrote to device')
      this.setState({ connected: true })
    })
    .catch((err) => console.log(err.message))
  }

  onDevicePress (device) {
    if (this.state.section === 0) {
      this.connect(device)
    } else {
      this.pairDevice(device)
    }
  }

  writePackets (message, packetSize = 64) {
    const toWrite = iconv.encode(message, 'cp852')
    const writePromises = []
    const packetCount = Math.ceil(toWrite.length / packetSize)

    for (var i = 0; i < packetCount; i++) {
      const packet = new Buffer(packetSize)
      packet.fill(' ')
      toWrite.copy(packet, 0, i * packetSize, (i + 1) * packetSize)
      writePromises.push(BluetoothSerial.write(packet))
    }

    Promise.all(writePromises)
    .then((result) => {
    })
  }

  render () {
    return (
      <View style={{ flex: 1 }}>
        <Button 
            title = "abc"
            onPress = {this.enable.bind(this)} 
            Text = "abc"></Button>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: '#F5FCFF'
  },
  topBar: { 
    height: 56, 
    paddingHorizontal: 16,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' ,
    elevation: 6,
    backgroundColor: '#7B1FA2'
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    color: '#FFFFFF'
  },
  enableInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tab: { 
    alignItems: 'center', 
    flex: 0.5, 
    height: 56, 
    justifyContent: 'center', 
    borderBottomWidth: 6, 
    borderColor: 'transparent' 
  },
  connectionInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25
  },
  connectionInfo: {
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: 18,
    marginVertical: 10,
    color: '#238923'
  },
  listContainer: {
    borderColor: '#ccc',
    borderTopWidth: 0.5
  },
  listItem: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderColor: '#ccc',
    borderBottomWidth: 0.5,
    justifyContent: 'center'
  },
  fixedFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },
  button: {
    height: 36,
    margin: 5,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#7B1FA2',
    fontWeight: 'bold',
    fontSize: 14
  },
  buttonRaised: {
    backgroundColor: '#7B1FA2',
    borderRadius: 2,
    elevation: 2
  }
})