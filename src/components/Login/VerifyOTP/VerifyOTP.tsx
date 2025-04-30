import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Button, Image, ScrollView, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import Header from '../../../common/StyledComponents/Header';
import colours from '../../../common/constants/styles.json'
import { useNavigation } from '@react-navigation/native';
import styles from '../LoginStyles';
import Svg, { Path } from 'react-native-svg';
import OTPImage from '../../../../assets/images/online-doctor-consultation.png'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/rootReducer';
import { setIsAuthenticated, setOTPNumber } from '../../../redux/actions';
import { getLoginDetails, verifyOTP } from '../../../common/apis/api';
import { MMKV } from 'react-native-mmkv';
import translate from '../../../context/Translations';
import Forward from '../../../../assets/svg/forward';
import Back from '../../../../assets/svg/back';
import { OtpInput } from "react-native-otp-entry";
import KeyboardAvoidingWrapper from '../../../common/KeyboardAvoidingWrapper';


const VerifyOTP = () => {
    const navigation: any = useNavigation();
    const dispatch = useDispatch();
    const selectedProfileID: any = useSelector((state: RootState) => state.app.selectedProfile);
    const mobileNumber: any = useSelector((state: RootState) => state.app.mobileNumber);
    const [otpNumber, setOtpNumber] = useState<string>('');
    const responseOTP: any = useSelector((state: RootState) => state.app.responseOTP);
    const [timer, setTimer] = useState<any>(45);
    const [timerActive, setTimerActive] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const storage = new MMKV()
    const language: any = useSelector((state: RootState) => state.app.language);

    useEffect(() => {
        startTimer();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (timerActive) {
            interval = setInterval(() => {
                setTimer((prevTimer: number) => {
                    if (prevTimer === 0) {
                        setTimerActive(false);
                        clearInterval(interval);
                    } else {
                        return prevTimer - 1;
                    }
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [timerActive]);

    const startTimer = () => {
        setTimer(45);
        setTimerActive(true);
    };

    const ResendOTP = async () => {
        startTimer();
        try {
            await getLoginDetails(mobileNumber, selectedProfileID)
            ToastAndroid.show("OTP Resent!", ToastAndroid.SHORT);
        } catch (err) {
            ToastAndroid.show("Something Went Wrong!", ToastAndroid.SHORT);
        }
    };

    const goToDashboard = async () => {
        if (otpNumber === responseOTP) {
            try {
                setIsLoading(true);
                const response = await verifyOTP(mobileNumber, selectedProfileID, otpNumber);
                if (response.data.status === 200) {
                    storage.set('userInfo', JSON.stringify(response?.data?.response[0]));
                    storage.set('token', response.data?.response[1]?.token);

                    // Check if token is present in localStorage
                    const token = storage.getString('token');
                    if (token) {
                        setIsLoading(false);
                        dispatch(setIsAuthenticated(true));
                        navigation.navigate('Dashboard')
                    } else {
                        console.error('Token not found in localStorage.');
                    }
                }
            } catch (error) {
                // Handle any errors here
                Alert.alert("An unexpected error occured");
                console.error("An error occurred:", error);
            }
        } else {
            // ToastAndroid.show("OTP Entered is not correct!", ToastAndroid.SHORT);
            Alert.alert("OTP Entered is not correct!");
        }
    }

    return (
        <KeyboardAvoidingWrapper>
        <View style={{ flex: 1, backgroundColor: colours['theme-backgroung-color'] }}>
            <Header
                title={'Verify OTP'}
                headerBackgroundColor={colours['theme-color']}
                statusBarBackgroundColor={colours['theme-color']}
                showBackButton={false}
                leftIcon={<Back />}
                onLeftIconPress={() => navigation.navigate('Login')}
            />
            <ScrollView contentContainerStyle={styles.container} horizontal={false}>
                <View style={styles.loginImage}>
                    <Image source={OTPImage} />
                </View>

                <Text style={{
                    marginTop: 32,
                    fontSize: 16,
                    color: '#498E58',
                    fontWeight: '500'
                }}>“It’s okay not to be okay.</Text>
                <Text style={{
                    marginBottom: 32,
                    fontSize: 16,
                    color: '#498E58',
                    fontWeight: '500'
                }}>You are worthy of happiness and peace of mind.”</Text>


                <View style={styles.verifyOTPScreenInput}>
                    <View style={styles.verifyOTPInputButtons}>
                        <OtpInput 
                            numberOfDigits={5} 
                            type="numeric"
                            theme={{
                                containerStyle: { width: '75%', marginTop: 100 },
                                pinCodeContainerStyle: styles.OTPFieldStyle,
                            }}
                            onTextChange={(text) => setOtpNumber(text)} 
                        />
                        <View style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <Text style={{ color: 'black', fontSize: 16, fontWeight: '700' }}>{translate('OTPRESENDMessage')}</Text>
                            {timer > 0 ? (
                                language === 'mr' ?
                                    <Text style={{ color: 'black', fontSize: 16, fontWeight: '700' }}>{`${timer} सेकंदामध्ये ${translate('ResendIn')}`}</Text>
                                    :
                                    <Text style={{ color: 'black', fontSize: 16, fontWeight: '700' }}>{`${translate('ResendIn')} ${timer} ${translate("seconds")}`}</Text>
                            ) : (
                                <TouchableOpacity onPress={ResendOTP}>
                                    <Text style={{ color: '#22658A', fontSize: 16, fontWeight: '700' }}>{translate('Resend')}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity style={styles.verifyOTPButton} onPress={goToDashboard}>
                            {isLoading ? <ActivityIndicator color={'black'} /> :
                                <>
                                    <Text style={{
                                        fontSize: 20,
                                        color: 'black',
                                        fontWeight: '500'
                                    }}>{translate('Login')}</Text>
                                    <Forward />
                                </>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
        </KeyboardAvoidingWrapper>
    )
}

export default VerifyOTP
