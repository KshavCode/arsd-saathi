import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';
import Attendance from './tab1/AttendanceTab';
import Details from './tab1/DetailsTab';
import Faculty from './tab1/FacultyTab';
import Home from './tab1/HomeTab';
import Login from './tab1/LoginTab';

const Stack = createStackNavigator();

export default function Stack1() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 2. Create a shared props object
    const themeProps = {
        isDarkMode,
        setIsDarkMode
    };

    return (
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            
            <Stack.Screen name="Home">
                {(props) => <Home {...props} {...themeProps} />}
            </Stack.Screen>

            <Stack.Screen name="Attendance">
                {(props) => <Attendance {...props} {...themeProps} />}
            </Stack.Screen>

            <Stack.Screen name="Details">
                {(props) => <Details {...props} {...themeProps} />}
            </Stack.Screen>

            <Stack.Screen name="Faculty">
                {(props) => <Faculty {...props} {...themeProps} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}