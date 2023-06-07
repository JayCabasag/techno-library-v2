import { BottomSheet } from 'react-native-btr';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Appbar, Button, TextInput, Avatar} from 'react-native-paper';
import { COLORS, IMAGES } from '../utils/app_constants';
import React, {useState, useContext} from 'react';
import { UserContext } from '../context/UserContext';
import { showMessage } from 'react-native-flash-message';
import { Entypo } from '@expo/vector-icons';
import { Base64 } from 'js-base64';
import { updateDoc, doc, getDoc, query, collection, where, getDocs} from 'firebase/firestore/lite';
import { db } from '../firebase/firebaseConfig';
import { isValidUsername } from '../utils/helper';

const ProfileBottomSheet = ({navigation, showModal, handleToggleModal}) => {

  const [user] = useContext(UserContext)

  const [username, setUsername] = useState(user?.username ?? '')
  const [fullname, setFullname] = useState(user?.fullname ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')

  // Error handlers

  const [error, setError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isChangePassword, setIsChangePassword] = useState(false)
  
  const [showNewPassword, setShowNewPassword] = useState(true)
  const [showOldPassword, setShowOldPassword] = useState(true)

  const handleSaveUserData = async () => {
    setError(false)
    setSuccess(false)
    setIsAuthenticating(true)
    const userId = user?.docId ?? ''
    const userFullname = user?.fullname ?? ''
    const userUsername = user?.username ?? ''
    const userEmail = user?.email ?? ''

    let needUpdate = false

    if(!isChangePassword){
      const isSameUsername = username === userUsername
      const isSameFullname = fullname === userFullname
      const isSameEmail = email === userEmail
      needUpdate = !isSameUsername || !isSameFullname || !isSameEmail
    
      if(needUpdate){
        if(username === ''){
          setErrorMessage("Username is empty")
          setError(true)
          setIsAuthenticating(false)
          return
        }
        if(isValidUsername(username)){
          setErrorMessage("Username should have no space")
          setError(true)
          setIsAuthenticating(false)
          return
        }

        if(fullname === ''){
          setErrorMessage("Username is empty")
          setError(true)
          setIsAuthenticating(false)
          return
        }

        if(email === ''){
          setErrorMessage("Email is empty")
          setError(true)
          setIsAuthenticating(false)
          return
        }
        const validateEmail = (text) => {
          let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
          if (reg.test(text) === false) {
            return true;
          }
          else {
            return false
          }
        }

        if(validateEmail(email)){
          setErrorMessage("Email is invalid")
          setError(true)
          setIsAuthenticating(false)
          return
        }
        
        if(oldPassword === ''){
          setErrorMessage("Please provide your password")
          setError(true)
          setIsAuthenticating(false)
          return
        }
        
        if(!isSameUsername){
          const userRefs = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
          const querySnapshot = await getDocs(userRefs);
          let userList = []
          querySnapshot.forEach((doc) => {
              userList.push({docId: doc.id, ...doc.data()})
          });

          if(userList?.length > 0){
            const data = userList[0]
            if(data?.docId === userId){
              const userRef = doc(db, "users", userId)
              try {
                await updateDoc(userRef, {
                    username: username.toLowerCase()
                  }).then(() => {
                    setSuccessMessage("Information updated successfully. Please re login to get the most updated information")
                    setSuccess(true)
                    setIsAuthenticating(false)
                    return
                  })
                } catch (error) {
                  console.log(error)
                  setErrorMessage('Error updating your information.')
                  setError(true)
                  setIsAuthenticating(false)
                  return
              } 
            }

            if(!(data?.docId === userId)){
              setErrorMessage('This username is used by other users')
              setIsAuthenticating(false)
              setError(true)
              return
            }
          }

          const currentUserRef = doc(db, "users", userId)

          try {
            await updateDoc(currentUserRef, {
                username: username.toLowerCase()
              }).then(() => {
                setSuccessMessage("Information updated successfully. Please re login to get the most updated information")
                setSuccess(true)
                setIsAuthenticating(false)
              })
            } catch (error) {
              setErrorMessage('Error updating your password.')
              setError(true)
              setIsAuthenticating(false)
          }
          setIsAuthenticating(false)
          return
        }

        if(!isSameEmail){
          const userRefs = query(collection(db, "users"), where("email", "==", email.toLowerCase()));
          const querySnapshot = await getDocs(userRefs);
          let userList = []
          querySnapshot.forEach((doc) => {
              userList.push({docId: doc.id, ...doc.data()})
          });

          if(userList?.length > 0){
            const data = userList[0]
            const userRef = doc(db, "users", userId)
            if(data?.docId === userId){
              try {
                await updateDoc(userRef, {
                    email: email.toLowerCase()
                  }).then(() => {
                    setSuccessMessage("Information updated successfully. Please re login to get the most updated information")
                    setSuccess(true)
                    setIsAuthenticating(false)
                    return
                  })
                } catch (error) {
                  console.log(error)
                  setErrorMessage('Error updating your information.')
                  setError(true)
                  setIsAuthenticating(false)
                  return
              } 
            }
            if(!(data?.docId === userId)){
              setErrorMessage('This email is used by other users')
              setIsAuthenticating(false)
              setError(true)
              return
            }
            
            try {
              await updateDoc(userRef, {
                  email: email.toLowerCase()
                }).then(() => {
                  setSuccessMessage("Information updated successfully. Please re login to get the most updated information")
                  setSuccess(true)
                  setIsAuthenticating(false)
                  return
                })
              } catch (error) {
                console.log(error)
                setErrorMessage('Error updating your information.')
                setError(true)
                setIsAuthenticating(false)
                return
            } 
            setIsAuthenticating(false)
            return
          }
        }
        const currentUserRef = doc(db, "users", userId)

        try {
          await updateDoc(currentUserRef, {
              email: email.toLowerCase()
            }).then(() => {
              setSuccessMessage("Information updated successfully. Please re login to get the most updated information")
              setSuccess(true)
              setIsAuthenticating(false)
            })
          } catch (error) {
            setErrorMessage('Error updating your information.')
            setError(true)
            setIsAuthenticating(false)
        }
        setIsAuthenticating(false)
        return
      }
      
      if(!needUpdate){
        setSuccessMessage('All information is up to date')
        setSuccess(true)
        setIsAuthenticating(false)
      }
    }
    if(isChangePassword){
      if(newPassword === ''){
        setErrorMessage('Password should not be empty.')
        setError(true)
        setIsAuthenticating(false)
        return
      }
      if(newPassword?.length <= 7){
        setErrorMessage('New password contains atleast 8 letters.')
        setError(true)
        setIsAuthenticating(false)
        return
      }
      if(oldPassword === ''){
        setErrorMessage('Please add your password.')
        setError(true)
        setIsAuthenticating(false)
        return
      }

      if(oldPassword?.length <= 7){
        setErrorMessage('Password contains atleast 8 letters.')
        setError(true)
        setIsAuthenticating(false)
        return
      }
      const userRef = doc(db, "users", userId)
      
      try {
        const docSnap = await getDoc(userRef)
        if (docSnap.exists()) {  
          const convertedFromBase64Password = Base64.decode(docSnap?.data()?.password ?? '')
          if(convertedFromBase64Password !== oldPassword){
            setErrorMessage('Password is incorrect.')
            setError(true)
            setIsAuthenticating(false)
            return
          }
          try {
            await updateDoc(userRef, {
                password: Base64.encode(newPassword)
              }).then(() => {
                setSuccessMessage("Password updated successfully.")
                setSuccess(true)
                setIsAuthenticating(false)
              })
            } catch (error) {
              setErrorMessage('Error updating your password.')
              setError(true)
              setIsAuthenticating(false)
          }   
        } else {
          setErrorMessage('Password is incorrect.')
          setError(true)
          setIsAuthenticating(false)
        }
      } catch (error) {
        setErrorMessage('Please check your internet connection')
        setError(true)
        setIsAuthenticating(false)
      }
    }
  }

  const toggleChangeSettingType = async () => {
    setIsChangePassword(prevState => !prevState)
  }
   return (
    <BottomSheet
          visible={showModal}
          onBackButtonPress={handleToggleModal}
          onBackdropPress={handleToggleModal}
        >
          <View style={styles.bottomNavigationView}>
            <Text
                style={{
                  textAlign: 'center',
                  padding: 20,
                  fontSize: 22,
                }}>
                Account settings
              </Text>
              
              <ScrollView style={{width: '100%', paddingHorizontal: 22}} showsVerticalScrollIndicator={false}>
                <View style={{ flex: 1, flexDirection: 'column', height: 'auto', display: 'flex'}}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Text style={{fontWeight: 'bold', fontSize: 20}}>Edit profile</Text>
                  <Button buttonColor={COLORS.RED} mode='contained' onPress={toggleChangeSettingType}>{isChangePassword ? 'Edit information' : 'Change password'}</Button>
                </View>
                {
                  success && <View style={{display: 'flex', flexDirection: 'row', paddingVertical: 15, paddingHorizontal: 5, color: 'rgb(30, 70, 32)', backgroundColor: 'rgb(237, 247, 237)', borderRadius: 10, marginTop: 10}}>
                  <Entypo name='check' size={20} color={'rgb(30, 70, 32)'} style={{marginHorizontal: 10}}/>
                  <Text style={{width: 280}}>{successMessage}</Text>
                </View>
                }

                {
                  error && <View style={{display: 'flex', flexDirection: 'row', paddingVertical: 15,paddingHorizontal: 5,color: 'rgb(95, 33, 32)', backgroundColor: 'rgb(253, 237, 237)', borderRadius: 10, marginTop: 10}}>
                   <Entypo name='info' size={16} color={'rgb(95, 33, 32)'} style={{marginHorizontal: 10}}/>
                  <Text style={{width: '100%'}}>{errorMessage}</Text>
                </View>
                }
                {
                  !isChangePassword && (
                    <View>
                    <TextInput
                      mode='outlined'
                      label={'Username'}
                      value={username}
                      onChangeText={text => setUsername(text)}
                      style={styles.inputField}
                      selectionColor={COLORS.RED}
                      outlineColor={COLORS.RED}
                      underlineColor={COLORS.RED}
                      placeholderTextColor={COLORS.RED}
                      activeOutlineColor={COLORS.RED}
                    />
                      <TextInput
                        mode='outlined'
                        label={'Fullname'}
                        value={fullname}
                        onChangeText={text => setFullname(text)}
                        style={styles.inputField}
                        selectionColor={COLORS.RED}
                        outlineColor={COLORS.RED}
                        underlineColor={COLORS.RED}
                        placeholderTextColor={COLORS.RED}
                        activeOutlineColor={COLORS.RED}
                      />
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
                    </View>
                  )
                }
                {
                  isChangePassword && ( <TextInput
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
                    secureTextEntry={showNewPassword}
                    right={<TextInput.Icon style={{height: 60, marginTop: 15}} icon={showNewPassword ?'eye-off' : 'eye' } onPress={() => setShowNewPassword(prevState => !prevState)}/>}
                  />)
                }

                 <TextInput
                  mode='outlined'
                  label={'Password'}
                  value={oldPassword}
                  onChangeText={text => setOldPassword(text)}
                  style={styles.inputField}
                  selectionColor={COLORS.RED}
                  outlineColor={COLORS.RED}
                  underlineColor={COLORS.RED}
                  placeholderTextColor={COLORS.RED}
                  activeOutlineColor={COLORS.RED}
                  secureTextEntry={showOldPassword}
                  right={<TextInput.Icon style={{height: 60, marginTop: 15}} icon={showOldPassword ?'eye-off' : 'eye' } onPress={() => setShowOldPassword(prevState => !prevState)}/>}
                />
                <View style={{marginVertical: 30}}>
                    <Button 
                      onPress={handleSaveUserData} 
                      icon="folder" 
                      mode="contained" 
                      contentStyle={{padding: 5}} 
                      style={{marginTop: 15, backgroundColor: COLORS.RED
                      }}
                      disabled={isAuthenticating}
                      >
                        Save
                    </Button>
                    <Button mode="outlined" color={COLORS.RED} activeOutlineColor={COLORS.RED} style={{marginTop: 15, backgroundColor: COLORS.WHITE}} contentStyle={{padding: 5}} onPress={handleToggleModal}>
                        <Text style={{color: COLORS.RED}}>CANCEL</Text>
                    </Button>
                </View>
                </View>
              </ScrollView>
          </View>
        </BottomSheet>
  )
}

export default ProfileBottomSheet

const styles = StyleSheet.create({
    container: {
      flex: 1,
      margin: 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E0F7FA',
      
    },
    bottomNavigationView: {
      backgroundColor: COLORS.WHITE,
      width: '100%',
      height: '70%',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15
    },
    inputField: {
      marginTop: 10,
      width: '100%',
      hegiht: 60,
      backgroundColor: COLORS.WHITE
     },
  });
  