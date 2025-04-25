import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faHome, faInfoCircle);

export default function App() {
  return (
    <ImageBackground
      source={require('./assets/bg.webp')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <Image
          source={require('./assets/icon.webp')}
          style={styles.logo}
        />
        <Text style={styles.raahiTitle}>Raaahi</Text>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.centerContent}>
        <Text style={styles.comingSoon}>Coming Soon</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.icon}>
          <FontAwesomeIcon icon="home" size={32} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <FontAwesomeIcon icon="info-circle" size={32} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    top: 15
  },
  raahiTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
    display: "none"
  },
  loginButton: {
    backgroundColor: '#000000',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#00ffff',
    top: 15
  },
  loginText: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'Cursive',
    marginTop: 80,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 1,
  },
  icon: {
    padding: 10,
  },
});

