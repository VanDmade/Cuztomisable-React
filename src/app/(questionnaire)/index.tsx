// src/app/(questionnaire)/index.tsx
// The questionnaire - one screen that asks whatever questions the backend says the user still has to answer, one at
// a time. Nothing here is specific to an app: the questions, their text, choices and order all come from the API.
// Every answer is sent together at the end, since an answer is final once it's saved.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components';
import { confirmDialog } from '../../components/ui/confirmDialog';
import { Loading } from '../../components/ui/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../providers/ConfigProvider';
import { useTheme } from '../../providers/ThemeProvider';
import {
    getQuestionnaire,
    getQuestionnaireOptions,
    QuestionnaireAnswer,
    QuestionnaireOption,
    QuestionnaireQuestion,
    saveQuestionnaire,
} from '../../services/questionnaire.service';

type Value = QuestionnaireAnswer | undefined;

const isOther = (value: Value): value is { other: true } => typeof value === 'object' && value !== null && !Array.isArray(value);

function isAnswered(value: Value): boolean {
    if (value === undefined || value === null || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

export default function QuestionnaireScreen() {
    const theme = useTheme();
    const config = useConfig();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { refreshUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, Value>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [current, setCurrent] = useState(0);

    // Done (or nothing to ask) - refresh the user so the app stops sending them here, then head home
    const finish = useCallback(async (other: string[] = []) => {
        await refreshUser().catch(() => {});
        const followUps = (config as any).questionnaire?.followUps ?? {};
        const followUp = other.map((key) => followUps[key]).find(Boolean);
        router.replace(config.homeRoute as any);
        // An "I can't find it" answer the app wants to follow up on, e.g. adding the drink they couldn't find
        if (followUp?.route) {
            confirmDialog({
                title: followUp.title,
                message: followUp.message,
                confirmText: followUp.confirmText ?? 'Continue',
                cancelText: followUp.cancelText ?? 'Later',
                onConfirm: () => router.push(followUp.route),
            });
        }
    }, [config, refreshUser, router]);

    const load = useCallback(async () => {
        setLoading(true);
        setFailed(false);
        try {
            const questionnaire = await getQuestionnaire();
            if (!questionnaire.enabled || questionnaire.questions.length === 0) {
                await finish();
                return;
            }
            setQuestions(questionnaire.questions);
        } catch {
            setFailed(true);
        } finally {
            setLoading(false);
        }
    }, [finish]);

    useEffect(() => { load(); }, [load]);

    const question = questions[current];
    const value = question ? answers[question.key] : undefined;
    const isLast = current === questions.length - 1;
    const canContinue = !question?.required || isAnswered(value);

    const setValue = (key: string, next: Value) => {
        setAnswers((prev) => ({ ...prev, [key]: next }));
        setErrors((prev) => ({ ...prev, [key]: '' }));
    };

    const submit = async () => {
        setSaving(true);
        try {
            // Unanswered optional questions are left out, so they're asked again next time
            const payload = Object.fromEntries(Object.entries(answers).filter(([, v]) => isAnswered(v))) as Record<string, QuestionnaireAnswer>;
            const result = await saveQuestionnaire(payload);
            await finish(result.other);
        } catch (e: any) {
            // Field errors come back as answers.{key} - show them and go back to the first one
            const details = e?.details ?? {};
            const fieldErrors: Record<string, string> = {};
            Object.keys(details).forEach((field) => {
                const key = field.replace(/^answers\./, '');
                fieldErrors[key] = details[field]?.[0] ?? '';
            });
            setErrors(fieldErrors);
            const first = questions.findIndex((q) => fieldErrors[q.key]);
            if (first >= 0) setCurrent(first);
            else setErrors({ [question.key]: e?.message ?? 'Could not save your answers. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const next = () => (isLast ? submit() : setCurrent(current + 1));

    if (loading) {
        return <Loading />;
    }

    if (failed || !question) {
        return (
            <View style={[theme.styles.flex, theme.styles.background, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
                <MaterialIcons name="cloud-off" size={48} color={theme.color.muted} />
                <Text style={{ color: theme.color.muted, fontSize: 16, marginTop: 12, textAlign: 'center' }}>Couldn't load the questions.</Text>
                <Button title="Try again" onPress={load} containerStyle={{ marginTop: 16 }} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[theme.styles.flex, theme.styles.background]}>
            <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }}>
                <Text style={{ color: theme.color.muted, fontSize: 13, marginBottom: 8 }}>
                    Question {current + 1} of {questions.length}
                </Text>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.color.border, overflow: 'hidden' }}>
                    <View style={{ width: `${((current + 1) / questions.length) * 100}%`, height: '100%', backgroundColor: theme.color.primary }} />
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
                {!!question.image && (
                    <Image source={{ uri: question.image }} style={{ width: '100%', height: 180, borderRadius: 16, marginBottom: 20 }} resizeMode="cover" />
                )}
                <Text style={{ color: theme.color.text, fontSize: 24, fontWeight: '700' }}>{question.title}</Text>
                {!!question.subtitle && <Text style={{ color: theme.color.muted, fontSize: 16, marginTop: 6 }}>{question.subtitle}</Text>}
                {!!question.description && <Text style={{ color: theme.color.text, fontSize: 14, lineHeight: 20, marginTop: 10 }}>{question.description}</Text>}

                <View style={{ marginTop: 24 }}>
                    <QuestionInput question={question} value={value} onChange={(next) => setValue(question.key, next)} />
                </View>
                {!!errors[question.key] && (
                    <Text style={{ color: theme.color.danger, marginTop: 10 }}>{errors[question.key]}</Text>
                )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: theme.color.border }}>
                {current > 0 && (
                    <Button title="Back" intent="secondary" onPress={() => setCurrent(current - 1)} containerStyle={{ flex: 1 }} fullWidth />
                )}
                <Button
                    title={isLast ? 'Finish' : !question.required && !isAnswered(value) ? 'Skip' : 'Next'}
                    intent="primary"
                    disabled={!canContinue || saving}
                    loading={saving}
                    onPress={next}
                    containerStyle={{ flex: 2 }}
                    fullWidth />
            </View>
        </KeyboardAvoidingView>
    );
}

/** The input for one question, picked by its type. */
function QuestionInput({ question, value, onChange }: { question: QuestionnaireQuestion; value: Value; onChange: (value: Value) => void }) {
    switch (question.type) {
        case 'boolean':
            return (
                <ChoiceList
                    options={question.options ?? [{ value: true, label: 'Yes' }, { value: false, label: 'No' }]}
                    selected={(option) => value === option.value}
                    onPick={(option) => onChange(option.value as boolean)} />
            );
        case 'select':
        case 'multi_select': {
            const multi = question.type === 'multi_select';
            const picked = (option: QuestionnaireOption) => multi
                ? Array.isArray(value) && value.includes(option.value as string | number)
                : !isOther(value) && value === option.value;
            const pick = (option: QuestionnaireOption) => {
                if (!multi) return onChange(option.value as string | number);
                const list = Array.isArray(value) ? value : [];
                const v = option.value as string | number;
                onChange(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
            };
            const other = question.allow_other && !multi ? {
                label: question.other_label ?? "I can't find it",
                selected: isOther(value),
                onPick: () => onChange({ other: true }),
            } : undefined;
            return question.source
                ? <SourceList question={question} selected={picked} onPick={pick} other={other} />
                : <ChoiceList options={question.options ?? []} selected={picked} onPick={pick} multi={multi} other={other} />;
        }
        case 'number':
        case 'text':
        case 'date':
            return (
                <TextAnswer
                    value={value === undefined || isOther(value) || Array.isArray(value) ? '' : String(value)}
                    placeholder={question.placeholder ?? (question.type === 'date' ? 'YYYY-MM-DD' : undefined)}
                    numeric={question.type === 'number'}
                    // Numbers stay as typed (so "1." can become "1.5") - the backend checks they're numeric
                    onChange={(text) => onChange(text === '' ? undefined : text)} />
            );
        default:
            return null;
    }
}

type OtherChoice = { label: string; selected: boolean; onPick: () => void };

/** Tappable rows - one pick, or several for multi-select. */
function ChoiceList({ options, selected, onPick, multi = false, other }: {
    options: QuestionnaireOption[];
    selected: (option: QuestionnaireOption) => boolean;
    onPick: (option: QuestionnaireOption) => void;
    multi?: boolean;
    other?: OtherChoice;
}) {
    return (
        <View style={{ gap: 10 }}>
            {options.map((option) => (
                <ChoiceRow key={String(option.value)} label={option.label} image={option.image} selected={selected(option)} multi={multi} onPress={() => onPick(option)} />
            ))}
            {other && <ChoiceRow label={other.label} selected={other.selected} onPress={other.onPick} muted />}
        </View>
    );
}

function ChoiceRow({ label, image, selected, multi = false, muted = false, onPress }: {
    label: string;
    image?: string | null;
    selected: boolean;
    multi?: boolean;
    muted?: boolean;
    onPress: () => void;
    key?: any;
}) {
    const theme = useTheme();
    const icon = multi ? (selected ? 'check-box' : 'check-box-outline-blank') : (selected ? 'radio-button-checked' : 'radio-button-unchecked');
    return (
        <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={{
            // Same border width either way - only the color changes, so picking a choice doesn't shift anything
            flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 2,
            borderColor: selected ? theme.color.primary : theme.color.border,
            backgroundColor: selected ? theme.color.primary + '14' : theme.color.surface,
        }}>
            {!!image && <Image source={{ uri: image }} style={{ width: 36, height: 36, borderRadius: 8 }} />}
            <Text style={{ flex: 1, color: muted ? theme.color.muted : theme.color.text, fontSize: 16 }}>{label}</Text>
            <MaterialIcons name={icon as any} size={22} color={selected ? theme.color.primary : theme.color.muted} />
        </TouchableOpacity>
    );
}

/** Choices that come from the app's own data - searched as the user types, since the list can be long. */
function SourceList({ question, selected, onPick, other }: {
    question: QuestionnaireQuestion;
    selected: (option: QuestionnaireOption) => boolean;
    onPick: (option: QuestionnaireOption) => void;
    other?: OtherChoice;
}) {
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [options, setOptions] = useState<QuestionnaireOption[]>([]);
    const [loading, setLoading] = useState(true);
    // The picked choice stays visible even when a new search no longer returns it
    const [picked, setPicked] = useState<QuestionnaireOption | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        setLoading(true);
        timer.current = setTimeout(() => {
            getQuestionnaireOptions(question.key, search.trim() || undefined)
                .then(setOptions)
                .catch(() => setOptions([]))
                .finally(() => setLoading(false));
        }, 300);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [question.key, search]);

    const shown = picked && selected(picked) && !options.some((o) => o.value === picked.value) ? [picked, ...options] : options;

    return (
        <View style={{ gap: 10 }}>
            <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 12,
                borderWidth: 1, borderColor: theme.color.border, backgroundColor: theme.color.surface,
            }}>
                <MaterialIcons name="search" size={20} color={theme.color.muted} />
                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder={question.placeholder ?? 'Search'}
                    placeholderTextColor={theme.color.muted}
                    style={{ flex: 1, paddingVertical: 12, color: theme.color.text, fontSize: 16 }} />
            </View>
            {loading && shown.length === 0 ? (
                <ActivityIndicator color={theme.color.primary} style={{ paddingVertical: 24 }} />
            ) : shown.length === 0 ? (
                <Text style={{ color: theme.color.muted, textAlign: 'center', paddingVertical: 16 }}>Nothing matches that search.</Text>
            ) : (
                shown.map((option) => (
                    <ChoiceRow
                        key={String(option.value)}
                        label={option.label}
                        image={option.image}
                        selected={selected(option)}
                        onPress={() => { setPicked(option); onPick(option); }} />
                ))
            )}
            {other && <ChoiceRow label={other.label} selected={other.selected} onPress={other.onPick} muted />}
        </View>
    );
}

function TextAnswer({ value, placeholder, numeric, onChange }: { value: string; placeholder?: string; numeric: boolean; onChange: (text: string) => void }) {
    const theme = useTheme();
    return (
        <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor={theme.color.muted}
            keyboardType={numeric ? 'numeric' : 'default'}
            style={{
                paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: 1, fontSize: 16,
                borderColor: theme.color.border, backgroundColor: theme.color.surface, color: theme.color.text,
            }} />
    );
}
