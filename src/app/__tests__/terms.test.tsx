import React from 'react';
import { render, screen } from '@testing-library/react';
import TermsPage from '../terms/page';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { date?: string }) => {
    const translations: Record<string, string> = {
      'legal.terms.title': 'Terms of Service',
      'legal.terms.lastUpdated': 'Last updated: {date}',
      'legal.terms.acceptance.title': 'Acceptance of Terms',
      'legal.terms.acceptance.content': 'By accessing and using Personal Hub, you accept and agree to be bound by the terms and provision of this agreement.',
      'legal.terms.description.title': 'Service Description',
      'legal.terms.description.content': 'Personal Hub is a personal productivity application that helps you manage tasks, calendar events, and notes.',
      'legal.terms.userResponsibilities.title': 'User Responsibilities',
      'legal.terms.userResponsibilities.content': 'You are responsible for maintaining the confidentiality of your account and password.',
      'legal.terms.limitations.title': 'Limitations and Disclaimer',
      'legal.terms.limitations.content': 'This service is provided "as is" without any warranties, express or implied.',
      'legal.terms.intellectualProperty.title': 'Intellectual Property',
      'legal.terms.intellectualProperty.content': 'The source code is available under the MIT License.',
      'legal.terms.termination.title': 'Termination',
      'legal.terms.termination.content': 'You may terminate your account at any time.',
      'legal.terms.contact.title': 'Contact Information',
      'legal.terms.contact.content': 'For questions about these terms, please contact us through the project\'s GitHub repository.',
      'legal.privacy.title': 'Privacy Policy',
      'auth.login': 'Login',
    };
    
    if (key === 'legal.terms.lastUpdated' && params?.date) {
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

describe('TermsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders terms of service page', () => {
    render(<TermsPage />);
    
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('renders all terms sections', () => {
    render(<TermsPage />);
    
    expect(screen.getByText('Acceptance of Terms')).toBeInTheDocument();
    expect(screen.getByText('Service Description')).toBeInTheDocument();
    expect(screen.getByText('User Responsibilities')).toBeInTheDocument();
    expect(screen.getByText('Limitations and Disclaimer')).toBeInTheDocument();
    expect(screen.getByText('Intellectual Property')).toBeInTheDocument();
    expect(screen.getByText('Termination')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
  });

  it('renders section content', () => {
    render(<TermsPage />);
    
    expect(screen.getByText(/By accessing and using Personal Hub/)).toBeInTheDocument();
    expect(screen.getByText(/Personal Hub is a personal productivity application/)).toBeInTheDocument();
    expect(screen.getByText(/You are responsible for maintaining the confidentiality/)).toBeInTheDocument();
  });

  it('includes navigation links', () => {
    render(<TermsPage />);
    
    const backToLoginLink = screen.getByRole('link', { name: /Back to Login/i });
    expect(backToLoginLink).toBeInTheDocument();
    expect(backToLoginLink).toHaveAttribute('href', '/login');
    
    const privacyLink = screen.getByRole('link', { name: 'Privacy Policy' });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
    
    const loginLink = screen.getByRole('link', { name: 'Login' });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('includes language switcher', () => {
    render(<TermsPage />);
    
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<TermsPage />);
    
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent('Terms of Service');
    
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(7); // 7 sections
  });

  it('includes project footer information', () => {
    render(<TermsPage />);
    
    expect(screen.getByText('Personal Hub - Open Source Personal Productivity Application')).toBeInTheDocument();
  });
});