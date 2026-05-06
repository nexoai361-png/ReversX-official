import * as acorn from 'acorn';

export interface EditorMarker {
  severity: number; // 8 for Error, 4 for Warning, 2 for Info
  message: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  source?: string;
}

export const checkErrors = (code: string, language: string): EditorMarker[] => {
  const markers: EditorMarker[] = [];

  if (language !== 'javascript' && language !== 'typescript') return [];

  // 1. Syntax Check with Acorn
  try {
    acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
  } catch (err: any) {
    if (err.loc) {
      markers.push({
        severity: 8, // Error
        message: `Syntax Error: ${err.message.replace(/\(\d+:\d+\)$/, '')}`,
        startLineNumber: err.loc.line,
        startColumn: err.loc.column + 1,
        endLineNumber: err.loc.line,
        endColumn: err.loc.column + 5, // Approximate
        source: 'Acorn Syntax Checker'
      });
    }
  }

  // 2. Comprehensive Security Check (Pattern-based)
  const securityChecks = [
    {
      pattern: /eval\s*\(/g,
      message: 'Critical Security Risk: eval() allows execution of arbitrary code and is highly dangerous.',
      severity: 8,
      source: 'Security Scanner'
    },
    {
      pattern: /innerHTML\s*=/g,
      message: 'Security Alert: innerHTML can lead to Cross-Site Scripting (XSS). Prefer textContent or DOM APIs.',
      severity: 4,
      source: 'Security Scanner'
    },
    {
      pattern: /(?:apiKey|secret|password|token|private_key|auth_token)\s*[:=]\s*['"`][^'"`]{8,}['"`]/gi,
      message: 'Critical: Potential hardcoded secret or API key detected. Move this to environment variables.',
      severity: 8,
      source: 'Secret Detector'
    },
    {
      pattern: /document\.write\s*\(/g,
      message: 'High: document.write() is an legacy API with security and performance implications.',
      severity: 8,
      source: 'Security Scanner'
    },
    {
      pattern: /http:\/\//g,
      message: 'Moderate: Insecure HTTP connection detected. Use HTTPS for encrypted communication.',
      severity: 4,
      source: 'Security Scanner'
    },
    {
      pattern: /dangerouslySetInnerHTML/g,
      message: 'React Security: Using dangerouslySetInnerHTML bypasses XSS protection.',
      severity: 4,
      source: 'React Linter'
    },
    {
      pattern: /new\s+Function\s*\(/g,
      message: 'Security Alert: "new Function()" is similar to eval() and can execute arbitrary code.',
      severity: 8,
      source: 'Security Scanner'
    },
    {
      pattern: /setTimeout\s*\(\s*['"`]/g,
      message: 'Security Tip: Avoid passing strings to setTimeout() as it uses eval-like behavior.',
      severity: 4,
      source: 'Quality Linter'
    }
  ];

  const lines = code.split('\n');
  securityChecks.forEach(check => {
    lines.forEach((line, index) => {
      let match;
      while ((match = check.pattern.exec(line)) !== null) {
        markers.push({
          severity: check.severity,
          message: check.message,
          startLineNumber: index + 1,
          startColumn: match.index + 1,
          endLineNumber: index + 1,
          endColumn: match.index + match[0].length + 1,
          source: check.source
        });
      }
    });
  });

  // 3. Best Practices / Code Quality / Bug Prevention
  const qualityChecks = [
    {
      pattern: /\bvar\b/g,
      message: 'Code Quality: Use "const" by default and "let" only if re-assignment is needed. Avoid "var".',
      severity: 4,
      source: 'Clean Code Linter'
    },
    {
      pattern: /console\.log\s*\(/g,
      message: 'Quality: Suggest removing console.log() when finishing development.',
      severity: 2,
      source: 'Quality Linter'
    },
    {
      pattern: /==\s*(?!=\s*)/g,
      message: 'Bug Prevention: Use strict equality (===) to avoid unexpected type coercion.',
      severity: 4,
      source: 'Logic Linter'
    },
    {
      pattern: /\bdebugger\b/g,
      message: 'Reminder: Remove "debugger" statements before pushing to production.',
      severity: 4,
      source: 'Quality Linter'
    },
    {
      pattern: /catch\s*\(\s*\w+\s*\)\s*\{\s*\}/g,
      message: 'Bug Risk: Empty catch block detected. It is better to at least log the error.',
      severity: 4,
      source: 'Logic Linter'
    },
    {
      pattern: /while\s*\(\s*true\s*\)/g,
      message: 'Performance Risk: Potential infinite loop detected.',
      severity: 4,
      source: 'Performance Linter'
    },
    {
      pattern: /Math\.random\s*\(/g,
      message: 'Security Note: Math.random() is not cryptographically secure for sensitive IDs.',
      severity: 2,
      source: 'Security Note'
    }
  ];

  qualityChecks.forEach(check => {
    lines.forEach((line, index) => {
      let match;
      while ((match = check.pattern.exec(line)) !== null) {
        markers.push({
          severity: check.severity,
          message: check.message,
          startLineNumber: index + 1,
          startColumn: match.index + 1,
          endLineNumber: index + 1,
          endColumn: match.index + match[0].length + 1,
          source: check.source
        });
      }
    });
  });

  return markers;
};
