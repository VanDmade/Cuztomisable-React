// types/user.ts
export type PhoneDTO = {
  countryCode: number;
  number: string;
} | null;

export type UserDTO = {
  id: number;
  name: string;
  email: string;
  phone: PhoneDTO;
  mfa: boolean;
  image: string | null; // or a more complex shape if profile->output() returns more
  // False while the user has questionnaire questions waiting - see app/(questionnaire)
  questionnaireCompleted: boolean;
};
