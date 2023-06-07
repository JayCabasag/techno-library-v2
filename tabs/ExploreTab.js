import React, { useContext, useState } from 'react'
import { View, StyleSheet, StatusBar, ScrollView, Image } from 'react-native'
import { Searchbar, Card, Text, ActivityIndicator, Appbar } from 'react-native-paper'
import { ALGOLIA_SEARCH_API_KEY, ALGOLIA_SEARCH_APP_ID, ALGOLIA_SEARCH_URL, COLORS } from '../utils/app_constants'
import SearchBookList from '../components/SearchBookList'
import { useDebouncedCallback } from 'use-debounce';
import { TOTAL_BOOK_LOAD_LIMIT } from '../utils/app_constants'
import axios from 'axios'

const ExploreTab = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = React.useState('')

  const debounceSearch = useDebouncedCallback((value) => {
    setSearchQuery(value)
  }, 1000)

  const onChangeSearch = (value) => {
    debounceSearch(value)
  }

  const [bookResultsList, setbookResultsList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [noResultsFound, setNoResultsFound] = useState(false)
  const [totalBookLoadLimit, setTotalBookLoadLimit] = useState(TOTAL_BOOK_LOAD_LIMIT)

  React.useEffect(() => {
    const getBooks = async () => {
      setIsLoading(true)
      const config = {
        headers: {
          'X-Algolia-API-Key': ALGOLIA_SEARCH_API_KEY,
          'X-Algolia-Application-Id': ALGOLIA_SEARCH_APP_ID
        }
      };
      const url = `${ALGOLIA_SEARCH_URL}${searchQuery}&hitsPerPage=${totalBookLoadLimit}&getRankingInfo=1`;
      await axios.get(url, config)
        .then(res => {
          setbookResultsList([...res.data.hits])
          if (res.data.hits?.length <= 0) {
            setNoResultsFound(true)
          }
          if (res.data.hits?.length > 0) {
            setNoResultsFound(false)
          }
          setIsLoading(false)
        })
        .catch(err => {
          console.log(err)
          setIsLoading(false)
        })

    }
    getBooks()
  }, [searchQuery, totalBookLoadLimit])

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

  const handleGoToBookPreviewScreen = (data) => {
    navigation.navigate('BookPreview', { docId: data?.objectID ?? '' })
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
        <Appbar.Content title="Explore" color={COLORS.WHITE} titleStyle={{ fontWeight: "bold" }} />
      </Appbar.Header>
      <View style={{ paddingHorizontal: 22, paddingTop: 15 }}>
        <Searchbar
          placeholder="Search topic..."
          onChangeText={onChangeSearch}
          inputStyle={{ color: COLORS.BLACK }}
          defaultValue={searchQuery}
          cursorColor={COLORS.GRAY}
          iconColor={COLORS.GRAY}
          placeholderTextColor={COLORS.GRAY}
          selectionColor={COLORS.GRAY}
          style={{ fontSize: 25, backgroundColor: '#f5f5f5', color: COLORS.GRAY, height: 65, borderRadius: 15, borderColor: COLORS.GRAY, borderWidth: 1 }}
        />
      </View>

      <View style={styles.resultsView}>
        {
          !noResultsFound && bookResultsList?.map((data, index) => {
            return (<SearchBookList key={index} data={data} handleGoToBookPreviewScreen={handleGoToBookPreviewScreen} />)
          })
        }
        {
          isLoading && (<ActivityIndicator animating={true} color={COLORS.RED} style={{ height: 180 }} />)
        }
        {
          !isLoading && noResultsFound && (<Text style={styles.noResultsFoundText}>No results found for "{searchQuery}"</Text>)
        }
      </View>
    </ScrollView>
  )
}

export default ExploreTab

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
  resultsView: {
    width: '100%',
    height: 'auto',
    minHeight: '100%',
    backgroundColor: 'transparent',
    height: 'auto',
    paddingHorizontal: 0
  },
  noResultsFoundText: {
    color: COLORS.RED,
    flex: 1,
    textAlign: 'center',
    marginTop: 15
  }
})