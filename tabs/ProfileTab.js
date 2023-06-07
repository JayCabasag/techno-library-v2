import React, { useContext, useState} from 'react'
import { View, Text, StyleSheet, StatusBar, ScrollView, Dimensions, TouchableOpacity} from 'react-native'
import { Appbar, Avatar, Button, List, Provider, Portal, Modal, IconButton } from 'react-native-paper'
import { COLORS, IMAGES } from '../utils/app_constants'
import ProfileBottomSheet from './ProfileBottomSheet'
import { Feather} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment'
import { UserContext } from '../context/UserContext'
import { collection, getDocs, query, where, doc, updateDoc} from 'firebase/firestore/lite';
import { db } from '../firebase/firebaseConfig'


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const ProfileTab = ({navigation}) => {

  const [showModal, setShowModal] = React.useState(false)
  const [user, setUser] = useContext(UserContext)
  const dateAccountCreated = user?.createdAt ?? '20-11-2022'
  const [avatarList, setAvatarList] = useState([])
  const [favoriteBookList, setFavoriteBookList] = useState([])

  const [profilePhoto, setProfilePhoto] = useState(user?.photoUrl ?? IMAGES?.DEFAULT_PHOTO_URL)

  const formattedDateFromFirestore = new Date(dateAccountCreated.seconds * 1000 + dateAccountCreated.nanoseconds/1000000)
  const handleToggleModal = () => {
    setShowModal((prevState) => !prevState)
  }

  React.useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem('@library_management_app_user_data')
        if(value !== null) {
          setUser(JSON.parse(value))
        }
      } catch(e) {
        // error reading value
      }
    }
    getData()
    
    const getAvailableAvatars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "avatars"));
        let avatarList = []
        querySnapshot.forEach((doc) => {
          const data =  {docId: doc.id,... doc.data()}
          avatarList.push(data)
        });
        setAvatarList(avatarList)
      } catch (error) {
        console.log(error)
      }
    }
    getAvailableAvatars()
  }, [])
  
  const handleSignOut = async () => {
    await AsyncStorage.clear().then(() => {
      setUser()
      navigation.navigate('Signin')
    })
  }

  React.useEffect(() => {
    const getUserBookFavorites = async () => {
      const userReference = `users/${user?.docId}`
      const favoriteRefs = query(collection(db, "favorites"), where("user", "==", userReference));
      const querySnapshot = await getDocs(favoriteRefs);
      let userFavoriteList = []
      querySnapshot.forEach((doc) => {
        userFavoriteList.push({favoriteId: doc.id, ...doc.data()})
     });
     setFavoriteBookList([...userFavoriteList])
    }
    getUserBookFavorites()
  }, [])

  const [visible, setVisible] = React.useState(false);

  const showChangeAvatarModal = () => setVisible(true);
  const hideChangeAvatarModal = () => setVisible(false);
  const containerStyle = {backgroundColor: 'white', margin: 20, paddingBottom: 20, paddingTop: 20, paddingLeft: 20, paddingRight: 20, borderRadius: 15};


  const handleUpdateAvatar = async (avatar) => {
    const avatarPhotoUrl = avatar?.url ?? IMAGES?.DEFAULT_PHOTO_URL
    const userId = user?.docId ?? ''
    const userRef = doc(db, "users", userId)
    try {
      await updateDoc(userRef, {
        photoUrl: avatarPhotoUrl
      }).then(() => {
        setProfilePhoto(avatarPhotoUrl)
        hideChangeAvatarModal()  
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
     <Provider>
      <Portal>
        <Modal visible={visible} onDismiss={hideChangeAvatarModal} contentContainerStyle={containerStyle}>
          <View
           style={{
            display: "flex", 
            flexDirection: 'row',
            width: "100%",
            alignItems: 'center',
            justifyContent: 'space-between'
           }}
          >
            <Text style={{paddingVertical: 10, fontWeight: "800"}}>Select an avatar: </Text>
            <IconButton 
              icon={"close"}
              onPress={hideChangeAvatarModal}
              style={{
                marginRight: -5,
                marginTop: -10
              }}
            />
          </View>
          <ScrollView
            style={{
              marginTop: 10
            }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            horizontal={true}
          >
            {
              avatarList?.map((avatar, index) => {
                return <TouchableOpacity  key={index} onPress={() => handleUpdateAvatar(avatar)}>
                    <Avatar.Image size={70} source={{uri: avatar?.url ?? IMAGES.NO_IMAGE_AVAILABLE}}/>
                  </TouchableOpacity>
              })
            }
          </ScrollView>
          <Button 
            mode='contained' 
            style={{marginTop: 15}}
            buttonColor={COLORS.RED}
            onPress={hideChangeAvatarModal}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        > 
          <Appbar.Header style={{backgroundColor: COLORS.RED, display: 'flex', alignItems: 'center'}} >
            <Appbar.BackAction onPress={() => {navigation.goBack()}} size={23} color={COLORS.WHITE}/>
            <Text style={{flex: 1, textAlign: 'center', fontSize: 21, color: COLORS.WHITE, fontWeight: '700'}}>Profile</Text>
            <Button onPress={handleToggleModal} color={COLORS.RED}>
              <Feather name="settings" size={20} color={COLORS.WHITE}/>
            </Button>
          </Appbar.Header>
          <View style={{justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.RED, height: 150, flex: 1, paddingBottom: 20}}>
            <View
              style={{
                display: 'flex', 
                flexDirection: 'row',
                width: windowWidth,
                marginLeft: 40
              }}
            >
              <Avatar.Image size={120} source={{uri: profilePhoto}} />
              <View style={{marginLeft: 10, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 'auto'}}>
                <View>
                  <Text style={{color: COLORS.WHITE, fontSize: 20, marginRight: 10, textTransform: 'capitalize'}}>{user?.fullname ?? 'Not set'}</Text>
                  <Button
                  mode='contained' 
                  buttonColor={COLORS.WHITE} 
                  style={{marginTop: 10}} 
                  labelStyle={{fontSize: 12, color: COLORS.RED, padding: 0}}
                  onPress={showChangeAvatarModal}
                  >
                    Change avatar
                  </Button>
                </View>
              </View>
            </View>
          </View>
          <List.Item
            title="Username"
            description={user?.username ?? ''}
            left={props => <List.Icon {...props} icon='account' />}
            style={{paddingVertical: 10}}
          />
          <List.Item
            title="Email"
            description={user?.email ?? ''}
            left={props => <List.Icon {...props} icon="email" />}
            style={{paddingVertical: 10}}
          />
          <List.Item
            title="Date joined"
            description={moment(formattedDateFromFirestore).format('MMM DD, YYYY') ?? ''}
            left={props => <List.Icon {...props} icon="set-all" />}
            style={{paddingVertical: 10}}
          />
          <List.Item
            title="Books added to Favorites"
            description={(favoriteBookList?.length).toString()}
            left={props => <List.Icon {...props} icon="heart" />}
            style={{paddingVertical: 10}}
          />

          <View style={{alignSelf: 'flex-start', marginLeft: 15}}>
            <Button 
              buttonColor={COLORS.RED}
              icon="logout" 
              mode="contained" 
              onPress={handleSignOut}>
                Log out
              </Button>
          </View>
          <ProfileBottomSheet showModal={showModal} handleToggleModal={handleToggleModal}/>
        </ScrollView>
    </Provider>
  )
}

export default ProfileTab 

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: COLORS.WHITE,
    minHeight: windowHeight
  },
  newCollectionText: {
    color: COLORS.WHITE,
    fontSize: 22,
    padding: 22,
    fontWeight: 'bold'
  },
  headerText: {
    fontSize: 30,
    color: COLORS.WHITE,
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bolder',
    marginTop: StatusBar.currentHeight
  }
})