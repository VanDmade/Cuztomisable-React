// cuztomisable/services/questionnaire.service.ts
// The questionnaire API - the questions the user still has to answer, searching a question's choices, and saving
// answers. Matches the backend package's /questionnaire routes.
import { getApi as api } from '../api/api';

export type QuestionnaireType = 'boolean' | 'select' | 'multi_select' | 'text' | 'number' | 'date';

export type QuestionnaireOption = {
    value: string | number | boolean;
    label: string;
    image?: string | null;
};

export type QuestionnaireQuestion = {
    key: string;
    type: QuestionnaireType;
    title: string;
    subtitle: string | null;
    description: string | null;
    image: string | null;
    required: boolean;
    // Fixed choices - null when they come from a source, fetched with getQuestionnaireOptions()
    options: QuestionnaireOption[] | null;
    source: string | null;
    allow_other: boolean;
    other_label: string | null;
    placeholder: string | null;
    min: number | null;
    max: number | null;
};

export type Questionnaire = {
    enabled: boolean;
    completed: boolean;
    questions: QuestionnaireQuestion[];
};

// An answer is the value itself, or { other: true } for "I can't find it"
export type QuestionnaireAnswer = string | number | boolean | (string | number)[] | { other: true };

export type QuestionnaireSaveResult = {
    completed: boolean;
    // Keys of questions answered with "I can't find it", for the app to follow up on
    other: string[];
};

export async function getQuestionnaire(): Promise<Questionnaire> {
    const { data } = await api().get('questionnaire');
    return {
        enabled: !!data?.enabled,
        completed: !!data?.completed,
        questions: data?.questions ?? [],
    };
}

export async function getQuestionnaireOptions(key: string, search?: string): Promise<QuestionnaireOption[]> {
    const { data } = await api().get(`questionnaire/${key}/options`, { params: search ? { search } : {} });
    return data?.options ?? [];
}

export async function saveQuestionnaire(answers: Record<string, QuestionnaireAnswer>): Promise<QuestionnaireSaveResult> {
    const { data } = await api().post('questionnaire', { answers });
    return { completed: !!data?.completed, other: data?.other ?? [] };
}
