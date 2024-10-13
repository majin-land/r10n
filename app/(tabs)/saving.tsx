import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient' 

const PortfolioScreen: React.FC = () => {
  const [usdcBalance, setUsdcBalance] = useState('')
  const [tbillBalance, setTbillBalance] = useState('')
  const [rate] = useState(1.07599319)
  const [activeTab, setActiveTab] = useState('Stake') 

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <Text style={styles.logo}>R1ON</Text> */}
        {/* <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity> */}
      </View>

      <View style={styles.groupPortfolio}>
        <Text style={styles.portfolioTitle}>Group Portfolio</Text>
        <View style={styles.groupInfo}>
          <View style={styles.groupItem}>
            <Text style={styles.groupLabel}>Total Value Locked</Text>
            <Text style={styles.groupValue}>$121,608,196</Text>
          </View>
          <View style={styles.groupItem}>
            <Text style={styles.groupLabel}>Price Per TBILL Token</Text>
            <Text style={styles.groupValue}>$1.07599319</Text>
          </View>
          <View style={styles.groupItem}>
            <Text style={styles.groupLabel}>Estimated YTM</Text>
            <Text style={styles.groupValue}>4.42%</Text>
          </View>
        </View>
      </View>

      <LinearGradient
        colors={['#0066FF', '#00CCFF']}
        style={styles.myPortfolio}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.balanceLabel}>TBILL Balance</Text>
        <Text style={styles.balanceAmount}>220</Text>
        <View style={styles.profitYieldContainer}>
          <Text style={styles.profit}>Profit TBILL 20</Text>
          <Text style={styles.yield}>+10.00%</Text>
        </View>
      </LinearGradient>

      <View style={styles.stakeContainer}>
        <View style={styles.toggleButtons}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === 'Stake' && styles.activeButton,
            ]}
            onPress={() => setActiveTab('Stake')}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === 'Stake' && styles.activeText,
              ]}
            >
              Stake
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeTab === 'Unstake' && styles.activeButton,
            ]}
            onPress={() => setActiveTab('Unstake')}
          >
            <Text
              style={[
                styles.toggleText,
                activeTab === 'Unstake' && styles.activeText,
              ]}
            >
              Unstake
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Balance</Text>
            <Text style={styles.inputValue}>USDC</Text>
            <TextInput
              style={styles.input}
              keyboardType='numeric'
              value={usdcBalance}
              onChangeText={setUsdcBalance}
            />
          </View>
          <Text style={styles.rateText}>Rate: 1 TBILL ≈ {rate} USDC</Text>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>TBILL</Text>
            <TextInput
              style={styles.input}
              keyboardType='numeric'
              value={tbillBalance}
              onChangeText={setTbillBalance}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.stakeButton}>
          <Text style={styles.stakeButtonText}>{activeTab}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 10,
  },
  menuText: {
    fontSize: 24,
  },
  groupPortfolio: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  portfolioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  groupItem: {
    alignItems: 'center',
  },
  groupLabel: {
    fontSize: 12,
    color: '#888',
  },
  groupValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  myPortfolio: {
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#fff',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 10,
  },
  profitYieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  profit: {
    fontSize: 16,
    color: '#fff',
  },
  yield: {
    fontSize: 16,
    color: '#fff',
  },
  stakeContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  toggleButtons: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#0066FF',
  },
  toggleText: {
    fontSize: 16,
    color: '#000',
  },
  activeText: {
    color: '#fff',
  },
  inputSection: {
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
  },
  inputValue: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  rateText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
  },
  stakeButton: {
    backgroundColor: '#0066FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  stakeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

export default PortfolioScreen
