import React from 'react';
import {
	Text,
	TextInput,
	ScrollView,
	Button,
	Image,
	StyleSheet,
	View,
	Picker,
	Dimensions
} from 'react-native';
import { Bar, StockLine } from 'react-native-pathjs-charts'
import Moment from 'moment'

import Constants from 'eboxRN/src/Constants';
import Utils from 'eboxRN/src/utils/Utils';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f7f7f7',
	},
});

const CHART_TYPES = ['Ebox', 'device', 'hour', 'day', 'month']

const SCREEN_WIDTH = Dimensions.get('window').width

export default class ReportScreen extends React.Component {
	static navigationOptions = {
		tabBarIcon: ({ tintColor }) => (
		        <Image
		            source={Constants.images.reportIcon}
		            style={[Constants.styles.MainStyles.icon, {tintColor: tintColor}]}
		        />
	        ),
	}

	constructor(props){
		super(props)
		this.state = {
			numReportDays: 7,
			data: [],
			powerByHour: {},
			powerByDay: {},
			powerByMonth: {},
			powerByDevice: {},
			powerByEbox: {},
			powerThisMonth: 0,
			chartTypeIndex: 0,
			chartData: [],
			chartTitle: "Power consumption (kWh)",
			pricesData: [],
			suggestions: [],
			dataAvailable: false,
			loaded: false
		}
		this.fetchReportData = this.fetchReportData.bind(this)
		this.fetchEvnCost = this.fetchEvnCost.bind(this)
		this.updateChartData = this.updateChartData.bind(this)
	}

	updateChartData(chartTypeIndex){
		var dataSource = {};
		switch(chartTypeIndex){
			case 0:
				dataSource = this.state.powerByEbox
				break;
			case 1: 
				dataSource = this.state.powerByDevice
				break;
			case 2:
				dataSource = this.state.powerByHour
				break;
			case 3:
				dataSource = this.state.powerByDay
				break;
			case 4:
				dataSource = this.state.powerByMonth
				break;
			default:
				break;	
		}
		var chartData = [];
		Object.keys(dataSource).map(
			(name, i)=>{
				if (chartTypeIndex < 3){
					chartData.push([{
						v: dataSource[name] / 1000,
						name: name
					}])
				}
				else {
					if (chartData.length == 0) {
						chartData = [[]]
					}
					chartData[0].push({
						x: i,
						y: dataSource[name] / 1000,
						label: name
					})
				}
			}
		)
		if (chartTypeIndex >= 3 && chartData[0].length == 1){
			chartData[0].push({
				x: 0,
				y: 0,
				label: ""
			})
		}
		console.log(chartData)
		this.setState({
			chartData: chartData,
			chartTypeIndex: chartTypeIndex
		})
	}

	componentDidMount(){
		this.fetchReportData()
		this.fetchEvnCost()
		this.fetchSuggestions()
	}

	fetchReportData(){
		var numReportDays = parseInt(this.state.numReportDays);
		if (isNaN(numReportDays) || numReportDays < 1) numReportDays = 1
		if (numReportDays > 31) numReportDays = 31

		this.setState({
			loaded: false,
			numReportDays: numReportDays,
		})
		var date = Moment()
					.subtract(this.state.numReportDays,'d')
					.format("YYYY-MM-DD")
		console.log(date)
		Utils.makeEboxServerRequest('/Reports', 'GET', {date: date})
		.then(res => {
			console.log(res)
			if (res.successful){
				var powerByHour = this.state.powerByHour,
					powerByDay = this.state.powerByDay,
					powerByMonth = this.state.powerByMonth,
					powerByDevice = this.state.powerByDevice,
					powerByEbox = this.state.powerByEbox,
					dataAvailable = false,
					firstDate = -1;
				res.data.map((eboxData, i)=>{
					var eboxName = eboxData.name || "unknown"
					powerByEbox[eboxName] = 0
					eboxData.powerLogs.map(powerLog=>{
						var power = Math.round(parseFloat(powerLog.power))
						var deviceName = powerLog.deviceName || "unknown"
						var moment = Moment(powerLog.time).subtract(1,'hour')
						if (firstDate == -1) firstDate = moment
						var hour = moment.get('hour')
						var date = moment.format("DD-MM")
						var month = moment.format("MM-YYYY")
						
						powerByEbox[eboxName] += power
						
						powerByDevice[deviceName] = power + (powerByDevice[deviceName] || 0)

						powerByHour[hour] = power + (powerByHour[hour] || 0)

						powerByDay[date] = power + (powerByDay[date] || 0)

						powerByMonth[month] = power + (powerByMonth[month] || 0)
					})
					if (eboxData.powerLogs.length > 0) {
						dataAvailable = true
					}
				})

				if (dataAvailable){
					for (var hour = 0; hour < 24; hour++){
						if (!(hour in powerByHour)){
							powerByHour[hour] = 0;
						}
					}

					var days = Object.keys(powerByDay)
					if (days.length > 0){
						var startOfTomorrow = Moment().add(1,'day').startOf('day')
						for (var moment = firstDate.clone(); moment.isBefore(startOfTomorrow); moment.add(1,'day')){
							var day = moment.format("DD-MM")
							if (!(day in powerByDay)){
								powerByDay[day] = 0;
							}
						}
					}

					var months = Object.keys(powerByMonth)
					if (months.length > 0){
						var startOfNextMonth = Moment().add(1,'M').startOf('month')
						var thisMonth = Moment().format('MM-YYYY')
						for (var moment = firstDate.clone(); moment.isBefore(startOfNextMonth); moment.add(1,'M')){
							var month = moment.format("MM-YYYY")
							if (!(month in powerByMonth)){
								powerByMonth[month] = 0
							}
						}
						this.state.powerThisMonth = powerByMonth[thisMonth] / 1000
					}
					this.updateChartData(this.state.chartTypeIndex);
				}
				this.setState({
					data: res.data,
					loaded: true
				})
				// console.log(this.state)
			}
			else {
				console.log(res.error)
			}
		})
		.catch(err => {
			console.log(err)
		})
	}

	fetchEvnCost(){
		Utils.makeEboxServerRequest('/Reports/Prices', 'GET', {})
		.then(res=>{
			if (res.successful){
				this.setState({
					pricesData: res.data
				})
			}
			else {
				console.log(res.error)
			}
		})
		.catch(err=>{
			console.log(err)
		})
	}

	fetchSuggestions(){
		Utils.makeEboxServerRequest('/Reports/Suggestions', 'GET', {})
		.then(res=>{
			console.log(res)
			if (res.successful){
				this.setState({
					suggestions: res.data
				})
			}
			else {
				console.log(res.error)
			}
		})
		.catch(err=>{
			console.log(err)
		})
	}

	calculateBill(kWh){
		var pricesData = this.state.pricesData
		for (var i = pricesData.length - 1; i >= 0; i--){
			if (kWh >= pricesData[i].min){
				bill = kWh * pricesData[i].price
				var parts = bill.toString().split(".");
			    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
			    return [parts.join("."), pricesData[i].price];
			}
		}
		return [-1, -1]
	}

	render() {
		let barChartOptions = {
			width: SCREEN_WIDTH*0.8,
			height: 300,
			margin: {
				top: 20,
				left: 25,
				bottom: 50,
				right: 20
			},
			color: '#2980B9',
			gutter: 20,
			animate: {
				type: 'oneByOne',
				duration: 200,
				fillTransition: 3
			},
			axisX: {
				showAxis: true,
				showLines: true,
				showLabels: true,
				showTicks: true,
				zeroAxis: true,
				orient: 'bottom',
				label: {
					fontFamily: 'Arial',
					fontSize: 8,
					fontWeight: true,
					fill: '#34495E',
					rotate: 45
				}
			},
			axisY: {
				showAxis: true,
				showLines: true,
				showLabels: true,
				showTicks: true,
				zeroAxis: false,
				orient: 'left',
				label: {
					fontFamily: 'Arial',
					fontSize: 8,
					fontWeight: true,
					fill: '#34495E'
				}
			}
		}

		let lineChartOptions = {
			width: SCREEN_WIDTH*0.8,
			height: 300,
			color: '#2980B9',
			margin: {
				top: 20,
				left: 35,
				bottom: 30,
				right: 20
			},
			animate: {
				type: 'delayed',
				duration: 200
			},
			axisX: {
				showAxis: true,
				showLines: true,
				showLabels: true,
				showTicks: true,
				zeroAxis: false,
				orient: 'bottom',
				tickValues: [],
				labelFunction: ((i) => {
					var data = this.state.chartData[0][i]
					return data ? data.label : ""
				}),
				label: {
					fontFamily: 'Arial',
					fontSize: 8,
					fontWeight: true,
					fill: '#34495E'
				}
			},
			axisY: {
				showAxis: true,
				showLines: true,
				showLabels: true,
				showTicks: true,
				zeroAxis: false,
				orient: 'left',
				tickValues: [],
				label: {
					fontFamily: 'Arial',
					fontSize: 8,
					fontWeight: true,
					fill: '#34495E'
				}
			}
		}
		var billText = (<Text/>)
		if (this.state.powerThisMonth > 0 && this.state.pricesData.length>0){
			var costs = this.calculateBill(this.state.powerThisMonth)
			billText = (<Text>Cost: {costs[0]} VND ({costs[1]} VND/kWh)</Text>)
		}

		var chartView = (<View/>)
		if (this.state.loaded){
			if (this.state.chartData.length > 0){
				console.log(this.state.chartData)
				chartView = (<View>
		    					<Text>{this.state.chartTitle}</Text>
		    					{this.state.chartTypeIndex < 3 ?
		    						(<Bar data={this.state.chartData} options={barChartOptions} accessorKey='v'/>)
		    						:(<StockLine data={this.state.chartData} options={lineChartOptions} xKey='x' yKey='y' />)}

		    					<Text>Show data by: </Text>
		    					<Picker
									selectedValue={this.state.chartTypeIndex}
									onValueChange={(chartTypeIndex) => {
										this.updateChartData(chartTypeIndex)
									}}>
									{CHART_TYPES.map((chartType, i) => 
										<Picker.Item key={i} label={chartType} value={i} />
									)}
								</Picker>
		    					<Text>This month's consumption: {this.state.powerThisMonth} kWh</Text>
		    					{billText}
		    				</View>)
			}
			else {
				chartView = (<Text>No data available</Text>)
			}
		}
	    return (
	    	<ScrollView>
	    		<View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
	    			<Text>Get report for the previous </Text>
		    		<TextInput keyboardType='numeric'
			    		onChangeText={(numReportDays)=>{
			            	this.setState({numReportDays: numReportDays})
			            }
			        }>
		            	{this.state.numReportDays}
		            </TextInput>
		            <Text> days</Text>
	            </View>
	            <Button onPress={this.fetchReportData} title="Refresh" />
    			<Text>{this.state.loaded ? "": "Loading"}</Text>
    			{chartView}
    			{this.state.suggestions.length > 0 ?
    				<Text style={{fontWeight:"bold", marginTop: 10}}>
    					Suggestions
					</Text>
    				:<Text/>}
    			{this.state.suggestions.map(suggestion=>
    				<Text key={suggestion._id}>{suggestion.message}</Text>
				)}
	    	</ScrollView>);
    }
}
