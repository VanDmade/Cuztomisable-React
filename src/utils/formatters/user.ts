// utils/formatters/user.ts
import type { PhoneDTO, UserDTO } from '../../utils/types/user';

type User = {
  id: number;
  admin: boolean;
  name: string;
  email: string;
  phone: any;
  mfa: boolean;
  image: any;
  questionnaire_completed?: boolean;
};

function normalizePhone(phone: any): PhoneDTO {
  if (!phone) {
    return null;
  }
  return {
    countryCode: Number(phone.country_code ?? 1),
    number: String(phone.phone ?? phone.number ?? ''),
  };
}

function normalizeImage(image: any): string | null {
  if (!image) {
    return null;
  }
  // If image is just a URL string, return it directly
  if (typeof image === 'string') {
  } else {
    image = image.url ?? null;
  }
  // If it's an object, pick the field you want:
  return image;
}

export function mapUserToUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: normalizePhone(user.phone),
    mfa: Boolean(user.mfa),
    image: normalizeImage(user.image),
    // Only false sends the user to the questionnaire - a backend without one leaves it out
    questionnaireCompleted: user.questionnaire_completed !== false,
  };
}
