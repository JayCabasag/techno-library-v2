import React, {useState} from 'react'
import { View, StyleSheet, StatusBar, ScrollView, Image, TouchableOpacity, Dimensions} from 'react-native'
import { Searchbar, Card, Text} from 'react-native-paper'
import { COLORS } from '../utils/app_constants'
import BookList from '../components/BookList'
import CollectionList from '../components/CollectionList'
import TagList from '../components/TagList' 
import { collection, getDocs, setDoc, doc, limit, orderBy, query} from 'firebase/firestore/lite';
import { db } from '../firebase/firebaseConfig'
import { ActivityIndicator} from 'react-native-paper';
import { TOTAL_BOOK_LOAD_LIMIT } from '../utils/app_constants'
import { FontAwesome } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const HomeTab = ({navigation}) => {

  const gotoSearchTab = () => {
    navigation.navigate('ExploreTab')
  }
  const [newCollectionList, setNewCollectionList] = React.useState([])
  const [isLoadingCollections, setIsLoadingCollections] = useState(false)
  const [allBookTags, setAllBookTags] = useState(['All'])
  const [isAllBookTagsLoading, setIsAllBookTagsLoading] = useState(false)
  const [allBooks, setAllBooks] = useState([])
  const [isLoadingAllBooks, setIsLoadingAllBooks] = useState(false)
  const [limitBookToLoad, setLimitBookToLoad] = useState(TOTAL_BOOK_LOAD_LIMIT)

  const getAllBookTags = (allTagsList) => {
    let booktags = []
    allTagsList.map((book) => {
      const arrayOfBookTags = book?.tags
      arrayOfBookTags?.forEach((tag) => {
        booktags.push(tag)
      })
      return booktags
    })
    const uniqueBookTags = [...new Set(booktags)]
    const ascendingOrderUniqueTags = uniqueBookTags?.sort()
    setAllBookTags(['All', ...ascendingOrderUniqueTags])
  }

  React.useEffect(() => {
    const getBooks = async (db) => {
      const booksCollectionRef = collection(db, 'books');
      const top100NewCollection = query(booksCollectionRef, limit(TOTAL_BOOK_LOAD_LIMIT), orderBy('createdAt', "desc"));
      const bookSnapshot = await getDocs(top100NewCollection);
      const cityList = bookSnapshot.docs.map(doc => {
       return { docId: doc.id,...doc.data()}
      });
      return setNewCollectionList([...cityList]);
    }
    getBooks(db)
  }, [])

  React.useEffect(() => {
    const getAllBooks = async (db) => {
      setIsLoadingAllBooks(true)
      const booksCollectionRef = collection(db, 'books');
      const top100NewCollection = query(booksCollectionRef, limit(limitBookToLoad), orderBy('title'));
      const bookSnapshot = await getDocs(top100NewCollection);
      const bookList = bookSnapshot.docs.map(doc => {
       return { docId: doc.id,...doc.data()}
      });
      setIsLoadingAllBooks(false)
      getAllBookTags([...bookList])
      return setAllBooks([...bookList]);
    }
    getAllBooks(db)
  }, [limitBookToLoad])
  

  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const handleGoToBookPreviewScreen = (data) => {
    navigation.navigate('BookPreview', {docId: data?.docId ?? ''})
  }

  const [currentSelectedTag, setCurrentSelectedTag] = useState('All')
  const [allBooksWithSameTag, setAllBooksWithSameTag] = useState([])
  const getBooksWithSameTag = (tagValue) => {
      let initialBookList = []
      if(tagValue === 'All' || tagValue === 'all') return
      initialBookList = allBooks?.filter((book) => {
        const bookTags = book?.tags ?? []
        const hasSameTag = bookTags.includes(tagValue)
        return hasSameTag
      })
      setAllBooksWithSameTag([...initialBookList])
  }
  
  const handleClickedTag = (tagText) => {
    setCurrentSelectedTag(tagText)
    getBooksWithSameTag(tagText)
  }

  return (
    <ScrollView 
    showsVerticalScrollIndicator={false}
    showsHorizontalScrollIndicator={false}
    style={styles.scrollView}
    onScroll={({nativeEvent}) => {
      if (isCloseToBottom(nativeEvent)) {
        setLimitBookToLoad(prevState => {
          return prevState + TOTAL_BOOK_LOAD_LIMIT
        })
      }
    }}
    >
      <View style={{paddingHorizontal: 22, paddingVertical: 25, flex: 1,display: 'flex', marginTop: 10, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
        <View style={{marginTop: 15}}>
            <Text style={{color: COLORS.MAIN_TEXT, fontWeight: '800', fontSize: 22}}>TECHNO LIBRARY</Text>
            <Text style={{color: COLORS.MAIN_TEXT, fontWeight: 'thin', textTransform: 'capitalize'}}>Read, Learn, Inspire, and Glow Feed Our Mind</Text>
        </View>
        <TouchableOpacity
            style={{marginTop: 16 }}
            onPress={gotoSearchTab}    
        >
            <FontAwesome name="search" size={24} color={COLORS.MAIN_TEXT} />
        </TouchableOpacity>
      </View>
      <View>
        <Text  style={styles.newCollectionText}>Recently added </Text>
      </View>
      <ScrollView style={{paddingLeft: 22, height: 'auto', marginBottom: 30 }} horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={{display: 'flex', flexDirection:'row', width: '100%', justifyContent: 'space-between', paddingRight: 22}}>
        {
          isLoadingCollections && (<ActivityIndicator animating={true} color={COLORS.WHITE} style={{height: 180}} />)
        }
        {
          !isLoadingCollections && newCollectionList?.map((data, index) => {
            return <CollectionList key={index} data={data} handleGoToBookPreviewScreen={handleGoToBookPreviewScreen}/>
          })
        }
        </View>
      </ScrollView>

      <ScrollView style={{paddingLeft: 22, height: 'auto'}} horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={{display: 'flex', flexDirection:'row', width: '100%', justifyContent: 'space-between', paddingRight: 22}}>
          {
            isAllBookTagsLoading && (<ActivityIndicator animating={true} color={COLORS.WHITE}/>)
          }
          {
            !isAllBookTagsLoading && allBookTags?.map((data, index) => {
              return (<TagList data={data} key={index} selectedTag={currentSelectedTag} handleClickedTag={handleClickedTag}/>)
            })
          }
        </View>
      </ScrollView>

      <View style={{width: '100%', height: 'auto',minHeight: windowHeight/2, backgroundColor: COLORS.WHITE, height: 'auto', paddingVertical: 15, borderTopRightRadius: 18,  borderTopLeftRadius: 18, paddingHorizontal: 5}}>
        { currentSelectedTag === 'All' && (
            allBooks?.map((data, index) => {
              return (<BookList key={index} data={data} handleGoToBookPreviewScreen={handleGoToBookPreviewScreen}/>)
            }))
        }
        {
          currentSelectedTag !== 'All' && (
            allBooksWithSameTag?.map((data, index) => {
              return (<BookList key={index} data={data} handleGoToBookPreviewScreen={handleGoToBookPreviewScreen}/>)
            })
          )
        }
        {isLoadingAllBooks && (<ActivityIndicator animating={true}  color={COLORS.RED} style={{height: 250}}/>)}
      </View>
      
    </ScrollView>
  )
}

export default HomeTab

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: COLORS.WHITE
  },
  newCollectionText: {
    color: COLORS.MAIN_TEXT,
    fontSize: 20,
    paddingLeft: 22,
    paddingRight: 22,
    paddingBottom: 22,
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