import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../providers/ThemeProvider';

import { Dropdown, type DropdownHandle, type DropdownOption } from '../../components/form/Dropdown';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type FooterNavItem = {
	key: string;
	route: string;
	icon: IconName;
	position?: 'left' | 'right';
};

type Props = {
	items: FooterNavItem[];
	actions?: DropdownOption<string>[];
	plusTitle?: string;
	plusActionRoute?: string;
	plusActionRoutes?: Record<string, string>;
	enablePlusDropdown?: boolean;
	activeKey?: string;
	dropdownKey?: string;
	dropdownOptions?: DropdownOption<string>[];
	dropdownTitle?: string;
	fabIcon?: IconName;
	fabOnPress?: () => void;
};

export const Footer: React.FC<Props> = ({
	items,
	actions = [] as DropdownOption<string>[],
	plusTitle = 'Quick actions',
	plusActionRoute,
	plusActionRoutes,
	enablePlusDropdown = true,
	activeKey,
	dropdownKey,
	dropdownOptions = [] as DropdownOption<string>[],
	dropdownTitle = 'Select an option',
	fabIcon,
	fabOnPress,
}) => {
	const theme = useTheme();
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const frozenBottomInset = useMemo(() => insets.bottom, []);
	const navHeight = useMemo(() => 66 + frozenBottomInset, [frozenBottomInset]);
	const plusDropdownRef = useRef<DropdownHandle>(null);
	const navDropdownRef = useRef<DropdownHandle>(null);
	const safeItems = useMemo(() => (items ?? []).slice(0, 6), [items]);
	const showPlusDropdown = enablePlusDropdown && actions.length > 0;
	const showPlus = showPlusDropdown || !!plusActionRoute || !!plusActionRoutes || !!fabOnPress;
	const showNavDropdown = !!dropdownKey && dropdownOptions.length > 0;

	// True when the current page matches one of the dropdown options (e.g. ingredients/glasses/equipment)
	const isDropdownRouteActive = useMemo(() => {
		if (!activeKey || !dropdownOptions.length) {
			return false;
		}
		return dropdownOptions.some(opt => !opt.divider && (opt.value as string)?.includes(`/${activeKey}`));
	}, [activeKey, dropdownOptions]);

	// The matching dropdown option value for the current page (used to highlight it in the modal)
	const activeDropdownRoute = useMemo(() => {
		if (!activeKey || !dropdownOptions.length) {
			return undefined;
		}
		return dropdownOptions.find(opt => !opt.divider && (opt.value as string)?.includes(`/${activeKey}`))?.value;
	}, [activeKey, dropdownOptions]);

	const leftItems = useMemo(
		() => safeItems.filter(i => (i.position ?? 'left') !== 'right'),
		[safeItems]
	);
	const rightItems = useMemo(
		() => safeItems.filter(i => (i.position ?? 'left') === 'right'),
		[safeItems]
	);

	const go = (path: string) => router.push(path as any);
	const resolvePlusRoute = () => {
		if (activeKey && plusActionRoutes?.[activeKey]) {
			return plusActionRoutes[activeKey];
		}
		return plusActionRoute;
	};

	const handleItemPress = (item: FooterNavItem) => {
		// Already on this tab — do nothing
		if (item.key === activeKey) {
			return;
		}
		if (showNavDropdown && item.key === dropdownKey) {
			navDropdownRef.current?.open();
			return;
		}
		go(item.route);
	};

	const renderNavItem = (item: FooterNavItem) => {
		const isActive = item.key === activeKey || (item.key === dropdownKey && isDropdownRouteActive);
		return (
			<TouchableOpacity
				key={item.key}
				activeOpacity={0.7}
				onPress={() => handleItemPress(item)}
				style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				{isActive && (
					<View style={{
						position: 'absolute',
						top: 0,
						alignSelf: 'center',
						width: '70%',
						height: 3,
						backgroundColor: theme.color.secondary,
						borderBottomLeftRadius: 2,
						borderBottomRightRadius: 2,
					}} />
				)}
				<MaterialCommunityIcons
					name={item.icon}
					size={24}
					color={isActive ? theme.color.secondary : theme.color.text} />
			</TouchableOpacity>
		);
	};

	return (
		(leftItems.length > 0 || rightItems.length > 0 || showPlus ?
			<View style={[theme.styles.positionRelative, { height: navHeight }]}>
				{showNavDropdown && (
					<View style={{ height: 0, overflow: 'hidden' }}>
						<Dropdown
							ref={navDropdownRef}
							theme={theme}
							showField={false}
							modalTitle={dropdownTitle}
							options={dropdownOptions}
							value={activeDropdownRoute}
							onSelect={(route) => go(route)} />
					</View>
				)}
				{showPlus && (
					showPlusDropdown ? (
						<View style={{ height: 0, overflow: 'hidden' }}>
							<Dropdown
								ref={plusDropdownRef}
								theme={theme}
								showField={false}
								modalTitle={plusTitle}
								options={actions}
								onSelect={(route) => go(route)} />
						</View>
					) : null
				)}
				<View
					style={[
					theme.styles.container,
					theme.styles.background,
					{
						height: navHeight,
						borderTopColor: theme.color.border,
						borderTopWidth: 1,
						paddingBottom: frozenBottomInset,
					},
				]}>
					{showPlus ? (
						<View style={[theme.styles.flex, theme.styles.row, theme.styles.rowSpaceBetween, { alignSelf: 'stretch' }]}>
							<View style={[theme.styles.flex, { flexDirection: 'row', alignSelf: 'stretch' }]}>
								{leftItems.map(item => renderNavItem(item))}
							</View>
							<View style={{ width: 64 }} />
							<View style={[theme.styles.flex, { flexDirection: 'row', alignSelf: 'stretch' }]}>
								{rightItems.map(item => renderNavItem(item))}
							</View>
							<View
								style={[
									theme.styles.positionAbsolute,
									theme.styles.alignCenter,
									{
										left: 0,
										right: 0,
										top: -16,
									},
								]}
								pointerEvents="box-none">
								<View
									style={[
										theme.utils.circle64,
										theme.styles.alignCenter,
										theme.styles.justifyCenter,
										{
											backgroundColor: theme.color.primary,
											borderWidth: 1,
											borderColor: theme.color.border,
										},
									]}>
									<MaterialCommunityIcons
										name={fabIcon ?? "plus"}
										size={28}
										color="#fff"
										onPress={() => {
											if (fabOnPress) {
												fabOnPress();
												return;
											}
											if (showPlusDropdown) {
												plusDropdownRef.current?.open();
											} else {
												const route = resolvePlusRoute();
												if (route) {
													go(route);
												}
											}
										}}
									/>
								</View>
							</View>
						</View>
					) : (
						<View style={[theme.styles.flex, { flexDirection: 'row', alignSelf: 'stretch' }]}>
							{safeItems.map(item => renderNavItem(item))}
						</View>
					)}
				</View>
			</View>
		: null)
	);
};
