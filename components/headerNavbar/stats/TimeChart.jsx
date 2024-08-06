import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { BarChart } from "react-native-gifted-charts";
import LottieView from "lottie-react-native";

/**
 * Component for displaying a bar chart of time statistics based on different time intervals (day, month, year).
 * Uses the react-native-gifted-charts BarChart component for visualization.
 * @param {Object[]} stats - The statistics data to display on the chart.
 * @param {string} stats[].date - The date of the statistic entry.
 * @param {number} stats[].totalTime - The total time value associated with the statistic entry.
 * @returns {JSX.Element} TimeChart component.
 */
const TimeChart = ({ stats }) => {
    const [groupBy, setGroupBy] = useState("day");

    /**
     * Formats the statistics data based on the selected groupBy option (day, month, year).
     * @param {Object[]} stats - The statistics data to format.
     * @param {string} groupBy - The time interval to group data by (day, month, year).
     * @returns {Object[]} Formatted data suitable for the BarChart component.
     */
    const formatData = (stats, groupBy) => {
        if (groupBy === "day") {
            return stats.map(stat => ({
                value: stat.totalTime,
                label: new Date(stat.date).toLocaleDateString('en-GB').slice(0, 5),
            }));
        } else if (groupBy === "month") {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthlyData = stats.reduce((acc, stat) => {
                const month = new Date(stat.date).getMonth();
                if (!acc[month]) acc[month] = 0;
                acc[month] += stat.totalTime;
                return acc;
            }, {});

            return Object.keys(monthlyData).map(month => ({
                value: monthlyData[month],
                label: months[month],
            }));
        } else if (groupBy === "year") {
            const yearlyData = stats.reduce((acc, stat) => {
                const year = new Date(stat.date).getFullYear();
                if (!acc[year]) acc[year] = 0;
                acc[year] += stat.totalTime;
                return acc;
            }, {});

            return Object.keys(yearlyData).map(year => ({
                value: yearlyData[year],
                label: year.toString(),
            }));
        }
        return [];
    };

    const data = formatData(stats, groupBy);

    const insufficientData = data.length <= 1;

    return (
        <View style={{ alignItems: "center", backgroundColor: "#80808050", borderRadius: 5, paddingBottom: 10 }}>
            {/* Picker for selecting time interval (day, month, year) */}
            <Picker
                selectedValue={groupBy}
                style={{ height: 50, width: 200 }}
                onValueChange={(itemValue) => setGroupBy(itemValue)}
            >
                <Picker.Item label="Day" value="day" />
                <Picker.Item label="Month" value="month" />
                <Picker.Item label="Year" value="year" />
            </Picker>
            {/* Conditionally render LottieView animation if data is insufficient */}
            {insufficientData ? (
                <View style={{ alignItems: "center" }}>
                    <LottieView
                        source={require("../../../assets/animations/empty.json")}
                        loop
                        autoPlay
                        style={{
                            width: 300,
                            height: 100,
                            alignSelf: "center",
                        }}
                    />
                    <Text style={{ marginTop: 20 }}>Not enough data to display</Text>
                </View>
            ) : (
                // Render BarChart component with formatted data
                <ScrollView horizontal>
                    <BarChart
                        barWidth={22}
                        barBorderRadius={4}
                        frontColor="#FFA500"
                        data={data}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        noOfSections={4}
                        width={data.length * 50}
                        height={200}
                    />
                </ScrollView>
            )}
        </View>
    );
}

export default TimeChart;
