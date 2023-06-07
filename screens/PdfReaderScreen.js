import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Appbar } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import { COLORS } from '../utils/app_constants';
import { ActivityIndicator } from 'react-native-paper';


const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const PdfReaderScreen = ({ navigation, route: {params :{ file }} }) => {

  const [url, setUrl] = useState(file);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [isError, setIsError] = useState(false);

  const [toggleUrl, setToggleUrl] = useState(false)

  useEffect(() => {
    setUrl(file)
  }, [toggleUrl])
  
  const handleOnLoad = (data) => {
    setIsLoadingPdf(false)
  }

  const webViewRef = useRef(null);

  const handleCheckIfNeedToLoadAgain = (title) => {
    if(title === ''){
      setIsLoadingPdf(true)
      setToggleUrl(prevState => !prevState)
      return
    }
    setIsLoadingPdf(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header
        style={{
          backgroundColor: COLORS.RED,
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Appbar.BackAction onPress={() => navigation.goBack()} size={23} color={COLORS.WHITE} />
        <Appbar.Content title={'Pdf viewer'} color={COLORS.WHITE} titleStyle={{fontWeight: "bold"}}/>
      </Appbar.Header>
      {isLoadingPdf && (
        <View
          style={{
            height: windowHeight,
            width: windowWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size={30} animating={true} color={COLORS.RED} style={{ height: 'auto', marginBottom: 15 }} />
          <Text>Loading pdf file... please wait</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        {
          toggleUrl && (<WebView
            source={{uri: url}}
            onLoad={(data) => handleOnLoad(data)}
            onError={(error) => setIsError(true)}
            style={{ flex: 1 }}
            onLoadEnd={(data) => handleCheckIfNeedToLoadAgain(data.nativeEvent.title)}
            ref={webViewRef}
          />)
        }
        {
          !toggleUrl && (<WebView
            source={{uri: url}}
            onLoad={(data) => handleOnLoad(data)}
            onError={(error) => setIsError(true)}
            style={{ flex: 1 }}
            onLoadEnd={(data) => handleCheckIfNeedToLoadAgain(data.nativeEvent.title)}
            ref={webViewRef}
          />)
        }
        {
          isError && (<Text>An error occured</Text>)
        }
      </View>
    </View>
  );
};

export default PdfReaderScreen   