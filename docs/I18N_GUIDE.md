# Internationalization (i18n) Implementation Guide

## Overview
Personal Hub application supports Japanese and English using `next-intl`.

## Technical Specifications
- **Library**: next-intl v4.1.0
- **Supported Languages**: Japanese (ja), English (en)
- **Default Language**: Japanese
- **Language Setting Storage**: Cookie (`locale`)

## Architecture

### File Structure
```
src/
├── i18n/
│   ├── config.ts          # Language configuration
│   └── request.ts         # next-intl configuration
├── contexts/
│   └── LocaleContext.tsx  # Language switching Context
├── components/ui/
│   └── LanguageSwitcher.tsx # Language switcher component
└── messages/
    ├── ja.json           # Japanese translations
    └── en.json           # English translations
```

### Configuration Files
- `next.config.ts`: next-intl plugin configuration
- `src/app/layout.tsx`: Language provider configuration

## Usage

### Using Translations
```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('todo.noTodos')}</p>
    </div>
  );
}
```

### Language Switching
```tsx
import { useLocale } from '@/contexts/LocaleContext';

function LanguageButton() {
  const { locale, setLocale } = useLocale();
  
  const toggleLanguage = () => {
    setLocale(locale === 'ja' ? 'en' : 'ja');
  };
  
  return (
    <button onClick={toggleLanguage}>
      {locale === 'ja' ? 'English' : '日本語'}
    </button>
  );
}
```

## Translation Key Structure

### Common Keys (`common`)
```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  }
}
```

### Authentication Related (`auth`)
```json
{
  "auth": {
    "login": "Login",
    "register": "Sign Up",
    "email": "Email Address",
    "password": "Password"
  }
}
```

### TODO Related (`todo`)
```json
{
  "todo": {
    "title": "TODO",
    "addTodo": "Add TODO",
    "noTodos": "No TODOs",
    "completed": "Completed"
  }
}
```

### Calendar Related (`calendar`)
```json
{
  "calendar": {
    "title": "Calendar",
    "addEvent": "Add Event",
    "noEvents": "No Events"
  }
}
```

### Notes Related (`notes`)
```json
{
  "notes": {
    "title": "Notes",
    "addNote": "Add Note",
    "noNotes": "No Notes"
  }
}
```

### Error Messages (`errors`)
```json
{
  "errors": {
    "general": "An error occurred",
    "network": "Network error occurred",
    "validation": "Please check your input"
  }
}
```

## Adding New Translations

### 1. Update Translation Files
Add the same key to both files:
- `messages/ja.json`
- `messages/en.json`

### 2. Usage Example
```tsx
// Add new key (example: analytics feature)
{
  "analytics": {
    "title": "Analytics",
    "description": "Statistics and Reports",
    "productivity": "Productivity",
    "trends": "Trends"
  }
}

// Use in component
const t = useTranslations('analytics');
<h1>{t('title')}</h1>
```

## Best Practices

### 1. Key Naming Conventions
- Organize hierarchically by feature: `auth.login`, `todo.addTodo`
- Use specific and clear names
- Use verb + object format: `addTodo`, `deleteTodo`

### 2. Translation Quality
- Use natural expressions
- Consider UI context
- Maintain consistent tone and manner

### 3. Development Considerations
- Always define translation keys in both languages
- Be careful of typos (causes runtime errors)
- Break long texts appropriately

## Language Switching Behavior

### Cookie Storage
- Language setting stored in `locale` Cookie
- Expiration: 1 year
- Path: `/` (shared across entire app)

### Behavior on Language Change
1. Call `setLocale()`
2. Save new language to Cookie
3. Page reload (display in new language)

## Troubleshooting

### Common Issues

#### Translations Not Displaying
- Check translation keys
- Verify keys are defined in both language files
- Check for typos

#### Language Switching Not Working
- Verify `LocaleProvider` is configured correctly
- Check Cookie settings
- Verify browser has Cookies enabled

#### Build Errors
- Check JSON syntax in translation files
- Verify next-intl configuration

## Future Extensions

### Adding New Languages
1. Add to `locales` array in `src/i18n/config.ts`
2. Create new language file `messages/{locale}.json`
3. Add language option to `LanguageSwitcher.tsx`

### Advanced Features
- Pluralization support (using next-intl's ICU message format)
- Date and number localization
- RTL language support

## Related Links
- [next-intl Official Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)