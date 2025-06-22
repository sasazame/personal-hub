import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivacyPage from '../privacy/page';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { date?: string }) => {
    const translations: Record<string, string> = {
      'legal.privacy.title': 'Privacy Policy',
      'legal.privacy.lastUpdated': 'Last updated: {date}',
      'legal.privacy.introduction.title': 'Introduction',
      'legal.privacy.introduction.content': 'This Privacy Policy describes how Personal Hub collects, uses, and protects your information.',
      'legal.privacy.dataCollection.title': 'Information We Collect',
      'legal.privacy.dataCollection.content': 'We collect information you provide directly to us, such as when you create an account.',
      'legal.privacy.dataUsage.title': 'How We Use Your Information',
      'legal.privacy.dataUsage.content': 'We use your information to provide, maintain, and improve our services.',
      'legal.privacy.dataStorage.title': 'Data Storage and Security',
      'legal.privacy.dataStorage.content': 'Your data is stored securely and is only accessible to you.',
      'legal.privacy.dataDeletion.title': 'Data Deletion',
      'legal.privacy.dataDeletion.content': 'You can delete your account and all associated data at any time.',
      'legal.privacy.thirdParty.title': 'Third-Party Services',
      'legal.privacy.thirdParty.content': 'We do not sell, trade, or otherwise transfer your personal information to third parties.',
      'legal.privacy.userRights.title': 'Your Rights',
      'legal.privacy.userRights.content': 'You have the right to access, update, or delete your personal information.',
      'legal.privacy.changes.title': 'Changes to This Policy',
      'legal.privacy.changes.content': 'We may update this privacy policy from time to time.',
      'legal.privacy.contact.title': 'Contact Us',
      'legal.privacy.contact.content': 'If you have any questions about this Privacy Policy, please contact us.',
      'legal.terms.title': 'Terms of Service',
      'auth.login': 'Login',
    };
    
    if (key === 'legal.privacy.lastUpdated' && params?.date) {
      return `Last updated: ${params.date}`;
    }
    
    return translations[key] || key;
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock LanguageSwitcher
jest.mock('@/components/ui/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>,
}));

describe('PrivacyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders privacy policy page', () => {
    render(<PrivacyPage />);
    
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('renders all privacy sections', () => {
    render(<PrivacyPage />);
    
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Information We Collect')).toBeInTheDocument();
    expect(screen.getByText('How We Use Your Information')).toBeInTheDocument();
    expect(screen.getByText('Data Storage and Security')).toBeInTheDocument();
    expect(screen.getByText('Data Deletion')).toBeInTheDocument();
    expect(screen.getByText('Third-Party Services')).toBeInTheDocument();
    expect(screen.getByText('Your Rights')).toBeInTheDocument();
    expect(screen.getByText('Changes to This Policy')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('renders section content', () => {
    render(<PrivacyPage />);
    
    expect(screen.getByText(/This Privacy Policy describes how Personal Hub/)).toBeInTheDocument();
    expect(screen.getByText(/We collect information you provide directly to us/)).toBeInTheDocument();
    expect(screen.getByText(/We use your information to provide, maintain/)).toBeInTheDocument();
  });

  it('includes GDPR compliance notice', () => {
    render(<PrivacyPage />);
    
    expect(screen.getByText('GDPR Compliance')).toBeInTheDocument();
    expect(screen.getByText(/This privacy policy is designed to comply with the General Data Protection Regulation/)).toBeInTheDocument();
  });

  it('includes navigation links', () => {
    render(<PrivacyPage />);
    
    const backToLoginLink = screen.getByRole('link', { name: /Back to Login/i });
    expect(backToLoginLink).toBeInTheDocument();
    expect(backToLoginLink).toHaveAttribute('href', '/login');
    
    const termsLink = screen.getByRole('link', { name: 'Terms of Service' });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
    
    const loginLink = screen.getByRole('link', { name: 'Login' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('includes language switcher', () => {
    render(<PrivacyPage />);
    
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<PrivacyPage />);
    
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Privacy Policy');
    
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(9); // 9 sections
    
    const gdprHeading = screen.getByRole('heading', { level: 3 });
    expect(gdprHeading).toHaveTextContent('GDPR Compliance');
  });

  it('includes project footer information', () => {
    render(<PrivacyPage />);
    
    expect(screen.getByText('Personal Hub - Open Source Personal Productivity Application')).toBeInTheDocument();
  });

  it('displays shield icon in header', () => {
    render(<PrivacyPage />);
    
    // The shield icon should be rendered in the header
    const header = screen.getByText('Privacy Policy').closest('div');
    expect(header).toBeInTheDocument();
  });
});