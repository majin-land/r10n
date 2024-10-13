// import * as React from 'react';
// import { WalletSdk } from '@circle-fin/w3s-pw-react-native-sdk';
// import { Alert, Text, TextInput, TouchableOpacity, View,   StyleSheet,
// } from 'react-native';
// import { ExecuteEvent } from '@circle-fin/w3s-pw-react-native-sdk/lib/typescript/src/types';

// const TestWallet = () => {
// 	const [endpoint, setEndpoint] = React.useState(
//     'https://api.circle.com/v1/w3s/'
//   );
//     const [appId, setAppId] = React.useState(process.env.EXPO_PUBLIC_CIRCLE_API_KEY);
//     const [enableBiometricsPin, setEnableBiometricsPin] = React.useState(false);
//     const [userToken, setUserToken] = React.useState('');
//     const [encryptionKey, setEncryptionKey] = React.useState('');
//     const [challengeId, setChallengeId] = React.useState('');

// 		React.useEffect(() => {
// 			WalletSdk.init({
// 				endpoint,
// 				appId,
// 				settingsManagement: { enableBiometricsPin: enableBiometricsPin }
// 			}).then((a) => {
// 				// action()
// 			}).catch((e) => {
// 				// showSnackBar(e.message, false)
// 			})
// 		}, [])
// 	// 	React.useEffect(() => {
// 	// 		WalletSdk.addListener((event: any) => {
// 	// 			if(event == ExecuteEvent.forgotPin){
// 	// 						WalletSdk.moveRnTaskToFront();
// 	// 						// forgot PIN flow in React Native UI
// 	// 					}
// 	// 			});

// 	// 			_initSdk();

// 	// 		}, [])

// 	// 		const _initSdk = async () => {
// 	// 			try {
// 	// 						 // Set endpoint, app ID and extra settings
// 	// 		await WalletSdk.init({
// 	// 			endpoint,
// 	// 			appId,
// 	// 			settingsManagement: { enableBiometricsPin: enableBiometricsPin }
// 	// 		 });
// 	// 			} catch (e: any) {
// 	// 			Alert.alert(e.message);
// 	// 			return;
// 	// 			}
// 	// 		};
			

// 	// 	const _executeSdk = async () => {
// 	// 		try {
// 	// 				let { result } = await WalletSdk.execute(userToken, encryptionKey, [
// 	// 					challengeId,
// 	// 				]);
// 	// 				console.log(`${result.resultType}, ${result.status}, ${result.data?.signature}`);
// 	// 		} catch (e: any) {
// 	// 				console.log(e.message);
// 	// 		}
// 	//  };

// 		return (
// 			<View style={styles.container}>
// 				 <TextInput
//           accessibilityLabel={'endpointInput'}
//           onChangeText={setEndpoint}
//           value={endpoint}
//         />
//         <TextInput
//           accessibilityLabel={'appIdInput'}
//           onChangeText={setAppId}
//           value={appId}
//         />
//         <TextInput
//           accessibilityLabel={'userTokenInput'}
//           onChangeText={setUserToken}
//           value={userToken}
//         />
//         <TextInput
//           accessibilityLabel={'encryptionKeyInput'}
//           onChangeText={setEncryptionKey}
//           value={encryptionKey}
//         />
//         <TextInput
//           onChangeText={setChallengeId}
//           value={challengeId}
//         />
// 				 <TouchableOpacity
//           accessibilityLabel={'executeSdkButton'}
//           onPress={() => {
//             // _executeSdk();
//           }}>
// 						<Text>ss</Text>
// 					</TouchableOpacity>
// 			</View>
// 		)
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#F3F3F3', // light background color
//   },
// })

// export default TestWallet
