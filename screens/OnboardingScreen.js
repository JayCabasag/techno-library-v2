import React from 'react'
import { SafeAreaView, StatusBar, Text, TouchableOpacity, View, Image} from 'react-native'
import { StyleSheet } from 'react-native';
import { COLORS, DEVELOPEMENT_STATE } from '../utils/app_constants';
import { FontAwesome } from '@expo/vector-icons';

export default function OnboardingScreen({navigation}) {
  
   return (
    <SafeAreaView style={{height: '100%'}}>
        <View style={styles.container}>
             <Image source={require('../assets/tcu_mobile_library.png')} style={{ width: 300, height: 300 }} />
            {
                DEVELOPEMENT_STATE === 'beta' && (<View style={{width: '100%', borderWidth: 1, padding: 20}}>
                    <Text style={{color: COLORS.WHITE}}>Note: This app is currently in beta test and accounts data you will created might be deleted during official release.</Text>
                </View>)
            }
            <View style={styles.onboardingMessageContainer}>
                <View style={styles.mainMessageContainer}>
                    <Text style={styles.onboardingMessageContainerText}>Study online</Text>
                    <Text style={styles.onboardingMessageContainerText}>In a traditional way</Text>
                </View>

                <View style={styles.submessageContainer}>
                    <Text style={{flex: 1, color: COLORS.WHITE, fontSize: 16, lineHeight: 30, letterSpacing: 1}}>Read books online easily via {'\n'}E-Library Management System</Text>
                    <View style={{backgroundColor: COLORS.LIGHT_WHITE, borderRadius: 10}}>
                        <TouchableOpacity style={{padding: 6}} onPress={() => navigation.navigate('Home')}>
                            <View style={styles.nextButton}>
                                <FontAwesome name="arrow-right" size={25} color="red" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
      paddingTop: StatusBar.currentHeight,
      backgroundColor: COLORS.RED,
      alignItems: 'center',
      justifyContent: 'flex-end',
      height: '100%',
      width: '100%',
      display: 'flex'
    },
    onboardingMessageContainer: {
      width: '100%',
      height: '50%',
      paddingHorizontal: 20,
      display: 'flex',
      justifyContent: 'flex-end',
      paddingBottom: 45
    },
    onboardingMessageContainerText: {
        color: COLORS.WHITE,
        fontSize: 30,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    mainMessageContainer: {
        marginBottom: 30
    },
    submessageContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    nextButton: {
        backgroundColor: COLORS.WHITE,
        height: 55,
        width: 55,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        width: 66,
        height: 58,
      },
  });
  