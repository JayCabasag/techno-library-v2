import React, { useContext } from 'react'
import { Text, View, Image, ScrollView, StyleSheet, Dimensions, ActivityIndicator, Linking, Alert} from 'react-native'
import { Appbar, Button } from 'react-native-paper';
import { COLORS, IMAGES } from '../utils/app_constants';
import { FontAwesome } from '@expo/vector-icons';
import { Octicons, Ionicons } from '@expo/vector-icons';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs} from "firebase/firestore/lite";
import { db } from '../firebase/firebaseConfig'
import { showMessage } from 'react-native-flash-message';
import { UserContext } from '../context/UserContext';
import { Entypo } from '@expo/vector-icons'

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function BookPreviewScreen({navigation,route}) {

   const [user, setUser] = useContext(UserContext)
   const docId = route?.params?.docId ?? ''
   const [data, setData] = React.useState(null)
   const [isLoading, setIsLoading] = React.useState(false)
   const [onFavorite, setOnFavorite] = React.useState(false)
    
   const handleGoBack = () => {
    navigation.goBack()
   }

   React.useEffect(() => {
        const getBookDetails = async () => {
            try {
            setIsLoading(true)
                const docRef = doc(db, "books", `${docId}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setData({
                        ...docSnap.data(),
                        docId: docId
                    })
                } else {
                showMessage({
                    message: `Error occured getting book details`,
                    icon: props => <Entypo name="circle-with-cross" size={22} color={COLORS.WHITE} {...props}/>,
                    backgroundColor: COLORS.RED
                });
            }
            setIsLoading(false)
            } catch (error) {
                
            }
        }
        const checkIfBookIsCurrentlyOnFavorite = async () => {
            const bookReference = `books/${docId}`
            const userReference = `users/${user?.docId}`
            
            const favoriteRefs = query(collection(db, "favorites"), where("book", "==", bookReference), where("user", "==", userReference));
            const querySnapshot = await getDocs(favoriteRefs);
            let userFavoriteList = []
            querySnapshot.forEach((doc) => {
                userFavoriteList.push({docId: doc.id, ...doc.data()})
            });
            
            const hasSameBookOnFavorite = userFavoriteList?.length > 0

            if(hasSameBookOnFavorite){
                setOnFavorite(true)
            }
            if(!hasSameBookOnFavorite){
                setOnFavorite(false)
            }
        }
        getBookDetails()
        checkIfBookIsCurrentlyOnFavorite()
   }, [])

   const handleAddToFavorites = async() => {
    const bookReference = `books/${docId}`
    const userReference = `users/${user?.docId}`
    
    
    const favoriteRefs = query(collection(db, "favorites"), where("book", "==", bookReference), where("user", "==", userReference));
      const querySnapshot = await getDocs(favoriteRefs);
      let userFavoriteList = []
      querySnapshot.forEach((doc) => {
        userFavoriteList.push({docId: doc.id, ...doc.data()})
     });
    
    const hasSameBookOnFavorite = userFavoriteList?.length > 0

    if(hasSameBookOnFavorite){
        setOnFavorite(true)
        return alert('Book already added to favorites')
    }

    await addDoc(collection(db, "favorites"), {
        book: bookReference,
        user: userReference,
        ...data,
        createdAt: serverTimestamp()
      }).then((response) => {
        setOnFavorite(true)
        return alert('Added to favorites')
      }).catch(() => {
        return alert('An error occured while adding to favorites')
      })
   }

   const handleOpenPdfReaderScreen = (data, file) => {
    if(file === '') return alert('View pdf for this book is not yet available. You can download it instead.')
    return Alert.alert(
        "Message",
        "Our pdf player is powered by google docs. Make sure to refresh the page by clicking back button if the pdf won't load. Would you like to continue?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { text: "OK", onPress: () =>  navigation.navigate('PdfReaderScreen', {file: file})}
        ]
      );
   }

   return (
    <ScrollView
          style={styles.mainScrollbar}  
          showsHorizontalScrollIndicator={false} 
          showsVerticalScrollIndicator={false}
        >
              <Appbar.Header style={{backgroundColor: COLORS.RED, display: 'flex', alignItems: 'center', width: '100%'}} >
                <Appbar.BackAction onPress={handleGoBack} size={23} color={COLORS.WHITE}/>
                <Text style={{flex: 1, textAlign: 'center', fontSize: 20, color: COLORS.WHITE, fontWeight: '700'}}>Book preview</Text>
                <Button color={COLORS.RED} onPress={handleAddToFavorites}>
                    <Ionicons name={onFavorite ? 'heart' : 'heart-outline'} size={23} color={COLORS.WHITE} />
                </Button>
              </Appbar.Header>
                
                {
                    isLoading && (<View style={{height: windowHeight, width: windowWidth, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <ActivityIndicator size={30} animating={true} color={COLORS.RED} style={{height: 'auto', marginBottom: 15}} />
                        <Text>Loading book...</Text>
                    </View>)
                }

                {
                    !isLoading && (
                        <View style={{paddingTop: 20,paddingHorizontal: 25,flex: 1, flexDirection: 'column', height: 'auto', display: 'flex',alignItems:'center', justifyContent: 'center'}}>
                            <Image 
                            source={{uri: data?.book_cover ?? IMAGES.NO_IMAGE_AVAILABLE}}
                            style={{width: 150, height: 250, borderRadius: 15, marginBottom: 5}} 
                            /> 
                            <Text style={{color: COLORS.GRAY}}>By: {data?.author ?? 'Unknown author'} </Text>
                            <Text style={{textAlign: 'center', fontSize: 18, fontWeight: 'bold'}}>{data?.title ?? 'No title'}</Text>
                            <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10}}>
                                {/* <Octicons name='download' size={15} color={COLORS.GRAY}/>
                                <Text style={{color: COLORS.GRAY, marginLeft: 5}}>{data?.totalReads ?? 0} Total reads</Text> */}
                            </View>
                            <View style={{display: 'flex', flex: 1, flexDirection: 'row', marginTop: 10}}>
                                <Button 
                                icon={'eye'} 
                                style={{ flex: 1, backgroundColor: COLORS.RED, marginRight: 10}}
                                mode="contained"
                                  onPress={() => handleOpenPdfReaderScreen(data, data?.googleDocsLink ?? '')}
                                >
                                Read
                                </Button>
                                <Button style={{ flex: 1}} mode="outlined" onPress={() => Linking.openURL(data?.file)} color={COLORS.RED}>
                                <FontAwesome name='download' size={15} color={COLORS.RED}/>
                                <Text style={{color: COLORS.RED}}>
                                    {' '} Download
                                </Text>
                                </Button>
                            </View>
                            <View style={{flex: 1, paddingTop: 16, marginBottom: 10}}>
                                <Text style={{letterSpacing: .5, color: COLORS.BLACK}}>
                                {data?.description ?? 'No description...'}
                                </Text>
                            </View>
                            <View style={{flex: 1, height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            </View>
                            </View>
                    )
                }
        </ScrollView>
  )
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
  });
  