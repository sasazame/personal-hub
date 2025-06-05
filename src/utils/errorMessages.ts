// Friendly error messages for different error scenarios
export const errorMessages = {
  // Auth errors
  INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが間違っています',
  USER_ALREADY_EXISTS: 'このメールアドレスは既に登録されています',
  EMAIL_NOT_FOUND: 'このメールアドレスは登録されていません',
  INVALID_EMAIL: 'メールアドレスの形式が正しくありません',
  WEAK_PASSWORD: 'パスワードが弱すぎます。より強力なパスワードを設定してください',
  TOKEN_EXPIRED: 'セッションの有効期限が切れました。再度ログインしてください',
  UNAUTHORIZED: 'アクセス権限がありません。ログインしてください',
  
  // Network errors
  NETWORK_ERROR: 'ネットワークエラーが発生しました。しばらく待ってから再試行してください',
  SERVER_ERROR: 'サーバーエラーが発生しました。管理者にお問い合わせください',
  TIMEOUT_ERROR: 'リクエストがタイムアウトしました。再試行してください',
  
  // TODO errors
  TODO_NOT_FOUND: 'TODOが見つかりません',
  TODO_CREATE_FAILED: 'TODOの作成に失敗しました',
  TODO_UPDATE_FAILED: 'TODOの更新に失敗しました',
  TODO_DELETE_FAILED: 'TODOの削除に失敗しました',
  
  // Validation errors
  REQUIRED_FIELD: 'この項目は必須です',
  INVALID_FORMAT: '入力形式が正しくありません',
  
  // Default
  UNKNOWN_ERROR: '予期しないエラーが発生しました',
} as const;

// Function to get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check if the error message matches any of our predefined errors
    const errorKey = Object.keys(errorMessages).find(key =>
      error.message.includes(key) || error.message.includes(key.toLowerCase())
    ) as keyof typeof errorMessages;
    
    if (errorKey) {
      return errorMessages[errorKey];
    }
    
    // Check for common HTTP status codes
    if (error.message.includes('401')) {
      return errorMessages.UNAUTHORIZED;
    }
    if (error.message.includes('404')) {
      return errorMessages.TODO_NOT_FOUND;
    }
    if (error.message.includes('500')) {
      return errorMessages.SERVER_ERROR;
    }
    if (error.message.includes('timeout')) {
      return errorMessages.TIMEOUT_ERROR;
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return errorMessages.NETWORK_ERROR;
    }
    
    // Return the original message if it's already user-friendly
    return error.message;
  }
  
  return errorMessages.UNKNOWN_ERROR;
}