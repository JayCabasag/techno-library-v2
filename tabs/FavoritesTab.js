import React, { useContext, useState } from 'react'
import { View, StyleSheet, StatusBar, ScrollView, Image, Dimensions, Alert } from 'react-native'
import { Searchbar, Card, Text, ActivityIndicator, Appbar, List, ActivityIndicatorProps, IconButton } from 'react-native-paper'
import { COLORS, IMAGES } from '../utils/app_constants'
import SearchBookList from '../components/SearchBookList'
import { useDebouncedCallback } from 'use-debounce';
import { collection, getDocs, setDoc, doc, limit, orderBy, query, where, deleteDoc } from 'firebase/firestore/lite';
import { db } from '../firebase/firebaseConfig'
import { TOTAL_BOOK_LOAD_LIMIT } from '../utils/app_constants'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserContext } from '../context/UserContext'
import moment from 'moment/moment'
import { EvilIcons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function FavoritesTab({ navigation }) {

  const [user, setUser] = useContext(UserContext)
  const [totalBookLoadLimit, setTotalBookLoadLimit] = React.useState(TOTAL_BOOK_LOAD_LIMIT)
  const [favoriteBookList, setFavoriteBookList] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const hasFavoriteBooks = favoriteBookList?.length > 0

  React.useEffect(() => {
    const getUserBookFavorites = async () => {
      setIsLoading(true)
      const userReference = `users/${user?.docId}`
      const favoriteRefs = query(collection(db, "favorites"), where("user", "==", userReference), limit(totalBookLoadLimit));
      const querySnapshot = await getDocs(favoriteRefs);
      let userFavoriteList = []
      querySnapshot.forEach((doc) => {
        userFavoriteList.push({ favoriteId: doc.id, ...doc.data() })
      });
      setFavoriteBookList([...userFavoriteList])
      setIsLoading(false)
    }
    getUserBookFavorites()
  }, [totalBookLoadLimit])

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const handleOpenPreviewBook = (data) => {
    navigation.navigate('BookPreview', { docId: data?.docId ?? '' })
  }

  const handleRefreshFavoriteList = async () => {
    setIsLoading(true)
    const userReference = `users/${user?.docId}`
    const favoriteRefs = query(collection(db, "favorites"), where("user", "==", userReference), limit(totalBookLoadLimit));
    const querySnapshot = await getDocs(favoriteRefs);
    let userFavoriteList = []
    querySnapshot.forEach((doc) => {
      userFavoriteList.push({ favoriteId: doc.id, ...doc.data() })
    });
    setFavoriteBookList([...userFavoriteList])
    setIsLoading(false)
  }

  const deleteFavoriteFromDatabase = async (docId) => {
    await deleteDoc(doc(db, "favorites", docId)).then(() => {
      handleRefreshFavoriteList()
    }).catch(() => {
      return alert('Error removing from favorites')
    })
  }

  const handleDeleteFavoriteBook = async (data) => {
    const docId = data?.favoriteId ?? ''
    return Alert.alert(
      "Message",
      "Confirm removing book from favorites?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK", onPress: () => deleteFavoriteFromDatabase(docId) }
      ]
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      onScroll={({ nativeEvent }) => {
        if (isCloseToBottom(nativeEvent)) {
          setTotalBookLoadLimit(prevState => {
            return prevState + TOTAL_BOOK_LOAD_LIMIT
          })
        }
      }}
    >
      <Appbar.Header
        style={{
          backgroundColor: COLORS.RED
        }}
      >
        <Appbar.Content title="Favorites" color={COLORS.WHITE} titleStyle={{ fontWeight: "bold" }} />
      </Appbar.Header>
      <View style={{ width: '100%', height: 'auto', minHeight: '100%', backgroundColor: 'transparent', height: 'auto', paddingHorizontal: 5 }}>
        <View
          style={styles.favoritesView}
        >
          <Text style={{ paddingVertical: 7, paddingHorizontal: 10 }}>Books added to favorites ({favoriteBookList?.length})</Text>
          <IconButton
            icon="refresh"
            color={COLORS.RED}
            size={20}
            onPress={handleRefreshFavoriteList}
          />
        </View>
        {
          !isLoading && !hasFavoriteBooks && (
            <View style={{ height: windowHeight / 2, width: windowWidth, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }}>
              <Text>No favorites...please try to refresh the page</Text>
            </View>
          )
        }
        {favoriteBookList?.map((data, index) => {
          const dateAddedToFavorites = data.createdAt.toDate()
          return <List.Item
            title={data?.title ?? 'No title'}
            titleStyle={{ fontWeight: '800', fontSize: 16 }}
            description={`Added ${moment(dateAddedToFavorites).format('MMM DD, YYYY')}`}
            descriptionStyle={{ fontSize: 12 }}
            onPress={() => handleOpenPreviewBook(data)}
            key={index}
            left={props => {
              return (
                <Image {...props} source={{ uri: data?.book_cover ?? IMAGES.NO_IMAGE_AVAILABLE }} style={{ height: 120, width: 120, borderRadius: 15 }} />
              )
            }}
            right={props => {
              return (<View {...props} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton
                  icon={'delete'}
                  iconColor={COLORS.RED}
                  size={23}
                  rippleColor={COLORS.RED}
                  onPress={() => handleDeleteFavoriteBook(data)}
                />
              </View>)
            }}
            style={{ paddingVertical: 15, paddingHorizontal: 10 }}
          />
        })
        }
        {isLoading && (<View style={styles.loadingFavoritesView}>
          <ActivityIndicator size={30} animating={true} color={COLORS.RED} style={{ height: 'auto', marginBottom: 15 }} />
          <Text>Loading favorites...</Text>
        </View>)
        }
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: COLORS.WHITE
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
  },
  favoritesView: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  loadingFavoritesView: {
    height: windowHeight / 2,
    width: windowWidth,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
