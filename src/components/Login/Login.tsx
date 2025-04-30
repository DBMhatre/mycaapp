import React, { FC, useState } from 'react'
import { View, Text, Alert, TouchableOpacity, Image, ToastAndroid, ScrollView, ActivityIndicator, Dimensions, Linking, Modal } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import HeaderSVG from '../../../assets/svg/HeaderSVG.svg'
import styles from './LoginStyles';
import { Button } from '@rneui/base';
import Header from '../../common/StyledComponents/Header';
import { Input } from '@rneui/themed';

import colours from '../../common/constants/styles.json'
import Svg, { Path } from 'react-native-svg';
import LoginImage from '../../../assets/images/LoginScreenImage.png'
import { getLoginDetails, getTermsConditions } from '../../common/apis/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/rootReducer';
import { setMobileNumber, setResponseOTP } from '../../redux/actions';
import translate from '../../context/Translations';
import Forward from '../../../assets/svg/forward';
import RadioButton from '../../common/StyledComponents/RadioButton/RadioButton';
import Back from '../../../assets/svg/back';
import CheckBox from 'expo-checkbox'
import Pdf from 'react-native-pdf';
import Close from '../../../assets/svg/close';
import CloseReel from '../../../assets/svg/closeReel';
import KeyboardAvoidingWrapper from '../../common/KeyboardAvoidingWrapper';

interface LoginProps { }

const Login: FC<LoginProps> = () => {
    const navigation: any = useNavigation();
    const dispatch = useDispatch();
    const selectedProfileID: any = useSelector((state: RootState) => state.app.selectedProfile);
    const mobileNumber: any = useSelector((state: RootState) => state.app.mobileNumber);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [checked, setChecked] = React.useState(false);
    const [showPDF, setShowPDF] = useState<boolean>(false);
    const [terms, setTerms] = useState<string>('')
    const toggleCheckbox = () => setChecked(!checked);

    const goToProfileSelection = () => {
        navigation.navigate('ProfileSelection');
    };

    const goToVerifyOTP = async () => {
        if (!mobileNumber || mobileNumber.length < 10) {
            ToastAndroid.show("Enter a valid Mobile Number", ToastAndroid.LONG);
        } else {
            setIsLoading(true);
            try {
                const response = await getLoginDetails(mobileNumber, selectedProfileID);
                if (response && response?.data && response?.data?.response && response?.data?.response?.length !== 0) {
                    dispatch(setResponseOTP(response?.data?.response?.otp));
                    setIsLoading(false);
                    navigation.navigate('OTP');
                    // Proceed to the next step
                } else if (response.data.status === 404) {
                    //ToastAndroid.show("User does not exist or User is inactive. Contact Superadmin", ToastAndroid.LONG);
                    Alert.alert("User does not exist or User is inactive. Contact Superadmin");
                }
                else if(response.data.status === 500) {
                    //ToastAndroid.show("You don't have access as health worker", ToastAndroid.LONG);
                    Alert.alert("You don't have access as health worker");
                    setIsLoading(false);
                }
            } catch (error) {
                // ToastAndroid.show("Something Went Wrong!", ToastAndroid.SHORT);
                Alert.alert("Something Went Wrong!");
                console.error("An error occurred:", error);
            }
        }
    };

    const handleMobileNumberChange = (value: any) => {
        dispatch(setMobileNumber(value));
    }

    const handleAgreementPress = async () => {
        try {
            const response = await getTermsConditions();
            if (response && response.data) {
                setShowPDF(true);
                setTerms(response.data.response);
            }
        } catch (err) {
            console.log("Error opening Agreement PDF", err)
        }
    }

    return (
        <KeyboardAvoidingWrapper>
        <View style={{ flex: 1, backgroundColor: colours['theme-backgroung-color'] }}>
            <Header
                title={'Login'}
                headerBackgroundColor={colours['theme-color']}
                statusBarBackgroundColor={colours['theme-color']}
                onLeftIconPress={goToProfileSelection}
                leftIcon={<Back />}
            />
            <ScrollView contentContainerStyle={styles.container} horizontal={false}>
                <View style={styles.loginImage}>
                    <Image source={LoginImage} />
                </View>

                <Text style={{
                    marginTop: 32,
                    fontSize: 16,
                    color: '#498E58',
                    fontWeight: '500'
                }}>“You are stronger than you realize and</Text>
                <Text style={{
                    marginBottom: 32,
                    fontSize: 16,
                    color: '#498E58',
                    fontWeight: '500'
                }}>You are not alone in your struggles.”</Text>

                <View style={styles.loginScreenInput}>
                    {/* <Text style={{
                        fontSize: 24,
                        color: '#22658A',
                        fontWeight: '500'
                    }}>
                        {translate('LetsGetStarted')}
                    </Text> */}
                    <View style={styles.mobileInputButtons}>
                        <Input
                            containerStyle={styles.mobileNumberContiner}
                            inputContainerStyle={styles.mobileNumberInput}
                            placeholder='Mobile Number'
                            value={mobileNumber}
                            keyboardType='numeric'
                            autoFocus
                            onChangeText={handleMobileNumberChange}
                        />
                        <View style={{
                            width: Dimensions.get('screen').width,
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 8
                        }}>
                            <CheckBox value={checked} onValueChange={() => setChecked(!checked)} />
                            <TouchableOpacity onPress={handleAgreementPress}>
                                <Text style={{ textAlign: 'justify', color: 'gray', fontSize: 13, textDecorationLine: 'underline' }}>{translate("TearmsandConditions")}</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.verifyOTPButton, { backgroundColor: !checked ? 'grey' : colours['theme-color'] }]} onPress={goToVerifyOTP} disabled={!checked}>
                            {isLoading ? <ActivityIndicator color={'black'} /> : <>
                                <Text style={{
                                    fontSize: 20,
                                    color: 'black',
                                    fontWeight: '500',
                                }}>{translate('verify-otp')}</Text>
                                <Forward />
                            </>}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Modal visible={showPDF} style={{ position: 'relative' }}>
                <TouchableOpacity style={{ position: 'absolute', top: 10, right: 10, zIndex: 5 }} onPress={() => setShowPDF(false)}>
                    <CloseReel />
                </TouchableOpacity>
                <Pdf
                    trustAllCerts={false}
                    source={{ uri: terms, cache: true }}
                    onLoadComplete={(numberOfPages, filePath) => {
                        console.log(`Number of pages: ${numberOfPages}`);
                    }}
                    onPageChanged={(page, numberOfPages) => {
                        console.log(`Current page: ${page}`);
                    }}
                    onError={(error) => {
                        console.log('PDF Error:', error);
                    }}
                    onPressLink={(uri) => {
                        console.log(`Link pressed: ${uri}`);
                    }}
                    style={{ flex: 1, height: Dimensions.get('window').height }}
                />
            </Modal>
        </View>
        </KeyboardAvoidingWrapper>
    )
}

export default Login
