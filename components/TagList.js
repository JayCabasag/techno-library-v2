import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from '../utils/app_constants'

const TagList = ({data, selectedTag, handleClickedTag}) => {
  
  const isActiveTag = data === selectedTag

  return <View 
            style={{
                height: 'auto',
                width: 'auto',
                marginRight: 15, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
            }}>
                <TouchableOpacity
                    onPress={() => handleClickedTag(data)}
                >
                    <Text style={isActiveTag ? styles.activeTag : styles.nonActiveTag}>{data}</Text>
                </TouchableOpacity>
        </View>
}

export default TagList
const tag = {
    fontSize: 16, 
    color: COLORS.MAIN_TEXT, 
    paddingHorizontal: 15
}

const styles = StyleSheet.create({
    nonActiveTag: {
        ...tag,
        fontWeight: '400'
    },
    activeTag: {
        ...tag,
        fontWeight: '800'
    }
})