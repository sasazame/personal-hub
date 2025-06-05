'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PasswordRequirement {
  regex: RegExp;
  text: string;
}

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

const requirements: PasswordRequirement[] = [
  { regex: /.{8,}/, text: 'At least 8 characters' },
  { regex: /[A-Z]/, text: 'One uppercase letter' },
  { regex: /[a-z]/, text: 'One lowercase letter' },
  { regex: /[0-9]/, text: 'One number' },
  { regex: /[^A-Za-z0-9]/, text: 'One special character' },
];

function getPasswordStrength(password: string): number {
  return requirements.filter(req => req.regex.test(password)).length;
}

function getStrengthColor(strength: number): string {
  if (strength <= 1) return 'bg-red-500';
  if (strength <= 2) return 'bg-orange-500';
  if (strength <= 3) return 'bg-yellow-500';
  if (strength <= 4) return 'bg-blue-500';
  return 'bg-green-500';
}

function getStrengthText(strength: number): string {
  if (strength <= 1) return 'Very Weak';
  if (strength <= 2) return 'Weak';
  if (strength <= 3) return 'Fair';
  if (strength <= 4) return 'Good';
  return 'Strong';
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = getPasswordStrength(password);
  const strengthColor = getStrengthColor(strength);
  const strengthText = getStrengthText(strength);

  if (!password) return null;

  return (
    <div className={cn('mt-3 space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-white/70">Password Strength</span>
          <span className={cn(
            'text-xs font-semibold',
            strength <= 1 ? 'text-red-400' :
            strength <= 2 ? 'text-orange-400' :
            strength <= 3 ? 'text-yellow-400' :
            strength <= 4 ? 'text-blue-400' : 'text-green-400'
          )}>
            {strengthText}
          </span>
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-2 flex-1 rounded-full transition-all duration-300',
                level <= strength ? strengthColor : 'bg-white/20'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-white/70">Requirements:</p>
        <div className="grid grid-cols-1 gap-1">
          {requirements.map((req, index) => {
            const isValid = req.regex.test(password);
            return (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div className={cn(
                  'flex items-center justify-center w-4 h-4 rounded-full transition-all duration-300',
                  isValid ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'
                )}>
                  {isValid ? (
                    <Check className="h-2.5 w-2.5" />
                  ) : (
                    <X className="h-2.5 w-2.5" />
                  )}
                </div>
                <span className={cn(
                  'transition-colors duration-300',
                  isValid ? 'text-green-400' : 'text-white/50'
                )}>
                  {req.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}