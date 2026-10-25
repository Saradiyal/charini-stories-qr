export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  short: string;
  minDigits?: number;
  maxDigits?: number;
  placeholder?: string;
}

export const TOP_COUNTRIES: Country[] = [
  { name: "Sri Lanka", code: "LK", dialCode: "+94", flag: "🇱🇰", short: "LKA", minDigits: 9, maxDigits: 9, placeholder: "77 123 4567" },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", short: "IND", minDigits: 10, maxDigits: 10, placeholder: "98201 98205" },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", short: "UAE", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", short: "GBR", minDigits: 10, maxDigits: 10, placeholder: "7911 123456" },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", short: "USA", minDigits: 10, maxDigits: 10, placeholder: "415 555 2671" },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", short: "SGP", minDigits: 8, maxDigits: 8, placeholder: "8123 4567" },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", short: "AUS", minDigits: 9, maxDigits: 9, placeholder: "412 345 678" },
];

export const ALL_COUNTRIES: Country[] = [
  ...TOP_COUNTRIES,
  { name: "Afghanistan", code: "AF", dialCode: "+93", flag: "🇦🇫", short: "AFG", minDigits: 9, maxDigits: 9, placeholder: "70 123 4567" },
  { name: "Albania", code: "AL", dialCode: "+355", flag: "🇦🇱", short: "ALB", minDigits: 9, maxDigits: 9, placeholder: "67 123 4567" },
  { name: "Algeria", code: "DZ", dialCode: "+213", flag: "🇩🇿", short: "DZA", minDigits: 9, maxDigits: 9, placeholder: "55 123 4567" },
  { name: "Andorra", code: "AD", dialCode: "+376", flag: "🇦🇩", short: "AND", minDigits: 6, maxDigits: 9, placeholder: "312 345" },
  { name: "Angola", code: "AO", dialCode: "+244", flag: "🇦🇴", short: "AGO", minDigits: 9, maxDigits: 9, placeholder: "923 123 456" },
  { name: "Argentina", code: "AR", dialCode: "+54", flag: "🇦🇷", short: "ARG", minDigits: 10, maxDigits: 11, placeholder: "11 1234 5678" },
  { name: "Armenia", code: "AM", dialCode: "+374", flag: "🇦🇲", short: "ARM", minDigits: 8, maxDigits: 8, placeholder: "77 123456" },
  { name: "Austria", code: "AT", dialCode: "+43", flag: "🇦🇹", short: "AUT", minDigits: 10, maxDigits: 11, placeholder: "664 1234567" },
  { name: "Azerbaijan", code: "AZ", dialCode: "+994", flag: "🇦🇿", short: "AZE", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { name: "Bahamas", code: "BS", dialCode: "+1242", flag: "🇧🇸", short: "BHS", minDigits: 7, maxDigits: 7, placeholder: "359 1234" },
  { name: "Bahrain", code: "BH", dialCode: "+973", flag: "🇧🇭", short: "BHR", minDigits: 8, maxDigits: 8, placeholder: "3612 3456" },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩", short: "BGD", minDigits: 10, maxDigits: 10, placeholder: "171 2345678" },
  { name: "Barbados", code: "BB", dialCode: "+1246", flag: "🇧🇧", short: "BRB", minDigits: 7, maxDigits: 7, placeholder: "250 1234" },
  { name: "Belarus", code: "BY", dialCode: "+375", flag: "🇧🇾", short: "BLR", minDigits: 9, maxDigits: 9, placeholder: "29 123 4567" },
  { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪", short: "BEL", minDigits: 9, maxDigits: 9, placeholder: "470 12 34 56" },
  { name: "Belize", code: "BZ", dialCode: "+501", flag: "🇧🇿", short: "BLZ", minDigits: 7, maxDigits: 7, placeholder: "610 1234" },
  { name: "Bermuda", code: "BM", dialCode: "+1441", flag: "🇧🇲", short: "BMU", minDigits: 7, maxDigits: 7, placeholder: "505 1234" },
  { name: "Bhutan", code: "BT", dialCode: "+975", flag: "🇧🇹", short: "BTN", minDigits: 8, maxDigits: 8, placeholder: "17 12 34 56" },
  { name: "Bolivia", code: "BO", dialCode: "+591", flag: "🇧🇴", short: "BOL", minDigits: 8, maxDigits: 8, placeholder: "71234567" },
  { name: "Bosnia and Herzegovina", code: "BA", dialCode: "+387", flag: "🇧🇦", short: "BIH", minDigits: 8, maxDigits: 8, placeholder: "61 123 456" },
  { name: "Botswana", code: "BW", dialCode: "+267", flag: "🇧🇼", short: "BWA", minDigits: 8, maxDigits: 8, placeholder: "71 123 456" },
  { name: "Brazil", code: "BR", dialCode: "+55", flag: "🇧🇷", short: "BRA", minDigits: 11, maxDigits: 11, placeholder: "11 91234 5678" },
  { name: "Brunei", code: "BN", dialCode: "+673", flag: "🇧🇳", short: "BRN", minDigits: 7, maxDigits: 7, placeholder: "712 3456" },
  { name: "Bulgaria", code: "BG", dialCode: "+359", flag: "🇧🇬", short: "BGR", minDigits: 9, maxDigits: 9, placeholder: "87 123 4567" },
  { name: "Cambodia", code: "KH", dialCode: "+855", flag: "🇰🇭", short: "KHM", minDigits: 8, maxDigits: 9, placeholder: "12 345 678" },
  { name: "Cameroon", code: "CM", dialCode: "+237", flag: "🇨🇲", short: "CMR", minDigits: 9, maxDigits: 9, placeholder: "6 71 23 45 67" },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", short: "CAN", minDigits: 10, maxDigits: 10, placeholder: "416 555 0199" },
  { name: "Chile", code: "CL", dialCode: "+56", flag: "🇨🇱", short: "CHL", minDigits: 9, maxDigits: 9, placeholder: "9 1234 5678" },
  { name: "China", code: "CN", dialCode: "+86", flag: "🇨🇳", short: "CHN", minDigits: 11, maxDigits: 11, placeholder: "138 0013 8000" },
  { name: "Colombia", code: "CO", dialCode: "+57", flag: "🇨🇴", short: "COL", minDigits: 10, maxDigits: 10, placeholder: "300 123 4567" },
  { name: "Costa Rica", code: "CR", dialCode: "+506", flag: "🇨🇷", short: "CRI", minDigits: 8, maxDigits: 8, placeholder: "8312 3456" },
  { name: "Croatia", code: "HR", dialCode: "+385", flag: "🇭🇷", short: "HRV", minDigits: 9, maxDigits: 9, placeholder: "91 123 4567" },
  { name: "Cyprus", code: "CY", dialCode: "+357", flag: "🇨🇾", short: "CYP", minDigits: 8, maxDigits: 8, placeholder: "99 123456" },
  { name: "Czech Republic", code: "CZ", dialCode: "+420", flag: "🇨🇿", short: "CZE", minDigits: 9, maxDigits: 9, placeholder: "601 123 456" },
  { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰", short: "DNK", minDigits: 8, maxDigits: 8, placeholder: "20 12 34 56" },
  { name: "Dominican Republic", code: "DO", dialCode: "+1809", flag: "🇩🇴", short: "DOM", minDigits: 7, maxDigits: 7, placeholder: "234 5678" },
  { name: "Ecuador", code: "EC", dialCode: "+593", flag: "🇪🇨", short: "ECU", minDigits: 9, maxDigits: 9, placeholder: "99 123 4567" },
  { name: "Egypt", code: "EG", dialCode: "+20", flag: "🇪🇬", short: "EGY", minDigits: 10, maxDigits: 10, placeholder: "10 1234 5678" },
  { name: "Estonia", code: "EE", dialCode: "+372", flag: "🇪🇪", short: "EST", minDigits: 7, maxDigits: 8, placeholder: "512 3456" },
  { name: "Ethiopia", code: "ET", dialCode: "+251", flag: "🇪🇹", short: "ETH", minDigits: 9, maxDigits: 9, placeholder: "91 123 4567" },
  { name: "Fiji", code: "FJ", dialCode: "+679", flag: "🇫🇯", short: "FJI", minDigits: 7, maxDigits: 7, placeholder: "701 2345" },
  { name: "Finland", code: "FI", dialCode: "+358", flag: "🇫🇮", short: "FIN", minDigits: 9, maxDigits: 10, placeholder: "41 234 5678" },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", short: "FRA", minDigits: 9, maxDigits: 9, placeholder: "6 12 34 56 78" },
  { name: "Georgia", code: "GE", dialCode: "+995", flag: "🇬🇪", short: "GEO", minDigits: 9, maxDigits: 9, placeholder: "555 12 34 56" },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", short: "DEU", minDigits: 10, maxDigits: 11, placeholder: "151 2345678" },
  { name: "Ghana", code: "GH", dialCode: "+233", flag: "🇬🇭", short: "GHA", minDigits: 9, maxDigits: 9, placeholder: "24 123 4567" },
  { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷", short: "GRC", minDigits: 10, maxDigits: 10, placeholder: "69 1234 5678" },
  { name: "Hong Kong", code: "HK", dialCode: "+852", flag: "🇭🇰", short: "HKG", minDigits: 8, maxDigits: 8, placeholder: "9123 4567" },
  { name: "Hungary", code: "HU", dialCode: "+36", flag: "🇭🇺", short: "HUN", minDigits: 9, maxDigits: 9, placeholder: "20 123 4567" },
  { name: "Iceland", code: "IS", dialCode: "+354", flag: "🇮🇸", short: "ISL", minDigits: 7, maxDigits: 7, placeholder: "612 3456" },
  { name: "Indonesia", code: "ID", dialCode: "+62", flag: "🇮🇩", short: "IDN", minDigits: 9, maxDigits: 12, placeholder: "812 3456 7890" },
  { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪", short: "IRL", minDigits: 9, maxDigits: 9, placeholder: "85 123 4567" },
  { name: "Israel", code: "IL", dialCode: "+972", flag: "🇮🇱", short: "ISR", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹", short: "ITA", minDigits: 10, maxDigits: 10, placeholder: "312 345 6789" },
  { name: "Jamaica", code: "JM", dialCode: "+1876", flag: "🇯🇲", short: "JAM", minDigits: 7, maxDigits: 7, placeholder: "210 1234" },
  { name: "Japan", code: "JP", dialCode: "+81", flag: "🇯🇵", short: "JPN", minDigits: 10, maxDigits: 10, placeholder: "90 1234 5678" },
  { name: "Jordan", code: "JO", dialCode: "+962", flag: "🇯🇴", short: "JOR", minDigits: 9, maxDigits: 9, placeholder: "7 9123 4567" },
  { name: "Kazakhstan", code: "KZ", dialCode: "+7", flag: "🇰🇿", short: "KAZ", minDigits: 10, maxDigits: 10, placeholder: "701 123 4567" },
  { name: "Kenya", code: "KE", dialCode: "+254", flag: "🇰🇪", short: "KEN", minDigits: 9, maxDigits: 9, placeholder: "712 345678" },
  { name: "Kuwait", code: "KW", dialCode: "+965", flag: "🇰🇼", short: "KWT", minDigits: 8, maxDigits: 8, placeholder: "9912 3456" },
  { name: "Lebanon", code: "LB", dialCode: "+961", flag: "🇱🇧", short: "LBN", minDigits: 8, maxDigits: 8, placeholder: "70 123 456" },
  { name: "Luxembourg", code: "LU", dialCode: "+352", flag: "🇱🇺", short: "LUX", minDigits: 9, maxDigits: 9, placeholder: "621 123 456" },
  { name: "Macau", code: "MO", dialCode: "+853", flag: "🇲🇴", short: "MAC", minDigits: 8, maxDigits: 8, placeholder: "6612 3456" },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾", short: "MYS", minDigits: 9, maxDigits: 10, placeholder: "12 345 6789" },
  { name: "Maldives", code: "MV", dialCode: "+960", flag: "🇲🇻", short: "MDV", minDigits: 7, maxDigits: 7, placeholder: "777 1234" },
  { name: "Malta", code: "MT", dialCode: "+356", flag: "🇲🇹", short: "MLT", minDigits: 8, maxDigits: 8, placeholder: "9912 3456" },
  { name: "Mauritius", code: "MU", dialCode: "+230", flag: "🇲🇺", short: "MUS", minDigits: 8, maxDigits: 8, placeholder: "5123 4567" },
  { name: "Mexico", code: "MX", dialCode: "+52", flag: "🇲🇽", short: "MEX", minDigits: 10, maxDigits: 10, placeholder: "55 1234 5678" },
  { name: "Monaco", code: "MC", dialCode: "+377", flag: "🇲🇨", short: "MCO", minDigits: 8, maxDigits: 9, placeholder: "6 12 34 56 78" },
  { name: "Morocco", code: "MA", dialCode: "+212", flag: "🇲🇦", short: "MAR", minDigits: 9, maxDigits: 9, placeholder: "650 123456" },
  { name: "Nepal", code: "NP", dialCode: "+977", flag: "🇳🇵", short: "NPL", minDigits: 10, maxDigits: 10, placeholder: "984 1234567" },
  { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱", short: "NLD", minDigits: 9, maxDigits: 9, placeholder: "6 12345678" },
  { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿", short: "NZL", minDigits: 8, maxDigits: 10, placeholder: "21 123 4567" },
  { name: "Nigeria", code: "NG", dialCode: "+234", flag: "🇳🇬", short: "NGA", minDigits: 10, maxDigits: 10, placeholder: "802 123 4567" },
  { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴", short: "NOR", minDigits: 8, maxDigits: 8, placeholder: "412 34 567" },
  { name: "Oman", code: "OM", dialCode: "+968", flag: "🇴🇲", short: "OMN", minDigits: 8, maxDigits: 8, placeholder: "9112 3456" },
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰", short: "PAK", minDigits: 10, maxDigits: 10, placeholder: "300 1234567" },
  { name: "Panama", code: "PA", dialCode: "+507", flag: "🇵🇦", short: "PAN", minDigits: 8, maxDigits: 8, placeholder: "6123 4567" },
  { name: "Peru", code: "PE", dialCode: "+51", flag: "🇵🇪", short: "PER", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { name: "Philippines", code: "PH", dialCode: "+63", flag: "🇵🇭", short: "PHL", minDigits: 10, maxDigits: 10, placeholder: "917 123 4567" },
  { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱", short: "POL", minDigits: 9, maxDigits: 9, placeholder: "512 345 678" },
  { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹", short: "PRT", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { name: "Qatar", code: "QA", dialCode: "+974", flag: "🇶🇦", short: "QAT", minDigits: 8, maxDigits: 8, placeholder: "3312 3456" },
  { name: "Romania", code: "RO", dialCode: "+40", flag: "🇷🇴", short: "ROU", minDigits: 9, maxDigits: 9, placeholder: "712 345 678" },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", short: "SAU", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { name: "Seychelles", code: "SC", dialCode: "+248", flag: "🇸🇨", short: "SYC", minDigits: 7, maxDigits: 7, placeholder: "251 2345" },
  { name: "Slovakia", code: "SK", dialCode: "+421", flag: "🇸🇰", short: "SVK", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { name: "Slovenia", code: "SI", dialCode: "+386", flag: "🇸🇮", short: "SVN", minDigits: 8, maxDigits: 8, placeholder: "31 234 567" },
  { name: "South Africa", code: "ZA", dialCode: "+27", flag: "🇿🇦", short: "ZAF", minDigits: 9, maxDigits: 9, placeholder: "71 123 4567" },
  { name: "South Korea", code: "KR", dialCode: "+82", flag: "🇰🇷", short: "KOR", minDigits: 9, maxDigits: 10, placeholder: "10 1234 5678" },
  { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸", short: "ESP", minDigits: 9, maxDigits: 9, placeholder: "612 34 56 78" },
  { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪", short: "SWE", minDigits: 9, maxDigits: 9, placeholder: "70 123 45 67" },
  { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭", short: "CHE", minDigits: 9, maxDigits: 9, placeholder: "79 123 45 67" },
  { name: "Taiwan", code: "TW", dialCode: "+886", flag: "🇹🇼", short: "TWN", minDigits: 9, maxDigits: 9, placeholder: "912 345 678" },
  { name: "Tanzania", code: "TZ", dialCode: "+255", flag: "🇹🇿", short: "TZA", minDigits: 9, maxDigits: 9, placeholder: "712 345 678" },
  { name: "Thailand", code: "TH", dialCode: "+66", flag: "🇹🇭", short: "THA", minDigits: 9, maxDigits: 9, placeholder: "81 234 5678" },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷", short: "TUR", minDigits: 10, maxDigits: 10, placeholder: "532 123 4567" },
  { name: "Uganda", code: "UG", dialCode: "+256", flag: "🇺🇬", short: "UGA", minDigits: 9, maxDigits: 9, placeholder: "712 345678" },
  { name: "Ukraine", code: "UA", dialCode: "+380", flag: "🇺🇦", short: "UKR", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { name: "Uruguay", code: "UY", dialCode: "+598", flag: "🇺🇾", short: "URY", minDigits: 8, maxDigits: 8, placeholder: "94 123 456" },
  { name: "Uzbekistan", code: "UZ", dialCode: "+998", flag: "🇺🇿", short: "UZB", minDigits: 9, maxDigits: 9, placeholder: "90 123 4567" },
  { name: "Vietnam", code: "VN", dialCode: "+84", flag: "🇻🇳", short: "VNM", minDigits: 9, maxDigits: 9, placeholder: "91 234 5678" },
  { name: "Zambia", code: "ZM", dialCode: "+260", flag: "🇿🇲", short: "ZMB", minDigits: 9, maxDigits: 9, placeholder: "97 1234567" },
  { name: "Zimbabwe", code: "ZW", dialCode: "+263", flag: "🇿🇼", short: "ZWE", minDigits: 9, maxDigits: 9, placeholder: "71 234 5678" },
];

// Unique sorted list of all countries for clean selection
export const SORTED_ALL_COUNTRIES: Country[] = Array.from(
  new Map(ALL_COUNTRIES.map((c) => [c.name, c])).values()
).sort((a, b) => a.name.localeCompare(b.name));

/**
 * Strips non-digits and removes domestic trunk prefix zeros (e.g. 076... -> 76...)
 */
export function cleanPhoneNumber(val: string): string {
  if (!val) return "";
  const digits = val.replace(/\D/g, "");
  return digits.replace(/^0+/, "");
}

/**
 * Returns phone digits metadata for a country with reliable defaults
 */
export function getCountryPhoneRules(country: Country | null | undefined): {
  minDigits: number;
  maxDigits: number;
  placeholder: string;
} {
  if (!country) return { minDigits: 7, maxDigits: 12, placeholder: "Mobile number" };
  const min = country.minDigits || 7;
  const max = country.maxDigits || 12;
  const placeholder = country.placeholder || "Mobile number";
  return { minDigits: min, maxDigits: max, placeholder };
}

/**
 * Validates national mobile phone number against country-specific length constraints
 */
export function validatePhoneNumber(
  phone: string,
  country: Country
): { valid: boolean; message?: string; cleanPhone: string } {
  const clean = cleanPhoneNumber(phone);
  const { minDigits, maxDigits } = getCountryPhoneRules(country);

  if (!clean) {
    return { valid: false, message: "Please enter your mobile number.", cleanPhone: "" };
  }

  if (minDigits === maxDigits) {
    if (clean.length !== minDigits) {
      return {
        valid: false,
        message: `Please enter a valid ${minDigits}-digit mobile number for ${country.name}.`,
        cleanPhone: clean,
      };
    }
  } else {
    if (clean.length < minDigits || clean.length > maxDigits) {
      return {
        valid: false,
        message: `Please enter a valid mobile number for ${country.name} (${minDigits}–${maxDigits} digits).`,
        cleanPhone: clean,
      };
    }
  }

  return { valid: true, cleanPhone: clean };
}
