import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons'
import { useWallet } from '@/context/WalletContext'
import { getUsdcBalance, getUserBalance } from '@/libs/viem'
import { formatEther } from 'viem'

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { walletAddress } = useWallet()
  const [mainBalance, setMainBalance] = useState<string>()
  const [mainBalanceUsdc, setMainBalanceUsdc] = useState<string>()

  const fetchMainBalance = async () => {
    try {
      const userBalance = await getUserBalance(walletAddress as `0x${string}`)

      const usdcBalance = await getUsdcBalance(walletAddress as `0x${string}`)

      setMainBalanceUsdc(String(usdcBalance))
      setMainBalance(formatEther(userBalance))
    } catch (error) {
      console.log('error:', error)
    }
  }

  useEffect(() => {
    fetchMainBalance()
  }, [])

  return (
    <View style={styles.drawerContent}>

      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileName}>Jhon Doe</Text>
            <Text style={styles.profileEmail}>jhon.doe@mail.co</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => props.navigation.closeDrawer()}
        >
          <Ionicons name="close" size={30} color="#000" />
        </TouchableOpacity>

        {/* Main Crypto Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>Main Address</Text>
          <Text style={styles.addressText}>{walletAddress}</Text>
        </View>

        <View style={styles.balanceInfo}>
          <Text style={styles.balanceText}>Main Balance</Text>
          <View style={styles.balanceAmounts}>
            <Text style={styles.balanceAmount}>{mainBalance} ETH</Text>
            <Text style={styles.balanceAmount}>{mainBalanceUsdc} USDC</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          //   onPress={() => props.navigation.navigate('Profile')}
          onPress={() => console.log('test')}
        >
          <MaterialIcons
            name="person-outline"
            size={24}
            style={styles.iconStyle}
          />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          //   onPress={() => props.navigation.navigate('Settings')}
          onPress={() => console.log('test')}
        >
          <Feather name="settings" size={24} style={styles.iconStyle} />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            console.log('Sign Out')
          }}
        >
          <Feather name="log-out" size={24} color="#FFF" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CustomDrawerContent

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1, // Ensures the button stays on top
  },
  profileSection: {
    padding: 20,
    marginTop: 50, // Add margin to push content below the close button
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderColor: '#ccc',
    borderWidth: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addressSection: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  addressLabel: {
    fontSize: 12,
    color: '#1976d2',
  },
  addressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 5,
  },
  balanceInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  balanceText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  balanceAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  menuSection: {
    marginTop: 30,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 20,
    color: '#333',
  },
  iconStyle: {
    color: '#4f4f4f',
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff5555',
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#ff5555',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  signOutText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
})
