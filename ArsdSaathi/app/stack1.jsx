import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import Home from './tab1/HomeTab';
import Login from './tab1/LoginTab';

const Stack = createStackNavigator();

export default function Stack1() {
	return (
	    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
	    	<Stack.Screen name="Login" component={Login} />
	    	<Stack.Screen name="Home" component={Home} />
	    </Stack.Navigator>
	);
}

