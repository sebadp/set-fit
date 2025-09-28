import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createShadow } from '../../utils/platformStyles';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme, mode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

const createStyles = (theme) =>
  StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      height: 75,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 0,
      paddingBottom: 10,
      paddingTop: 8,
      ...createShadow({ offsetY: -3, blurRadius: 16, opacity: 0.1, elevation: 20 }),
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
      marginBottom: 4,
      ...createShadow({ offsetY: 4, blurRadius: 20, opacity: 0.3, elevation: 8, color: '#FF6B6B' }),
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
