// src/app/(settings)/privacy.tsx
import { StyleSheet, Text, View } from 'react-native';

import { FormHeader, FormScreen } from '../../components';
import { useConfig } from '../../providers/ConfigProvider';
import { useTheme } from '../../providers/ThemeProvider';

export default function PrivacyScreen() {
    const theme = useTheme();
    const config = useConfig();
    const baseText = { color: theme.color.text };
    return (
        <FormScreen paddingTop={20}>
            {() => (
                <View style={[theme.styles.container, theme.styles.background, theme.utils.pxmd]}>
                    <FormHeader
                        theme={theme}
                        title="Privacy Policy"
                        subtitle={config.privacyPolicyLastUpdated} />
                    <View style={[theme.utils.mtlg, theme.utils.widthFull]}>
                        <Text style={baseText}>We respect your privacy and are committed to protecting any personal information you choose to share with us. This temporary privacy policy explains, in simple terms, what data we collect, how we use it, and the limited circumstances in which it may be shared.</Text>
                        <Text style={[styles.reportTitle, theme.utils.mtsm, baseText]}>Information We Collect</Text>
                        <Text style={baseText}>We may collect basic information you voluntarily provide - such as your name, email address, or account details - when you use the app. We also collect anonymous usage data to help us understand how people interact with our features and improve the experience.</Text>
                        <Text style={[styles.reportTitle, theme.utils.mtsm, baseText]}>How We Use Your Information</Text>
                        <Text style={baseText}>We use the information we collect solely to:</Text>
                        <View style={[theme.utils.mtsm, styles.row, baseText]}>
                            <Text style={[styles.bullet, baseText]}>{'\u2022'}</Text>
                            <Text style={[styles.text, baseText]}>Operate and maintain the app</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.bullet, baseText]}>{'\u2022'}</Text>
                            <Text style={[styles.text, baseText]}>Provide core features and functionality</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.bullet, baseText]}>{'\u2022'}</Text>
                            <Text style={[styles.text, baseText]}>Improve performance, reliability, and user experience</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.bullet, baseText]}>{'\u2022'}</Text>
                            <Text style={[styles.text, baseText]}>Communicate important updates or relevant information</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={[styles.bullet, baseText]}>{'\u2022'}</Text>
                            <Text style={[styles.text, baseText]}>We do not sell your data or share it with third-party marketers.</Text>
                        </View>
                        <Text style={[styles.reportTitle, theme.utils.mtsm, baseText]}>Third-Party Services</Text>
                        <Text style={baseText}>Some features may rely on trusted third-party services such as analytics, cloud storage, or authentication providers. These services may process limited data strictly as needed to support the app’s functionality.</Text>
                        <Text style={[styles.reportTitle, theme.utils.mtsm, baseText]}>Data Security</Text>
                        <Text style={baseText}>We take reasonable precautions to protect your personal information from unauthorized access, loss, or misuse. While no system is perfectly secure, we continuously work to enhance our security measures.</Text>
                        <Text style={[styles.reportTitle, theme.utils.mtsm, baseText]}>Your Choices</Text>
                        <Text style={baseText}>You may update or delete your information by contacting us or adjusting your account settings, where available. If you choose to stop using the app, you may request removal of your personal data.</Text>
                        <Text style={[styles.reportTitle, theme.utils.mtsm, baseText]}>Changes to This Policy</Text>
                        <Text style={baseText}>This temporary Privacy Policy may be updated as the app evolves. We will revise the &#34;Last Updated&#34; date whenever changes are made.</Text>
                        <Text style={[styles.reportTitle, theme.utils.mtsm, baseText]}>Contact Us</Text>
                        <Text style={baseText}>If you have any questions, concerns, or requests regarding your privacy, feel free to contact us at: {config.supportEmail}</Text>
                    </View>
                </View>
            )}
        </FormScreen>
    );
}

const styles = StyleSheet.create({
    reportTitle: {
        fontWeight: 600,
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    bullet: {
        fontSize: 20,
        lineHeight: 16,
    },
    text: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        lineHeight: 16,
    },
});
