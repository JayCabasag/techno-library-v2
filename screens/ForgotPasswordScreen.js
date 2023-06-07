import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { COLORS, IMAGES, RECOVERY_PASSWORD_SERVER_LINK } from '../utils/app_constants';
import { Dimensions } from 'react-native';
import { TextInput, Button} from 'react-native-paper';
import React, { useState } from 'react';
import { showMessage } from 'react-native-flash-message';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { collection, getDocs, setDoc, doc, limit, orderBy, query, where, addDoc, updateDoc} from 'firebase/firestore/lite';
import { Base64 } from 'js-base64'
import { db } from '../firebase/firebaseConfig'
import { base64 } from '@firebase/util';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function ForgotPasswordScreen({navigation}) {

  const [email, setEmail] = React.useState('')
  const [showRecoveryPasswordField, setShowRecoveryPasswordField] = useState(false)
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const goToSignIn = () => {
    navigation.navigate('Signin')
  }
  function isEmail(value) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
    return emailRegex.test(value);
  }
  const handleOnSendToMyEmail = () => {
    setIsAuthenticating(true)
    if(email === ''){
      setIsAuthenticating(false)
      return showMessage({
        message: `Please add an email address`,
        icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
        backgroundColor: COLORS.RED
      });
    }

    if(!isEmail(email)){
      setIsAuthenticating(false)
      return showMessage({
        message: `Email you provided is Invalid`,
        icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
        backgroundColor: COLORS.RED
      });
    }

    try {
      axios({
        method: 'post',
        url: RECOVERY_PASSWORD_SERVER_LINK,
        headers: {}, 
        data: {
          email: email,
        }
      }).then((response) => {
        if(response?.data?.success){
          setShowRecoveryPasswordField(true)
          setIsAuthenticating(false)
          return showMessage({
            message: response.data?.message ?? 'Please check your email',
            type: 'success'
          });
        }
        if(!response?.data?.success){
          setShowRecoveryPasswordField(false)
          setIsAuthenticating(false)
          return showMessage({
            message: response.data?.message ?? 'Ann error occured. Please try again later',
            icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
            backgroundColor: COLORS.RED
          });
        }
      })
    } catch (error) {
      setShowRecoveryPasswordField(false)
      setIsAuthenticating(false)
      return showMessage({
        message: `An error occured. Please try again later.`,
        icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
        backgroundColor: COLORS.RED
      });
    }
  }

  const handleResetPassword = async () => {
    if(recoveryPassword === ''){
      return showMessage({
        message: 'Please provide recovery password',
        icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
        backgroundColor: COLORS.RED
      });
    }

    if(newPassword === ''){
      return showMessage({
        message: 'Please a new password',
        icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
        backgroundColor: COLORS.RED
      });
    }

    if(newPassword?.length <= 6){
      return showMessage({
        message: 'Password should contain atleast 7 characters',
        icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
        backgroundColor: COLORS.RED
      });
    }

    const encodedBase64RecoveryPassword = base64.encodeString(recoveryPassword)

    const userref = query(collection(db, "users"), where("email", "==", email.toLocaleLowerCase()),  where("recovery_password", "==", encodedBase64RecoveryPassword));
    const querySnapshotForId = await getDocs(userref);
    let userDetails= []
    querySnapshotForId.forEach((doc) => {
      userDetails.push({docId: doc.id, ...doc.data()})
    });

    if(userDetails?.length <= 0){
      return showMessage({
        message: 'Recovery password is incorrect. Please check your email.',
        icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
        backgroundColor: COLORS.RED
      });
    }
    const currentUserData = userDetails?.[0]
    const currentUserRef = doc(db, "users", currentUserData?.docId ?? '');
    try {
      await updateDoc(currentUserRef, {
        password: base64.encodeString(newPassword)
      }).then(() => {
        return showMessage({
          message: 'Password updated successfully',
          type: 'success'
        });
      })
    } catch (error) {
      console.log(error)
      return showMessage({
        message: 'An error occured while updating your password. Please try again',
        icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
        backgroundColor: COLORS.RED
      });
    }
  }


  const recoveryPasswordJSX = () => {
    return (
      <View>
         <TextInput
          mode='outlined'
          label={'Recovery password'}
          value={recoveryPassword}
          onChangeText={text => setRecoveryPassword(text)}
          style={styles.inputField}
          selectionColor={COLORS.RED}
          outlineColor={COLORS.RED}
          underlineColor={COLORS.RED}
          placeholderTextColor={COLORS.RED}
          activeOutlineColor={COLORS.RED}
        />
         <TextInput
          mode='outlined'
          label={'New password'}
          value={newPassword}
          onChangeText={text => setNewPassword(text)}
          style={styles.inputField}
          selectionColor={COLORS.RED}
          outlineColor={COLORS.RED}
          underlineColor={COLORS.RED}
          placeholderTextColor={COLORS.RED}
          activeOutlineColor={COLORS.RED}
        />
      </View>
    )
  }


  return (
        <ScrollView
          style={styles.mainScrollbar}  
          showsHorizontalScrollIndicator={false} 
          showsVerticalScrollIndicator={false}
        >
           <View style={styles.bodyContainer}>
            <Image source={{uri: IMAGES.LOGIN_BANNER_IMAGE}}
              style={{width: 250, height: 250, borderRadius: 15}} /> 
              <View style={{height: 'auto', display: 'flex', alignContent: 'center', width: 320}}>
                <Text style={styles.loginText}>Forgot password</Text>
              </View>
              <View
              style={{display: 'flex', flexDirection:'column', paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center'}}
            >
              <TextInput
                  mode='outlined'
                  label={'Email'}
                  value={email}
                  onChangeText={text => setEmail(text)}
                  style={styles.inputField}
                  selectionColor={COLORS.RED}
                  outlineColor={COLORS.RED}
                  underlineColor={COLORS.RED}
                  placeholderTextColor={COLORS.RED}
                  activeOutlineColor={COLORS.RED}
                />

                {
                  showRecoveryPasswordField && (recoveryPasswordJSX())
                }
                {
                  showRecoveryPasswordField ? (<Button
                    mode="contained"
                    style={styles.signInButton}
                    color={COLORS.RED}
                    contentStyle={{paddingVertical: 10}}
                    onPress={handleResetPassword}
                  >
                    Reset password
                  </Button>) : 
                  (<Button
                    mode="contained"
                    style={styles.signInButton}
                    buttonColor={COLORS.RED}
                    contentStyle={{paddingVertical: 10}}
                    onPress={handleOnSendToMyEmail}
                    disabled={isAuthenticating}
                  >
                    Send to my Email
                  </Button>)
                }
                <View
                  style={{
                    borderBottomColor: 'black',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    marginTop: 25,
                    marginBottom: 25,
                    width: 320
                  }}
                />
                <View
                  style={{
                    marginTop: -45
                  }}
                >
                  <Text style={{backgroundColor: COLORS.WHITE, padding: 10, textTransform: 'uppercase', color :COLORS.GRAY, borderRadius: 15}}>or</Text>
                </View>
                <View 
                  style={{display: 'flex', flexDirection: 'row'}}
                >
                  <Text style={{color: COLORS.GRAY, fontSize: 14, fontWeight: '600'}}>Go back to </Text>
                  <TouchableOpacity
                    onPress={goToSignIn}
                  >
                    <Text style={{color: COLORS.RED, fontSize: 14, fontWeight: '600'}}> sign in </Text>
                  </TouchableOpacity>
                </View>
              </View>
           </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  mainScrollbar: {
    width: windowWidth,
    height: windowHeight,
    backgroundColor: COLORS.WHITE,
    display: 'flex',
    flexDirection: 'column'
  },
  bodyContainer: {
    height: 'auto', 
    display: 'flex',
    alignItems: 'center', 
    justifyContent: 'center',
    height: windowHeight
  },
  loginText: {
    color: COLORS.RED,
    fontWeight: '900',
    fontSize: 40
  },
  inputField: {
   marginTop: 10,
   width: 320,
   height: 60,
   backgroundColor: COLORS.WHITE
  },
  signInButton: {
    marginTop: 10, 
    width: 320
  },
  userTypeSelectorStudent: {
    flex: 1,
    marginRight: 1,
  },
  userTypeSelectorStudentActive: {
    flex: 1,
    marginRight: 1,
    backgroundColor: COLORS.RED
  },
  userTypeSelectorProfessor: {
    flex: 1,
    marginLeft: 1
  },
  userTypeSelectorProfessorActive: {
    flex: 1,
    backgroundColor: COLORS.RED,
    marginLeft: 1
  }
})

  