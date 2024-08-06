import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { LineChart } from "react-native-gifted-charts";
import LottieView from "lottie-react-native";

/**
 * Formats statistics data based on the selected groupBy option.
 * @param {Array} stats - Array of statistics objects.
 * @param {string} groupBy - Grouping option ("day", "month", "year").
 * @returns {Array} Formatted data for LineChart component.
 */
const formatData = (stats, groupBy) => {
    if (groupBy === "day") {
        return stats.map(stat => ({
            value: stat.totalDistance,
            label: new Date(stat.date).toLocaleDateString('en-GB').slice(0, 5),
        })).filter(dataPoint => dataPoint.value !== undefined);
    } else if (groupBy === "month") {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyData = stats.reduce((acc, stat) => {
            const month = new Date(stat.date).getMonth();
            if (!acc[month]) acc[month] = 0;
            acc[month] += stat.totalDistance;
            return acc;
        }, {});

        return Object.keys(monthlyData).map(month => ({
            value: monthlyData[month],
            label: months[month],
        })).filter(dataPoint => dataPoint.value !== undefined);
    } else if (groupBy === "year") {
        const yearlyData = stats.reduce((acc, stat) => {
            const year = new Date(stat.date).getFullYear();
            if (!acc[year]) acc[year] = 0;
            acc[year] += stat.totalDistance;
            return acc;
        }, {});

        return Object.keys(yearlyData).map(year => ({
            value: yearlyData[year],
            label: year.toString(),
        })).filter(dataPoint => dataPoint.value !== undefined);
    }
    return [];
};

/**
 * Component for displaying a line chart of distance statistics grouped by day, month, or year.
 * Uses react-native-gifted-charts for visualization.
 * @component
 * @param {Object} props - Component props.
 * @param {Array} props.stats - Array of statistics data objects.
 * @returns {JSX.Element} DistanceChart component.
 */
export default function DistanceChart({ stats }) {
    const [groupBy, setGroupBy] = useState("day");

    const data = formatData(stats, groupBy);

    const insufficientData = data.length <= 1;

    return (
        <View style={{ alignItems: "center", backgroundColor: "#80808050", borderRadius: 5, paddingBottom: 10 }}>
            <Picker
                selectedValue={groupBy}
                style={{ height: 50, width: 200 }}
                onValueChange={(itemValue) => setGroupBy(itemValue)}
            >
                <Picker.Item label="Day" value="day" />
                <Picker.Item label="Month" value="month" />
                <Picker.Item label="Year" value="year" />
            </Picker>
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
                <ScrollView horizontal>
                    <LineChart
                        data={data}
                        initialSpacing={30}
                        spacing={70}
                        yAxisColor="#FFA500"
                        verticalLinesColor="#FFA50090"
                        xAxisColor="#FFA500"
                        color="#FFA500"
                        noOfSections={7}
                        width={data.length * 70}
                        height={200}
                    />
                </ScrollView>
            )}
        </View>
    );
}
