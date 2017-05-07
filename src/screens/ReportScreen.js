import React from 'react';
import {
	Text,
	ScrollView,
	Button,
	Image,
	View,
	TouchableOpacity,
	StyleSheet
} from 'react-native';
import Utils from 'eboxRN/src/utils/Utils';
import DateTimePicker from 'react-native-modal-datetime-picker';
import ChartView from 'react-native-highcharts';

export default class ReportScreen extends React.Component {
	static navigationOptions = {
		tabBar: {
			icon: ({ tintColor }) => (
		        <Image
		            source={Constants.images.reportIcon}
		            style={[Constants.styles.MainStyles.icon, {tintColor: tintColor}]}
		        />
	        ),
		}
	};

	constructor()
	{
		super();

		this.state = {
			date: "",
			isDateTimePickerVisible: false,
			objectData: {},
			objectDataArray: [],
			id: [],
			powerCons: [],
			chartData: [],
			chartDate: [],
		}
	}

	_showDateTimePicker = () => this.setState({ isDateTimePickerVisible: true });

 	_hideDateTimePicker = () => this.setState({ isDateTimePickerVisible: false });

	_handleDatePicked = (date) => {
		this.setState({chartData: [], objectDataArray: []})
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
		var datetime = sliced[3]+ "-" + changedMonth + "-" + sliced[2];
		console.log("Picked date time: " + datetime)
		this.setState({date: datetime});
		var report = this._getReport();
		this._hideDateTimePicker();
	};

	_getReport = async () => {
		var date = this.state.date;
		var request = '/Report?date=' + date
		console.log("Getting report ...");
		var response = await Utils.makeEboxServerRequest('/Reports?', 'GET', {date: date});
		console.log("Finish getting report, waiting to display response");
		if (response.successful)
		{
			console.log(response)
			this.setState({objectData: response.data});
			for (var i = 0; i < response['data']['length']; i++)
			{
				this.state.objectDataArray.push(this.state.objectData[i]);
			}
			this.setState({});
			console.log("Object Data Array: " + this.state.objectDataArray[0]);
			this._processResponseObject();
		}
		else
		{
			console.log("Failed to fetch report");
			console.log(response);
		}
	}

	_processResponseObject = () => {
		var array = this.state.objectDataArray[0];
		console.log(JSON.stringify(array))
		
		for (var i = 0; i < array['powerLogs']['length']; i++)
		{	
			if (array['powerLogs'][String(i)]['deviceName'] == 'quat')
			{
				this.state.chartData.push(Array(Number(new Date(array['powerLogs'][String(i)]['time'])), Number(array['powerLogs'][String(i)]['power'])));
			}
		}
		this.setState({});
		console.log('Chart Data: ' + JSON.stringify(this.state.chartData))
	}

	render() {
		var Highcharts='Highcharts';
		var conf={
            chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE 
                marginRight: 30,
            },
            title: {
                text: 'Power Usage'
            },
            xAxis: {
                type: 'datetime',
            },
            yAxis: {
				type: 'number',
                title: {
                    text: 'W'
                },
				tickPixelInterval: 5,
                plotLines: [{
                    value: 0,
                    width: 3,
                    color: '#808080'
                }]
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.state.chartData[0].name + '</b><br/>' +
                        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                        Highcharts.numberFormat(this.y, this.state.chartData.length);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: 'Random data',
                data: this.state.chartData,
            }]
        }; 
	    return (
			<View> 
				<DateTimePicker
					mode = 'date'
					isVisible={this.state.isDateTimePickerVisible}
					onConfirm={this._handleDatePicked}
					onCancel={this._hideDateTimePicker}
				/>
	
				<TouchableOpacity
				onPress={this._showDateTimePicker.bind(this)}>
					<Text> Choose date </Text>
					<Text>{this.state.date}</Text>
				</TouchableOpacity>

				<ChartView style={{height:300}} config={conf}></ChartView>
			</View>
		);
    }
}