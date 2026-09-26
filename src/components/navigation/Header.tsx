import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/AuthContext';
import { useNavigationHistory } from '../../hooks/useNavigationHistory';
import { useConfig } from '../../providers/ConfigProvider';
import { useTheme } from '../../providers/ThemeProvider';

type HeaderAction = {
	icon?: any;                // local image
	uri?: string;              // remote image
	onPress: () => void;
	render?: () => React.ReactNode; // custom render override
};

type Props = {
	title?: string;
	logo?: boolean;
	logoRight?: boolean;
	settings?: boolean;
	back?: boolean;
	onBack?: () => void;
	rightActions?: HeaderAction[];
	leftContent?: () => React.ReactNode;
};

export const Header: React.FC<Props> = ({
	title = null,
	logo = false,
	logoRight = false,
	settings = false,
	back = false,
	onBack,
	rightActions = [],
	leftContent,
}) => {
	const theme = useTheme();
	const config = useConfig();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { pathname } = useNavigationHistory();
	const { user } = useAuth();

	const goToHome = () => {
		if (pathname !== config.homeRoute) {
			router.push(config.homeRoute);
		}
	};

	const goToSettings = () => router.push('/(settings)');
	const goBack = () => onBack ? onBack() : router.back();

	// 🔥 Build default settings action (for backward compatibility)
	const defaultActions: HeaderAction[] = settings
		? [
				{
					uri: user?.image,
					icon: theme.image.profile,
					onPress: goToSettings,
				},
		  ]
		: [];

	const actions = [...rightActions, ...defaultActions];

	return (
		<View
			style={[
				theme.styles.container,
				theme.styles.row,
				theme.styles.rowSpaceBetween,
				theme.styles.alignCenter,
				theme.styles.background,
				theme.utils.ptlg,
				theme.utils.pxmd,
				{
					height: 66 + insets.top,
					borderBottomColor: theme.color.border,
					borderBottomWidth: 1,
				},
			]}
		>
			{/* LEFT SIDE */}
			<View style={[theme.styles.row, theme.styles.alignCenter, { flex: 1, marginRight: 8 }]}>
				{leftContent ? leftContent() : (
					<>
						<TouchableOpacity onPress={goToHome} activeOpacity={0.8}>
							{logo && (
								<Image
									source={theme.image.logo}
									style={styles.item}
									resizeMode="contain"
								/>
							)}
						</TouchableOpacity>

						<TouchableOpacity onPress={goBack} activeOpacity={0.8}>
							{back && (
								<Image
									source={theme.image.back}
									style={[styles.item, { tintColor: theme.color.secondary }]}
									resizeMode="cover"
								/>
							)}
						</TouchableOpacity>

						{title && (
							<Text
								style={[
									theme.typography.variants.title,
									theme.utils.plsm,
								]}
							>
								{title}
							</Text>
						)}
					</>
				)}
			</View>

			{/* RIGHT SIDE */}
			<View style={[theme.styles.row, theme.styles.alignCenter]}>
				{logoRight && (
					<Image
						source={theme.image.logo}
						style={styles.logoRight}
						resizeMode="contain"
					/>
				)}
				{actions.map((action, index) => {
					// 🔥 Custom render override
					if (action.render) {
						return (
							<View key={index} style={theme.utils.plsm}>
								{action.render()}
							</View>
						);
					}

					return (
						<TouchableOpacity
							key={index}
							onPress={action.onPress}
							activeOpacity={0.8}
							style={theme.utils.plsm}
						>
							<Image
								source={
									action.uri
										? { uri: action.uri }
										: action.icon
								}
								style={[
									styles.item,
									{
										borderColor: theme.color.primary,
										borderWidth: action.uri ? 1 : 0,
										tintColor: action.uri ? undefined : theme.color.secondary,
									},
								]}
								resizeMode="cover"
							/>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	item: {
		height: 40,
		width: 40,
		borderRadius: 20,
	},
	logoRight: {
		height: 32,
		width: 32,
	},
});