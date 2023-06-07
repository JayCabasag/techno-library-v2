import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FavoritesTab from '../tabs/FavoritesTab';
import HomeTab from '../tabs/HomeTab';
import ExploreTab from '../tabs/ExploreTab';
import ProfileTab from '../tabs/ProfileTab';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/app_constants';

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
    return (
      <Tab.Navigator screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size}) => {
            let iconName;
            if (route.name === 'HomeTab') {
              iconName = focused ? 'ios-home' : 'ios-home-outline';
            } else if (route.name === 'ExploreTab') {
                iconName = focused ? 'md-search-circle' : 'md-search-circle-outline';
            } else if (route.name === 'FavoritesTab') {
                iconName = focused ? 'heart-circle' : 'heart-circle-outline';
            } else if (route.name === 'ProfileTab') {
              iconName = focused ? 'md-person-circle' : 'md-person-circle-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarLabel: ({ color }) => {
            let tabLabel;

            if (route.name === 'HomeTab') {
              tabLabel = 'Home'
            } else if (route.name === 'ExploreTab') {
              tabLabel = 'Explore'
            } else if (route.name === 'FavoritesTab') {
                tabLabel = 'Favorites'
            } else if (route.name === 'ProfileTab') {
                tabLabel = 'Profile'
            }
            // You can return any component that you like here!
            return <Text style={{color: color, paddingBottom: 10}}>{tabLabel}</Text>;
          },
          tabBarActiveTintColor: COLORS.RED,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {height: 65},
          headerShown: false,
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeTab} />
        <Tab.Screen name="ExploreTab" component={ExploreTab} />
        <Tab.Screen name="FavoritesTab" component={FavoritesTab} />
        <Tab.Screen name="ProfileTab" component={ProfileTab} />
      </Tab.Navigator>
    );
  }
  