import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const CustomTabBar = ({ state, descriptors, navigation }) => {
  const tabs = [
    { name: 'Home', icon: '🏠', label: 'Inicio' },
    { name: 'QuickStart', icon: '▶️', label: 'Entrenar', isCenter: true },
    { name: 'Routines', icon: '📋', label: 'Rutinas' },
    { name: 'Progress', icon: '📊', label: 'Progreso' },
    { name: 'Profile', icon: '👤', label: 'Perfil' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        const isCenter = tab.isCenter;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes[index].key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(state.routes[index].name);
          }
        };

        if (isCenter) {
          return (
            <TouchableOpacity
              key={index}
              style={styles.centerButtonContainer}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isFocused ? ['#FF5252', '#FF6B6B'] : ['#FF6B6B', '#FF5252']}
                style={styles.centerButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.centerButtonIcon}>{tab.icon}</Text>
              </LinearGradient>
              <Text style={[styles.centerButtonLabel, {
                color: isFocused ? theme.colors.primary : theme.colors.textSecondary
              }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, {
              fontSize: isFocused ? 22 : 20,
            }]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, {
              color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
              fontWeight: isFocused ? '600' : '500',
            }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 75,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    ...theme.typography.caption,
  },
  centerButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -15,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 4,
  },
  centerButtonIcon: {
    fontSize: 24,
    color: 'white',
  },
  centerButtonLabel: {
    fontSize: 11,
    ...theme.typography.caption,
    fontWeight: '600',
  },
});