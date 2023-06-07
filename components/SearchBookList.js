import React from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import { Card, IconButton } from 'react-native-paper'
import { IMAGES } from '../utils/app_constants'

const SearchBookList = ({ data, handleGoToBookPreviewScreen }) => {

  function shortenSentence(sentence, maxLength) {
    if (sentence.length <= maxLength) return sentence;
    return sentence.substring(0, maxLength) + '...';
  }

  return (
    <Card style={{ padding: 25, marginTop: 10 }} elevation={0}>
      <View style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => handleGoToBookPreviewScreen(data)} >
          <Image source={{ uri: data?.book_cover ?? IMAGES.NO_IMAGE_AVAILABLE }}
            style={{ width: 150, height: 150, borderRadius: 15 }} />
        </TouchableOpacity>

        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
          <View style={{ flex: 1, marginLeft: 22 }}>
            <TouchableOpacity onPress={() => handleGoToBookPreviewScreen(data)}>
              <Text numberOfLines={2} style={{ fontWeight: '600', fontSize: 16, color: '#4d5156' }}>{data?.title ?? 'No title'}</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 14, color: 'gray' }}>{data?.author ?? 'Not available'}</Text>
            <Text style={{ fontSize: 12, color: '#4d5156' }}>{shortenSentence(data?.description ?? 'No description', 50)}</Text>
          </View>
          <View style={{ marginLeft: 15 }}>
            <IconButton onPress={() => handleGoToBookPreviewScreen(data)} icon={"code-greater-than"} />
          </View>
        </View>
      </View>
    </Card>
  )
}

export default SearchBookList