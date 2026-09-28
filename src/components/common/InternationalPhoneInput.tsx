import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  CountryCode,
  isValidPhoneNumber,
  parsePhoneNumber,
  AsYouType,
  getCountryCallingCode,
} from 'libphonenumber-js';
import { Search, ChevronDown, Check, AlertCircle, X } from 'lucide-react';
import {
  ALL_COUNTRIES,
  POPULAR_COUNTRIES,
  CountryItem,
  getFlagEmoji,
} from '../../utils/countryData';

export interface PhoneChangeData {
  phoneNumber: string; // Clean national number (e.g. "7738767859")
  countryCode: string; // Dialing code (e.g. "+91")
  countryIso: CountryCode; // 2-letter ISO (e.g. "IN")
  fullPhoneNumber: string; // Formatted E.164 or international (e.g. "+91 77387 67859")
  isValid: boolean;
  errorMessage?: string;
}

interface InternationalPhoneInputProps {
  label?: string;
  required?: boolean;
  phoneNumber: string;
  countryCode?: string;
  countryIso?: CountryCode;
  onChange: (data: PhoneChangeData) => void;
  error?: string;
  helperText?: string;
  className?: string;
}

export const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  label = 'Phone Number',
  required = false,
  phoneNumber,
  countryCode = '+91',
  countryIso = 'IN',
  onChange,
  error: externalError,
  helperText,
  className = '',
}) => {
  const [selectedIso, setSelectedIso] = useState<CountryCode>(countryIso);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync selected country if prop changes
  useEffect(() => {
    if (countryIso && countryIso !== selectedIso) {
      setSelectedIso(countryIso);
    }
  }, [countryIso]);

  // Find selected country metadata
  const currentCountry: CountryItem = useMemo(() => {
    const found = ALL_COUNTRIES.find((c) => c.iso === selectedIso);
    if (found) return found;
    return {
      iso: selectedIso,
      name: 'India',
      dialCode: '+91',
      flag: getFlagEmoji(selectedIso),
    };
  }, [selectedIso]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES;

    // Remove leading '+' from search if searching by dial code
    const cleanQ = q.startsWith('+') ? q.slice(1) : q;

    return ALL_COUNTRIES.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(q);
      const isoMatch = c.iso.toLowerCase() === q;
      const dialMatch =
        c.dialCode.includes(q) ||
        c.dialCode.replace('+', '').includes(cleanQ);
      return nameMatch || isoMatch || dialMatch;
    });
  }, [searchQuery]);

  // Validation & formatting core
  const processPhoneNumber = (rawNumber: string, iso: CountryCode) => {
    // Strip redundant leading dialing code if pasted with country code
    let cleaned = rawNumber.trim();
    const callingDigits = getCountryCallingCode(iso);

    if (cleaned.startsWith(`+${callingDigits}`)) {
      cleaned = cleaned.replace(`+${callingDigits}`, '').trim();
    } else if (cleaned.startsWith(callingDigits) && cleaned.length > callingDigits.length + 5) {
      // E.g., user pasted 917738767859
      cleaned = cleaned.slice(callingDigits.length).trim();
    }

    // Format as you type
    const formatter = new AsYouType(iso);
    const formatted = formatter.input(cleaned);

    let isValid = false;
    let nationalNumber = cleaned.replace(/\D/g, '');
    let fullPhoneNumber = `${currentCountry.dialCode} ${cleaned}`.trim();
    let validationError: string | undefined = undefined;

    if (cleaned) {
      try {
        isValid = isValidPhoneNumber(cleaned, iso);
        if (isValid) {
          const parsed = parsePhoneNumber(cleaned, iso);
          nationalNumber = parsed.nationalNumber;
          fullPhoneNumber = parsed.formatInternational();
        } else {
          validationError = `Invalid phone number for ${currentCountry.name} (${currentCountry.dialCode})`;
        }
      } catch {
        isValid = false;
        validationError = 'Invalid phone number format';
      }
    } else if (required && touched) {
      validationError = 'Phone number is required';
    }

    setInternalError(validationError || null);

    onChange({
      phoneNumber: nationalNumber || cleaned,
      countryCode: currentCountry.dialCode,
      countryIso: iso,
      fullPhoneNumber: isValid ? fullPhoneNumber : `${currentCountry.dialCode} ${cleaned}`.trim(),
      isValid,
      errorMessage: validationError,
    });

    return formatted;
  };

  const handleCountrySelect = (country: CountryItem) => {
    setSelectedIso(country.iso);
    setIsOpen(false);
    setSearchQuery('');

    // Re-evaluate current phone with new country code
    processPhoneNumber(phoneNumber, country.iso);

    // Focus phone input right away
    setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 50);
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits, spaces, parentheses, hyphens
    const filtered = val.replace(/[^\d\s\-()]/g, '');
    processPhoneNumber(filtered, selectedIso);
  };

  const handleBlur = () => {
    setTouched(true);
    processPhoneNumber(phoneNumber, selectedIso);
  };

  const activeError = externalError || (touched ? internalError : null);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label & Indicators */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            {label}
            {required && <span className="text-[#E5A93C] ml-1">*</span>}
          </label>
          {phoneNumber && !activeError && (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Valid International Format
            </span>
          )}
        </div>
      )}

      {/* Input Group: Country Selector Trigger + Dial Code + Phone Field */}
      <div className="relative" ref={dropdownRef}>
        <div
          className={`flex items-stretch rounded-xl bg-[#0D111A] border transition-all duration-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#E5A93C]/40 ${
            activeError
              ? 'border-red-500/70'
              : 'border-[#222838] focus-within:border-[#E5A93C]'
          }`}
        >
          {/* Country Selector Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Select Country"
            aria-expanded={isOpen}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-[#141926] hover:bg-[#1A2132] border-r border-[#222838] transition-colors cursor-pointer text-white select-none shrink-0"
          >
            <span className="text-xl leading-none" role="img" aria-label={currentCountry.name}>
              {currentCountry.flag}
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {currentCountry.dialCode}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-[#E5A93C]' : ''
              }`}
            />
          </button>

          {/* National Phone Number Input */}
          <div className="relative flex-1 flex items-center">
            <input
              ref={phoneInputRef}
              type="tel"
              inputMode="tel"
              value={phoneNumber}
              onChange={handlePhoneInputChange}
              onBlur={handleBlur}
              placeholder={
                selectedIso === 'IN'
                  ? '77387 67859'
                  : selectedIso === 'US' || selectedIso === 'CA'
                  ? '(555) 012-3456'
                  : selectedIso === 'GB'
                  ? '7911 123456'
                  : 'Enter national phone number'
              }
              className="w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none font-mono tracking-wide"
            />

            {phoneNumber && (
              <button
                type="button"
                onClick={() => processPhoneNumber('', selectedIso)}
                className="pr-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Clear phone number"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Popover */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-full sm:w-80 max-w-[95vw] bg-[#121622] border border-[#2A3247] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-80 animate-in fade-in zoom-in-95 duration-150">
            {/* Search Bar */}
            <div className="p-2.5 border-b border-white/10 bg-[#0E121C]">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search country or code (+91, India)..."
                  className="w-full bg-[#181F2F] text-xs text-white placeholder-slate-500 pl-8 pr-7 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-[#E5A93C]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Countries List */}
            <div className="overflow-y-auto flex-1 p-1 divide-y divide-white/5 divide-dashed">
              {/* Popular countries header when not searching */}
              {!searchQuery && (
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E5A93C]/80">
                  Popular Countries
                </div>
              )}

              {/* Popular list */}
              {!searchQuery &&
                POPULAR_COUNTRIES.map((country) => {
                  const isSelected = country.iso === selectedIso;
                  return (
                    <button
                      key={`pop-${country.iso}`}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#E5A93C]/15 text-[#E5A93C] font-semibold'
                          : 'text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base leading-none">{country.flag}</span>
                        <span className="truncate">{country.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 font-medium ml-2 shrink-0">
                        {country.dialCode}
                      </span>
                    </button>
                  );
                })}

              {/* Section Header */}
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
                {searchQuery ? `Matching Countries (${filteredCountries.length})` : 'All Countries'}
              </div>

              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No country matches &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredCountries.map((country) => {
                  const isSelected = country.iso === selectedIso;
                  return (
                    <button
                      key={country.iso}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#E5A93C]/15 text-[#E5A93C] font-semibold'
                          : 'text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base leading-none">{country.flag}</span>
                        <span className="truncate">{country.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400 font-medium ml-2 shrink-0">
                        {country.dialCode}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom info banner */}
            <div className="px-3 py-1.5 bg-[#0C1018] border-t border-white/5 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Standard international dial format</span>
              <span className="font-mono text-[#E5A93C]">libphonenumber</span>
            </div>
          </div>
        )}
      </div>

      {/* Validation Message or Helper Text */}
      {activeError ? (
        <p className="text-[11px] text-red-400 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{activeError}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
      ) : phoneNumber ? (
        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
          Dialing preview:{' '}
          <span className="text-slate-200 font-semibold">
            {currentCountry.dialCode} {phoneNumber}
          </span>
        </p>
      ) : null}
    </div>
  );
};
