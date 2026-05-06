/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  MessageSquare, 
  Code, 
  Settings, 
  Files, 
  Play, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MoveDown,
  MoveUp,
  ArrowLeftToLine,
  ArrowRightToLine,
  Menu,
  Send, 
  User, 
  Terminal,
  Search,
  Smartphone,
  Laptop,
  Monitor,
  MonitorSmartphone,
  Plus,
  Blocks,
  Zap,
  Sun,
  UploadCloud,
  Languages,
  BookOpen,
  Copy,
  Check,
  Trash2,
  Github,
  Share2,
  Edit3,
  Undo2,
  Redo2,
  ClipboardPaste,
  Save,
  RefreshCw,
  Maximize2,
  FolderOpen,
  FilePlus,
  FolderPlus,
  ArrowUp,
  Wand2,
  Sparkles,
  Hash,
  Bug,
  FileText,
  Loader2,
  Users,
  Paperclip,
  HelpCircle,
  Image as ImageIcon,
  FileCode,
  FileJson,
  File,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  MoreVertical,
  Cog,
  MessageCircle,
  Folder,
  PlayCircle,
  SearchCode,
  Users2,
  User2,
  SquareTerminal,
  PlusSquare,
  Trash,
  Edit,
  CheckCircle,
  SaveAll,
  RefreshCcw,
  Maximize,
  FolderClosed,
  ArrowUpCircle,
  Wand,
  Sparkle,
  BugPlay,
  FileCode2,
  FileJson2,
  MoreHorizontal,
  Code2,
  CheckCircle2,
  SearchCode as SearchCodeIcon,
  Terminal as TerminalIcon,
  Plus as PlusIcon,
  Play as PlayIcon,
  Code as CodeIcon,
  Trash as TrashIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  RefreshCcw as RefreshCcwIcon,
  Maximize as MaximizeIcon,
  FolderClosed as FolderClosedIcon,
  ArrowUpCircle as ArrowUpCircleIcon,
  Wand as WandIcon,
  Sparkle as SparkleIcon,
  BugPlay as BugPlayIcon,
  FileCode2 as FileCode2Icon,
  FileJson2 as FileJson2Icon,
  MoreHorizontal as MoreHorizontalIcon,
  Key
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark as cmOneDark } from '@codemirror/theme-one-dark';
import { githubLight } from '@uiw/codemirror-theme-github';
import { 
  dracula as cmDracula, 
  monokai as cmMonokai, 
  nord as cmNord, 
  tokyoNight as cmTokyoNight, 
  sublime as cmSublime, 
  vscodeDark as cmVscodeDark,
  material as cmMaterial,
  abyss as cmAbyss,
  aura as cmAura,
  bespin as cmBespin,
  tokyoNightDay as cmTokyoNightDay,
  gruvboxDark as cmGruvboxDark,
  solarizedDark as cmSolarizedDark,
  tokyoNightStorm as cmTokyoNightStorm,
  xcodeDark as cmXcodeDark
} from '@uiw/codemirror-themes-all';
import { IconContext, useIcons, ICON_THEMES, Codicon } from './lib/icons';
import { EditorView, keymap, drawSelection, dropCursor, highlightActiveLine, highlightSpecialChars, rectangularSelection, crosshairCursor, highlightActiveLineGutter } from '@codemirror/view';
import { cursorLineUp, cursorLineDown, cursorCharLeft, cursorCharRight, undo, redo, selectAll, moveLineUp, moveLineDown, copyLineDown, insertNewlineAndIndent } from '@codemirror/commands';
import { EditorState, Prec } from '@codemirror/state';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';
import { HighlightStyle, syntaxHighlighting, indentUnit, foldGutter, foldKeymap, bracketMatching, indentOnInput } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { autocompletion, completionKeymap, closeCompletion, CompletionContext, CompletionResult, startCompletion } from '@codemirror/autocomplete';
import { search, searchKeymap, openSearchPanel, selectNextOccurrence, selectSelectionMatches, gotoLine } from '@codemirror/search';
import { GoogleGenerativeAI } from "@google/generative-ai";

import 'katex/dist/katex.min.css';
import { transform } from 'sucrase';

// Lazy loaded components for better performance
const MarkdownRenderer = React.lazy(() => import('./components/MarkdownRenderer'));
const SyntaxHighlighter = React.lazy(() => import('./components/AsyncSyntaxHighlighter'));
const CodeMirror = React.lazy(() => import('@uiw/react-codemirror'));

// Components
import { FriendsTab } from './components/FriendsTab';
import { 
  vscDarkPlus,
  atomDark,
  cb,
  darcula,
  duotoneDark,
  duotoneEarth,
  duotoneForest,
  duotoneLight,
  duotoneSea,
  duotoneSpace,
  ghcolors,
  hopscotch,
  materialDark,
  materialLight,
  materialOceanic,
  nord,
  oneDark,
  oneLight,
  pojoaque,
  prism,
  shadesOfPurple,
  solarizedlight,
  tomorrow,
  twilight,
  xonokai,
  coldarkCold,
  coldarkDark,
  dracula,
  gruvboxDark,
  gruvboxLight,
  lucario,
  nightOwl,
  synthwave84
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { chatWithAI, chatWithAIStream } from './services/ai';
import { checkErrors, EditorMarker } from './services/errorChecker';
import * as db from './services/db';

interface Attachment {
  name: string;
  type: string;
  content: string;
}

interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
  reasoning?: string;
  attachments?: Attachment[];
}

interface Project {
  id: string;
  name: string;
  messages: Message[];
  files: Record<string, { code: string, language: string }>;
  openFiles?: string[];
  activeFile: string;
  createdAt: number;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getLanguageFromPath = (name: string) => {
  const extension = name.split('.').pop()?.toLowerCase() || 'text';
  const extMap: Record<string, string> = {
    'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
    'html': 'html', 'css': 'css', 'json': 'json', 'md': 'markdown', 'py': 'python',
    'cpp': 'cpp', 'c': 'c', 'java': 'java', 'php': 'php', 'sql': 'sql', 'sh': 'bash',
    'rs': 'rust', 'go': 'go'
  };
  return extMap[extension] || 'text';
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getInitialCode = (name: string) => {
  const greeting = getGreeting();
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${greeting}, ${name}</title>
    <style>
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #000;
            color: #fff;
            font-family: -apple-system, system-ui, sans-serif;
        }

        h1 {
            font-size: 1.5rem;
            font-weight: 300;
            letter-spacing: 0.02em;
        }

        span {
            font-weight: 500;
        }
    </style>
</head>
<body>

    <h1>${greeting}, <span>${name}</span>.</h1>

</body>
</html>`;
};

// Custom Professional Theme matching the user's image
const professionalTheme = EditorView.theme({
  "&": {
    color: "#e0e0e0",
    backgroundColor: "#0d0d0d",
    fontFamily: 'var(--font-mono), monospace',
    fontSize: "13px"
  },
  ".cm-content": {
    caretColor: "#ffffff",
    fontFamily: 'var(--font-mono), monospace'
  },
  "&.cm-focused .cm-cursor": {
    borderLeftColor: "#ffffff"
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  },
  ".cm-gutters": {
    backgroundColor: "#0d0d0d",
    color: "#3e3e3e",
    border: "none",
    fontFamily: 'var(--font-mono), monospace'
  },
  ".cm-activeLineGutter": {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    color: "#e0e0e0"
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(255, 255, 255, 0.02)"
  }
}, { dark: true });

const professionalHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#82aaff" },
  { tag: t.operator, color: "#89ddff" },
  { tag: t.deleted, color: "#f07178" },
  { tag: t.className, color: "#ffcb6b" },
  { tag: t.typeName, color: "#ffcb6b" },
  { tag: t.namespace, color: "#ffcb6b" },
  { tag: t.macroName, color: "#ffcb6b" },
  { tag: t.variableName, color: "#eeffff" },
  { tag: t.definition(t.variableName), color: "#ffcb6b" },
  { tag: t.function(t.variableName), color: "#82aaff" },
  { tag: t.labelName, color: "#eeffff" },
  { tag: t.propertyName, color: "#c792ea" },
  { tag: t.attributeName, color: "#c792ea" },
  { tag: t.tagName, color: "#f07178" },
  { tag: t.comment, color: "#546e7a", fontStyle: "italic" },
  { tag: t.string, color: "#c3e88d" },
  { tag: t.number, color: "#f78c6c" },
  { tag: t.bool, color: "#f78c6c" },
  { tag: t.regexp, color: "#c3e88d" },
  { tag: t.escape, color: "#f78c6c" },
  { tag: t.color, color: "#f78c6c" },
  { tag: t.unit, color: "#f78c6c" },
  { tag: t.null, color: "#f78c6c" },
  { tag: t.heading, fontWeight: "bold", color: "#f07178" },
  { tag: t.invalid, color: "#f07178" },
]);

const professionalThemeExtension = [professionalTheme, syntaxHighlighting(professionalHighlightStyle)];

const CM_THEMES: Record<string, any> = {
  'Pure Black': {
    ext: [EditorView.theme({
      "&": { backgroundColor: "#000000", color: "#e0e0e0" },
      ".cm-gutters": { backgroundColor: "#000000", color: "#3e3e3e", border: "none" }
    }, { dark: true }), syntaxHighlighting(professionalHighlightStyle)],
    colors: ['#000000', '#82aaff', '#c3e88d', '#f07178']
  },
  'Deep Night': {
    ext: [EditorView.theme({
      "&": { backgroundColor: "#0d0d0d", color: "#e0e0e0" },
      ".cm-gutters": { backgroundColor: "#0d0d0d", color: "#3e3e3e", border: "none" }
    }, { dark: true }), syntaxHighlighting(professionalHighlightStyle)],
    colors: ['#0d0d0d', '#82aaff', '#c3e88d', '#f07178']
  },
  'Midnight': {
    ext: [EditorView.theme({
      "&": { backgroundColor: "#0a0e14", color: "#b3b1ad" },
      ".cm-gutters": { backgroundColor: "#0a0e14", color: "#b3b1ad", border: "none" }
    }, { dark: true }), syntaxHighlighting(professionalHighlightStyle)],
    colors: ['#0a0e14', '#59c2ff', '#9ece6a', '#f7768e']
  },
  'One Dark': { ext: cmOneDark, colors: ['#282c34', '#61afef', '#98c379', '#e06c75'] },
  'Dracula': { ext: cmDracula, colors: ['#282a36', '#bd93f9', '#50fa7b', '#ff79c6'] },
  'Monokai': { ext: cmMonokai, colors: ['#272822', '#66d9ef', '#a6e22e', '#f92672'] },
  'Nord': { ext: cmNord, colors: ['#2e3440', '#88c0d0', '#a3be8c', '#bf616a'] },
  'Tokyo Night': { ext: cmTokyoNight, colors: ['#1a1b26', '#7aa2f7', '#9ece6a', '#f7768e'] },
  'Tokyo Storm': { ext: cmTokyoNightStorm, colors: ['#24283b', '#7aa2f7', '#9ece6a', '#bb9af7'] },
  'Sublime': { ext: cmSublime, colors: ['#303841', '#66d9ef', '#a6e22e', '#f92672'] },
  'VS Code Dark': { ext: cmVscodeDark, colors: ['#1e1e1e', '#9cdcfe', '#ce9178', '#569cd6'] },
  'Material': { ext: cmMaterial, colors: ['#263238', '#80cbff', '#c3e88d', '#ff5370'] },
  'GitHub Light': { ext: githubLight, colors: ['#ffffff', '#005cc5', '#22863a', '#d73a49'] },
  'Abyss': { ext: cmAbyss, colors: ['#000c18', '#6699cc', '#a8ffef', '#ff9966'] },
  'Aura': { ext: cmAura, colors: ['#15141b', '#a277ff', '#61ffca', '#ff6767'] },
  'Bespin': { ext: cmBespin, colors: ['#28211c', '#5ea6ea', '#54cd64', '#cf6a4c'] },
  'Tokyo Night Day': { ext: cmTokyoNightDay, colors: ['#e1e2e7', '#34548a', '#587539', '#f7768e'] },
  'Gruvbox Dark': { ext: cmGruvboxDark, colors: ['#282828', '#83a598', '#b8bb26', '#fb4934'] },
  'Solarized Dark': { ext: cmSolarizedDark, colors: ['#002b36', '#268bd2', '#859900', '#dc322f'] },
  'Xcode Dark': { ext: cmXcodeDark, colors: ['#1f1f24', '#ff7ab2', '#4eb0cc', '#ffa14f'] }
};

const THEMES: Record<string, any> = {
  'Pure Black': vscDarkPlus,
  'Deep Night': vscDarkPlus,
  'Midnight': vscDarkPlus,
  'VS Code Dark+': vscDarkPlus,
  'Atom Dark': atomDark,
  'CB': cb,
  'Darcula': darcula,
  'Duotone Dark': duotoneDark,
  'Duotone Earth': duotoneEarth,
  'Duotone Forest': duotoneForest,
  'Duotone Light': duotoneLight,
  'Duotone Sea': duotoneSea,
  'Duotone Space': duotoneSpace,
  'GitHub Colors': ghcolors,
  'Hopscotch': hopscotch,
  'Material Dark': materialDark,
  'Material Light': materialLight,
  'Material Oceanic': materialOceanic,
  'Nord': nord,
  'One Dark': oneDark,
  'One Light': oneLight,
  'Pojoaque': pojoaque,
  'Prism': prism,
  'Shades of Purple': shadesOfPurple,
  'Solarized Light': solarizedlight,
  'Tomorrow': tomorrow,
  'Twilight': twilight,
  'Xonokai': xonokai,
  'Coldark Cold': coldarkCold,
  'Coldark Dark': coldarkDark,
  'Dracula': dracula,
  'Gruvbox Dark': gruvboxDark,
  'Gruvbox Light': gruvboxLight,
  'Lucario': lucario,
  'Night Owl': nightOwl,
  'Synthwave 84': synthwave84
};

const APP_THEMES: Record<string, any> = {
  'VS Code Dark': {
    background: '#1e1e1e',
    foreground: '#e0e0e0',
    muted: 'rgba(224, 224, 224, 0.6)',
    subtle: 'rgba(224, 224, 224, 0.4)',
    accent: '#ffffff',
    accentForeground: '#000000',
    sidebar: '#252526',
    border: '#333333'
  },
  'Acode Dark': {
    background: '#0d0d0d',
    foreground: '#e0e0e0',
    muted: 'rgba(224, 224, 224, 0.6)',
    subtle: 'rgba(224, 224, 224, 0.4)',
    accent: '#00ff41',
    accentForeground: '#000000',
    sidebar: '#1a1a1a',
    border: '#333333'
  },
  'Default Dark': {
    background: '#0d0d0d',
    foreground: '#e0e0e0',
    muted: 'rgba(224, 224, 224, 0.6)',
    subtle: 'rgba(224, 224, 224, 0.4)',
    accent: '#00ff41',
    accentForeground: '#000000',
    sidebar: '#1a1a1a',
    border: '#333333'
  },
  'Midnight Blue': {
    background: '#0a0e14',
    foreground: '#b3b1ad',
    muted: 'rgba(179, 177, 173, 0.6)',
    subtle: 'rgba(179, 177, 173, 0.4)',
    accent: '#59c2ff',
    accentForeground: '#000000',
    sidebar: '#0d1017',
    border: '#151b23'
  },
  'Cyberpunk': {
    background: '#000000',
    foreground: '#00ff9f',
    muted: 'rgba(0, 255, 159, 0.6)',
    subtle: 'rgba(0, 255, 159, 0.4)',
    accent: '#ff0055',
    accentForeground: '#ffffff',
    sidebar: '#111111',
    border: '#333333'
  },
  'Nordic': {
    background: '#2e3440',
    foreground: '#d8dee9',
    muted: 'rgba(216, 222, 233, 0.6)',
    subtle: 'rgba(216, 222, 233, 0.4)',
    accent: '#88c0d0',
    accentForeground: '#000000',
    sidebar: '#242933',
    border: '#3b4252'
  },
  'Dracula': {
    background: '#282a36',
    foreground: '#f8f8f2',
    muted: 'rgba(248, 248, 242, 0.6)',
    subtle: 'rgba(248, 248, 242, 0.4)',
    accent: '#bd93f9',
    accentForeground: '#ffffff',
    sidebar: '#21222c',
    border: '#44475a'
  },
  'Forest': {
    background: '#0b120b',
    foreground: '#d1d1d1',
    muted: 'rgba(209, 209, 209, 0.6)',
    subtle: 'rgba(209, 209, 209, 0.4)',
    accent: '#4ade80',
    accentForeground: '#000000',
    sidebar: '#121a12',
    border: '#1e291e'
  },
  'White Mode': {
    background: '#f5f5f5',
    foreground: '#000000',
    muted: 'rgba(0, 0, 0, 0.6)',
    subtle: 'rgba(0, 0, 0, 0.4)',
    accent: '#000000',
    accentForeground: '#ffffff',
    sidebar: '#ececec',
    border: '#d1d1d1'
  }
};

const CollapsibleCodeBlock = React.memo(({ 
  language, 
  children, 
  theme, 
  themeName, 
  themeBg,
  activePlatform,
  byokConfig
}: { 
  language: string, 
  children: string, 
  theme: any, 
  themeName: string, 
  themeBg: string,
  activePlatform?: string,
  byokConfig?: { platform: string, apiKey: string, model: string, extra?: { baseURL?: string } }
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { Code, ChevronDown } = useIcons();

  return (
    <div className="my-4 border border-border rounded-none overflow-hidden bg-foreground/[0.01]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-foreground/[0.03] transition-all text-[12px] tracking-widest text-foreground/20 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-none bg-foreground/5 text-foreground/75 group-hover:text-accent transition-colors">
            <Code size={12} />
          </div>
          <span className="tracking-tighter capitalize">{language || 'code'}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={14} />
          </div>
        </div>
      </button>
      
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5"
          >
            <React.Suspense fallback={<div className="p-4 flex items-center justify-center"><div className="w-4 h-4 border-2 border-foreground/20 border-t-accent rounded-full animate-spin"></div></div>}>
              <SyntaxHighlighter
                key={themeName}
                style={theme}
                language={language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  padding: '1.5em',
                  fontSize: '13px',
                  fontFamily: '"JetBrains Mono", monospace',
                  background: themeBg,
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}
              >
                {children}
              </SyntaxHighlighter>
            </React.Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const ByokDropdown = ({ activePlatform, setActivePlatform }: { activePlatform: string, setActivePlatform: (p: any) => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { Settings, Check } = useIcons();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{
          backgroundColor: isOpen ? '#2a2d2e' : 'transparent',
          color: isOpen ? '#ffffff' : '#858585',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '5px',
          transition: 'color 0.2s, background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.backgroundColor = '#2a2d2e';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.color = '#858585';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Settings size={18} />
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          backgroundColor: '#252526',
          minWidth: '220px',
          boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.5)',
          border: '1px solid #454545',
          borderRadius: '4px',
          zIndex: 50,
          padding: '5px 0'
        }}>
          {[
            { id: 'gemini', label: 'Gemini (Default)' },
            { id: 'openai', label: 'OpenAI' }, 
            { id: 'anthropic', label: 'Anthropic' },
            { id: 'deepseek', label: 'Deepseek' },
            { id: 'mistral', label: 'Mistral' },
            { id: 'groq', label: 'Groq' },
            { id: 'siliconflow', label: 'SiliconFlow' },
            { id: 'perplexity', label: 'Perplexity' },
            { id: 'together', label: 'Together AI' },
            { id: 'custom', label: 'Custom OpenAI' }
          ].map(platform => (
            <div 
              key={platform.id}
              onClick={() => {
                setActivePlatform(platform.id);
                setIsOpen(false);
              }}
              style={{
                color: '#cccccc',
                padding: '6px 32px 6px 28px',
                textDecoration: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                cursor: 'default',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#094771';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#cccccc';
              }}
            >
              {activePlatform === platform.id && (
                <div style={{ position: 'absolute', left: '8px' }}>
                  <Check size={14} />
                </div>
              )}
              <span>{platform.label}</span>
              <span style={{ fontSize: '11px', opacity: 0.5, marginLeft: '20px' }}>
                Provider
              </span>
            </div>
          ))}
          <div style={{ height: '1px', backgroundColor: '#454545', margin: '4px 0' }}></div>
          <div 
            onClick={() => setIsOpen(false)}
            style={{
              color: '#cccccc',
              padding: '6px 16px',
              textDecoration: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#094771';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#cccccc';
            }}
          >
            <span>Manage Keys</span> <span style={{ fontSize: '11px', opacity: 0.5, marginLeft: '20px' }}>Ctrl+K</span>
          </div>
        </div>
      )}
    </div>
  );
};

const TechnicalTraceBlock = React.memo(({ reasoning }: { reasoning: string }) => {
  const [expandedIndices, setExpandedIndices] = React.useState<Set<number>>(new Set([0]));
  
  const steps = React.useMemo(() => {
    if (!reasoning) return [];
    
    // Attempt to parse reasoning into logical steps
    const parts = reasoning.split(/\n\s*\n/).filter(p => p.trim().length > 10);
    
    if (parts.length <= 1) {
      // Fallback: split by numbered list or bullets if available
      const listParts = reasoning.split(/\n\s*(\d+\.|-|\*)\s+/).filter(p => p.trim().length > 5 && !/^\d+\.|\*|-$/.test(p));
      if (listParts.length > 1) return listParts.map((t, i) => ({
        title: t.split(/[.!?\n]/)[0].trim().slice(0, 50),
        analysis: t.trim(),
        isComplete: true,
        type: i === 0 ? 'input' : (i === listParts.length - 1 ? 'output' : 'transform')
      }));
    }

    return parts.map((p, i) => {
      const lines = p.trim().split('\n');
      return {
        title: lines[0].replace(/^[#\s*>-]+/, '').trim().slice(0, 50) || `Node Processing Step ${i + 1}`,
        analysis: p.trim(),
        isComplete: true,
        type: i === 0 ? 'entry' : (i === parts.length - 1 ? 'exit' : 'agent')
      };
    });
  }, [reasoning]);

  if (steps.length === 0) {
    return <CollapsibleReasoningBlock reasoning={reasoning} />;
  }

  const { Sparkles, Terminal, Cpu, Zap, Activity, Box } = useIcons();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[500px] select-none my-10 ml-2"
    >
      <div className="flex items-center gap-3 text-[11px] text-zinc-400 mb-4 font-sans px-3 group">
        <div className="relative">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse" />
          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping opacity-20" />
        </div>
        <span className="tracking-[0.15em] font-semibold uppercase opacity-90 group-hover:opacity-100 transition-opacity">LangGraph Execution Trace</span>
        <Activity size={12} className="text-blue-400/50" />
      </div>

      <div className="bg-[#0a0a0a]/90 border border-white/[0.06] rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl ring-1 ring-white/5">
        <div className="px-5 py-3 bg-[#111111] border-b border-white/[0.04] flex justify-between items-center">
           <div className="flex gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/20 border border-[#ff5f56]/30 shadow-[0_0_8px_rgba(255,95,86,0.1)]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/20 border border-[#ffbd2e]/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/20 border border-[#27c93f]/30" />
           </div>
           <div className="flex items-center gap-2.5 opacity-60 group">
             <Cpu size={12} className="text-blue-400 group-hover:rotate-90 transition-transform duration-500" />
             <span className="text-[9px] text-zinc-300 tracking-[0.25em] font-bold uppercase">Dynamic Node Chain</span>
           </div>
        </div>

        <div className="p-6 flex flex-col gap-8 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer" />
          </div>

          <div className="absolute left-[34px] top-12 bottom-16 w-[2px] bg-gradient-to-b from-blue-500/40 via-zinc-800 to-transparent" />

          {steps.map((step, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
              className="flex flex-col relative"
            >
              <div 
                className={`flex items-start gap-4 p-3 rounded-xl transition-all duration-300 group/step cursor-pointer ${
                  expandedIndices.has(i) ? 'bg-white/[0.03] shadow-inner' : 'hover:bg-white/[0.015]'
                }`}
                onClick={() => {
                  setExpandedIndices(prev => {
                    const next = new Set(prev);
                    if (next.has(i)) next.delete(i); else next.add(i);
                    return next;
                  });
                }}
              >
                <div className="relative mt-1.5 z-10 shrink-0">
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-500 transform group-hover/step:scale-110 ${
                    step.isComplete 
                      ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                      : 'bg-zinc-900 border-zinc-700 animate-pulse'
                  }`}>
                    {i === 0 ? <Activity size={10} className="text-blue-400" /> : 
                     i === steps.length - 1 ? <Zap size={10} className="text-yellow-400" /> :
                     <Box size={10} className="text-zinc-400" />}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-6 bg-blue-500/10" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[13px] font-bold tracking-tight transition-colors ${
                      expandedIndices.has(i) ? 'text-blue-400' : 'text-zinc-200 group-hover/step:text-blue-300'
                    }`}>
                      {step.title}
                    </span>
                    <span className="text-[8px] text-zinc-600 font-mono tracking-widest uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">
                      NODE_{i.toString().padStart(2, '0')}
                    </span>
                  </div>
                  
                  <motion.div 
                    initial={false}
                    animate={{ height: expandedIndices.has(i) ? 'auto' : '1.5em', opacity: expandedIndices.has(i) ? 1 : 0.6 }}
                    className="overflow-hidden"
                  >
                    <p className={`text-[11px] text-zinc-400 leading-relaxed font-sans ${expandedIndices.has(i) ? '' : 'truncate'}`}>
                      {step.analysis}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="px-5 py-2.5 bg-white/[0.01] border-t border-white/[0.03] flex justify-between items-center text-[9px] text-zinc-600 font-mono italic">
           <span>latency: ~{Math.floor(Math.random() * 200 + 50)}ms</span>
           <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
             <span>READY</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
});


const CollapsibleReasoningBlock = React.memo(({ reasoning }: { reasoning: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { Terminal, ChevronDown } = useIcons();

  if (!reasoning) return null;

  return (
    <div className="my-3 border border-border rounded-none overflow-hidden bg-foreground/[0.02]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-foreground/[0.05] transition-all text-[12px] tracking-wide text-foreground/70 group"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="p-1 rounded-none bg-foreground/5 text-foreground/70 group-hover:text-accent transition-colors">
              <Terminal size={12} />
            </div>
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_5px_rgba(0,122,204,0.8)]"
            />
          </div>
          <motion.span 
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="tracking-tighter"
          >
            Thinking...
          </motion.span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={12} />
          </div>
        </div>
      </button>
      
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-accent/10"
          >
            <div className="p-4 text-xs text-foreground/60 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar italic">
              {reasoning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const QuickOpenModal = ({ files, onClose, onSelect }: { files: string[], onClose: () => void, onSelect: (name: string) => void }) => {
  const [search, setSearch] = useState('');
  const filtered = files.filter(f => f.toLowerCase().includes(search.toLowerCase()));
  const { Files, Search } = useIcons();

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
        className="w-full max-w-xl bg-[#252526] border border-[#454545] shadow-2xl rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-3 py-2 border-b border-[#454545] bg-[#3c3c3c]">
          <Search size={16} className="text-zinc-400 mr-2" />
          <input 
            autoFocus
            placeholder="Search files by name..."
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && filtered.length > 0) {
                onSelect(filtered[0]);
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto py-1">
          {filtered.length > 0 ? filtered.map(f => (
            <div 
              key={f}
              onClick={() => onSelect(f)}
              className="px-4 py-1.5 flex items-center gap-3 hover:bg-[#094771] cursor-pointer group"
            >
              <Files size={14} className="text-zinc-400 group-hover:text-white" />
              <div className="flex flex-col">
                <span className="text-[12px] text-white/90">{f.split('/').pop()}</span>
                <span className="text-[10px] text-zinc-500 group-hover:text-white/60">{f}</span>
              </div>
            </div>
          )) : (
            <div className="px-4 py-4 text-center text-zinc-500 text-[12px]">No files matching "{search}"</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const CommandPaletteModal = ({ onClose, actions }: { onClose: () => void, actions: { label: string, shortcut?: string, action: () => void }[] }) => {
  const [search, setSearch] = useState('');
  const filtered = actions.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));
  const { Settings } = useIcons();

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
        className="w-full max-w-xl bg-[#252526] border border-[#454545] shadow-2xl rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-3 py-2 border-b border-[#454545] bg-[#3c3c3c]">
          <span className="text-zinc-400 mr-2 text-[13px] font-bold px-1 border border-zinc-500 rounded text-[9px] uppercase tracking-tighter">CMD</span>
          <input 
            autoFocus
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && filtered.length > 0) {
                filtered[0].action();
                onClose();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto py-1">
          {filtered.length > 0 ? filtered.map(a => (
            <div 
              key={a.label}
              onClick={() => { a.action(); onClose(); }}
              className="px-4 py-2 flex items-center justify-between hover:bg-[#094771] cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Settings size={14} className="text-zinc-400 group-hover:text-white" />
                <span className="text-[12px] text-white/90">{a.label}</span>
              </div>
              {a.shortcut && <span className="text-[10px] text-zinc-500 font-mono group-hover:text-white/60">{a.shortcut}</span>}
            </div>
          )) : (
            <div className="px-4 py-4 text-center text-zinc-500 text-[12px]">No commands matching "{search}"</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const ShortcutsModal = ({ onClose }: { onClose: () => void }) => {
  const sections = [
    {
      title: "General",
      shortcuts: [
        { key: "Ctrl + P", desc: "Quick Open (File search)" },
        { key: "Ctrl + Shift + P", desc: "Command Palette" },
        { key: "Ctrl + ,", desc: "Settings" },
        { key: "Ctrl + Shift + K", desc: "Keyboard Shortcuts List" }
      ]
    },
    {
      title: "File & Tab Control",
      shortcuts: [
        { key: "Ctrl + N", desc: "New File" },
        { key: "Ctrl + S", desc: "Save" },
        { key: "Ctrl + W", desc: "Close Tab" }
      ]
    },
    {
      title: "Editing",
      shortcuts: [
        { key: "Ctrl + Enter", desc: "New line below" },
        { key: "Ctrl + Shift + Enter", desc: "New line above" },
        { key: "Alt + ↑ / ↓", desc: "Move line up/down" },
        { key: "Shift + Alt + ↓", desc: "Duplicate line" },
        { key: "Ctrl + D", desc: "Add selection to next find match" },
        { key: "Ctrl + Shift + L", desc: "Select all occurrences" }
      ]
    },
    {
      title: "Navigation & Search",
      shortcuts: [
        { key: "Ctrl + F", desc: "Find" },
        { key: "Ctrl + H", desc: "Replace" },
        { key: "Ctrl + G", desc: "Go to Line" },
        { key: "Ctrl + Shift + F", desc: "Global Search" }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-[#1e1e1e] border border-[#333333] shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#252526]">
          <h2 className="text-[15px] font-bold text-white/90 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-6 bg-accent rounded-full" />
            Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <PlusIcon size={24} className="rotate-45" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {sections.map(sec => (
            <div key={sec.title}>
              <h3 className="text-[11px] font-extrabold text-accent uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">{sec.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {sec.shortcuts.map(s => (
                  <div key={s.key} className="flex items-center justify-between gap-4 py-1.5 border-b border-white/[0.03]">
                    <span className="text-[12px] text-zinc-400">{s.desc}</span>
                    <span className="text-[10px] font-mono text-white bg-[#333333] px-1.5 py-0.5 rounded shadow-[0_2px_0_#111]">{s.key}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className="mt-8 p-4 bg-accent/5 rounded-lg border border-accent/20">
             <h3 className="text-[12px] font-bold text-white mb-2">Mobile Usage Tip</h3>
             <p className="text-[11px] text-zinc-400 leading-relaxed">
               To use these shortcuts on mobile, connect a physical keyboard via Bluetooth or OTG. Alternatively, some keyboards like "Hacker's Keyboard" or specific IDE-oriented keyboard apps allow using Ctrl/Alt/Shift keys on Android.
             </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AttachmentEditorModal = React.forwardRef<HTMLDivElement, { 
  editingData: { attachment: Attachment, index?: number, isPending: boolean }, 
  onClose: () => void,
  onSave: (updated: Attachment) => void,
  onSend: (updated: Attachment) => void
}>(({ editingData, onClose, onSave, onSend }, ref) => {
  const [content, setContent] = useState(editingData.attachment.content);
  const isImage = editingData.attachment.type.startsWith('image/');
  const { Files, Plus } = useIcons();

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0d0d0d] border border-white/10 w-full max-w-5xl h-full max-h-[90vh] flex flex-col rounded-lg overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <Files size={18} className="text-blue-400" />
            <span className="text-sm font-medium text-white/90">{editingData.attachment.name}</span>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative bg-black/20">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center p-6">
              <img 
                src={content} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain rounded shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div></div>}>
              <CodeMirror
                value={content}
                height="100%"
                theme={cmOneDark}
                extensions={[
                  (() => {
                    const lang = getLanguageFromPath(editingData.attachment.name);
                    if (lang === 'javascript' || lang === 'typescript') return javascript({ jsx: true, typescript: lang === 'typescript' });
                    if (lang === 'html') return html();
                    if (lang === 'css') return css();
                    if (lang === 'python') return python();
                    if (lang === 'java') return java();
                    if (lang === 'cpp') return cpp();
                    return [];
                  })(),
                  EditorView.lineWrapping,
                  EditorView.theme({
                    "&": {
                      backgroundColor: "transparent !important",
                      height: "100%",
                      fontSize: "14px",
                      fontFamily: '"JetBrains Mono", monospace !important'
                    }
                  })
                ]}
                onChange={setContent}
                style={{ width: '100%', height: '100%', background: 'transparent' }}
              />
            </React.Suspense>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4d4d52] text-white text-sm transition-colors rounded-[2px]"
          >
            Cancel
          </button>
          {!isImage && (
            <button 
              onClick={() => onSave({ ...editingData.attachment, content })}
              className="px-4 py-2 bg-[#007ACC] hover:bg-[#006BB3] text-white text-sm transition-all rounded-[2px]"
            >
              Save Changes
            </button>
          )}
          <button 
            onClick={() => onSend({ ...editingData.attachment, content })}
            className="px-6 py-2 bg-[#007ACC] hover:bg-[#006BB3] text-white text-sm font-medium transition-all rounded-[2px] shadow-lg shadow-blue-900/20"
          >
            Send to AI
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

const FileAttachment = ({ attachment, isUser, onEdit }: { attachment: Attachment, isUser: boolean, onEdit?: () => void }) => {
  const [show, setShow] = useState(false);
  const isImage = attachment.type.startsWith('image/');
  const { Files, Edit3, Plus } = useIcons();

  return (
    <div className={`mt-2 flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
      <div 
        onClick={() => onEdit ? onEdit() : setShow(!show)}
        className="flex items-center gap-2 text-[11px] text-blue-400 hover:text-blue-300 transition-colors bg-white/5 px-3 py-2 rounded border border-white/10 cursor-pointer select-none group"
      >
        <Files size={14} />
        <span className="truncate max-w-[200px] font-medium">{attachment.name}</span>
        <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
      </div>
      {show && !onEdit && (
        <div className="mt-2 w-full">
          {isImage ? (
            <div className="relative rounded overflow-hidden border border-white/10 bg-black/20">
              <img 
                src={attachment.content} 
                alt={attachment.name} 
                className="w-full h-auto block"
                referrerPolicy="no-referrer"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
              <button 
                onClick={(e) => { e.stopPropagation(); setShow(false); }}
                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white/70 hover:text-white"
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
          ) : (
            <div className="relative rounded overflow-hidden border border-white/10 bg-black/40 p-3">
              <pre className="text-[10px] font-mono text-white/70 whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {attachment.content}
              </pre>
              <button 
                onClick={(e) => { e.stopPropagation(); setShow(false); }}
                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white/70 hover:text-white"
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ChatMessage = React.memo(React.forwardRef<HTMLDivElement, { 
  msg: Message, 
  theme: any, 
  themeName: string, 
  onEditAttachment?: (att: Attachment) => void, 
  isGenerating?: boolean,
  activePlatform?: string,
  getPlatformConfig?: () => any
}>(({ msg, theme, themeName, onEditAttachment, isGenerating, activePlatform, getPlatformConfig }, ref) => {
  return (
    <motion.div 
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} w-full mb-6 relative group/msg`}
    >
      <div className={`
        relative px-4 py-3 rounded-lg text-[14px] leading-relaxed max-w-[95%] break-words
        ${msg.role === 'user' 
          ? 'bg-foreground/5 text-foreground border border-foreground/10' 
          : 'bg-foreground/[0.02] text-foreground/90 border border-border'
        }
        hover:border-foreground/20 transition-colors duration-200 shadow-sm
        ${isGenerating ? 'ring-1 ring-accent/30 shadow-[0_0_15px_rgba(0,122,204,0.1)]' : ''}
      `}>
        {isGenerating && (
          <motion.div
            animate={{ 
              background: [
                'linear-gradient(90deg, transparent 0%, rgba(0,122,204,0.05) 50%, transparent 100%)',
                'linear-gradient(90deg, transparent 100%, rgba(0,122,204,0.05) 150%, transparent 200%)'
              ],
              left: ['-100%', '100%']
            }}
            transition={{ duration: 0 }}
            className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden"
          />
        )}

        {msg.role === 'model' && msg.reasoning && (
          <TechnicalTraceBlock reasoning={msg.reasoning} />
        )}
        <div className="markdown-content" style={{ fontFamily: '"Fira Code", monospace' }}>
          <React.Suspense fallback={<div className="animate-pulse h-8 bg-foreground/5 rounded w-1/2"></div>}>
            <MarkdownRenderer
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const themeBg = theme['pre[class*="language-"]']?.background || theme['pre[class*="language-"]']?.backgroundColor || 'rgba(255,255,255,0.05)';
                  
                  return !inline && match ? (
                    <CollapsibleCodeBlock
                      language={match[1]}
                      theme={theme}
                      themeName={themeName}
                      themeBg={themeBg}
                      activePlatform={activePlatform}
                      byokConfig={getPlatformConfig?.() as any}
                    >
                      {String(children).replace(/\n$/, '')}
                    </CollapsibleCodeBlock>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {msg.content}
            </MarkdownRenderer>
          </React.Suspense>
        </div>
        {msg.attachments && msg.attachments.length > 0 && (
          <div className={`flex flex-col gap-1 mt-3 pt-3 border-t border-white/5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.attachments.map((att, idx) => (
              <FileAttachment 
                key={idx} 
                attachment={att} 
                isUser={msg.role === 'user'} 
                onEdit={onEditAttachment ? () => onEditAttachment(att) : undefined} 
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}));

const MemoizedCodeEditor = React.memo(({ 
  code, 
  language, 
  filename,
  onChange,
  onSaveVersion,
  onSaveToLocal,
  onPlay,
  onShowPreview,
  onOpenFull,
  onShowSettings,
  onShowTerminal,
  onBackToChat,
  onMenuClick,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  byokConfig,
  activePlatform,
  appThemeName,
  allFiles = {},
  activeFiles = [],
  onFileSelect,
  onCloseFile,
  fontSize = 13,
  splitScreen = false,
  isSplitPane = false,
  onToggleSplit,
  onClosePane,
  onSetEditorTheme,
  editorThemeName,
  onShowHelp,
  onShowQuickOpen,
  onShowCommandPalette,
  onShowShortcuts,
  onSetActiveTab,
  fontFamily = '"JetBrains Mono", monospace'
}: { 
  code: string, 
  language: string, 
  filename?: string,
  onChange?: (value: string | undefined) => void,
  onSaveVersion?: (description: string) => void,
  onSaveToLocal?: () => void,
  onPlay?: () => void,
  onShowPreview?: (show: boolean) => void,
  onOpenFull?: () => void,
  onShowSettings?: () => void,
  onShowTerminal?: () => void,
  onBackToChat?: () => void,
  onMenuClick?: () => void,
  onCreateFile?: () => void,
  onRenameFile?: (name: string) => void,
  onDeleteFile?: (name: string) => void,
  byokConfig?: { platform: string, apiKey: string, model: string, extra?: { baseURL?: string } },
  activePlatform?: string,
  appThemeName: string,
  allFiles?: Record<string, any>,
  activeFiles?: string[],
  onFileSelect?: (name: string) => void,
  onCloseFile?: (name: string) => void,
  fontSize?: number,
  splitScreen?: boolean,
  isSplitPane?: boolean,
  onToggleSplit?: () => void,
  onClosePane?: () => void,
  onSetEditorTheme?: (name: string) => void,
  editorThemeName: string,
  onShowHelp?: () => void,
  onShowQuickOpen?: () => void,
  onShowCommandPalette?: () => void,
  onShowShortcuts?: () => void,
  onSetActiveTab?: (tab: string) => void,
  fontFamily?: string
}) => {
  const [localValue, setLocalValue] = useState(code);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteValue, setPasteValue] = useState('');
  const [cursorPos, setCursorPos] = useState({ row: 1, column: 1 });
  const [isAILoading, setIsAILoading] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFileOpsMenu, setShowFileOpsMenu] = useState(false);
  const [showThemesMenu, setShowThemesMenu] = useState(false);
  const [isCtrlActive, setIsCtrlActive] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const viewRef = useRef<EditorView | null>(null);
  const { 
    Undo2, Redo2, Search, Hash, Wand2, Save, Sparkles, FileText, Bug, 
    Copy, ClipboardPaste, Trash2, Menu, Edit, Play, MoreVertical, Plus,
    ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MoveDown, MoveUp,
    ArrowLeftToLine, ArrowRightToLine, Palette, X, HelpCircle
  } = useIcons();

  const handleAIAction = async (action: 'refactor' | 'document' | 'debug') => {
    if (!localValue || isAILoading) return;
    
    setIsAILoading(true);
    try {
      let newCode = '';
      
      if (byokConfig && byokConfig.apiKey && byokConfig.model) {
        let prompt = "";
        if (action === 'refactor') {
          prompt = `Refactor the following ${language} code to improve readability, performance, and follow best practices. Return only the refactored code without any explanations or markdown blocks:\n\n${localValue}`;
        } else if (action === 'document') {
          prompt = `Add professional JSDoc/comments to the following ${language} code. Return only the documented code without any explanations or markdown blocks:\n\n${localValue}`;
        } else if (action === 'debug') {
          prompt = `Analyze the following ${language} code for bugs or potential issues. Fix any bugs found and improve error handling. Return only the fixed code without any explanations or markdown blocks:\n\n${localValue}`;
        }

        const currentApiKey = byokConfig.apiKey;
        const currentModel = byokConfig.model;
        const currentPlatform = activePlatform || byokConfig.platform;
        const currentExtra = byokConfig.extra;
        
        newCode = await chatWithAI(prompt, [], currentApiKey, currentModel, currentPlatform, [], currentExtra);
      } else {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        let prompt = "";
        if (action === 'refactor') {
          prompt = `Refactor the following ${language} code to improve readability, performance, and follow best practices. Return only the refactored code without any explanations or markdown blocks:\n\n${localValue}`;
        } else if (action === 'document') {
          prompt = `Add professional JSDoc/comments to the following ${language} code. Return only the documented code without any explanations or markdown blocks:\n\n${localValue}`;
        } else if (action === 'debug') {
          prompt = `Analyze the following ${language} code for bugs or potential issues. Fix any bugs found and improve error handling. Return only the fixed code without any explanations or markdown blocks:\n\n${localValue}`;
        }

        const result = await model.generateContent(prompt);
        newCode = result.response.text();
      }
      // Clean up markdown code blocks if AI included them
      newCode = newCode.replace(/```[a-z]*\n/g, '').replace(/\n```/g, '').trim();
      
      if (newCode) {
        handleLocalChange(newCode);
        if (onSaveVersion) onSaveVersion(`AI ${action}`);
      }
    } catch (err) {
      console.error(`AI ${action} failed:`, err);
    } finally {
      setIsAILoading(false);
    }
  };

  // Update local value when external code changes (e.g. from AI)
  useEffect(() => {
    if (code !== localValue) {
      setLocalValue(code);
    }
  }, [code]);

  const handleLocalChange = useCallback((value: string) => {
    if (value === localValue) return;
    setLocalValue(value);
    if (onChange) {
      onChange(value);
    }
  }, [localValue, onChange]);

  const getExtensions = () => {
    const aiCompletions = (context: CompletionContext): CompletionResult | null => {
      const word = context.matchBefore(/\w*/);
      if (!word || (word.from === word.to && !context.explicit)) return null;
      
      return {
        from: word.from,
        options: [
          { label: "ai-refactor", type: "keyword", detail: "AI Refactor", apply: "// ai: refactor this" },
          { label: "ai-debug", type: "keyword", detail: "AI Debug", apply: "// ai: debug this" },
          { label: "ai-explain", type: "keyword", detail: "AI Explain", apply: "// ai: explain this" },
          { label: "console.log", type: "function", detail: "Log to console", apply: "console.log();" },
          { label: "addEventListener", type: "function", detail: "Add event listener", apply: "addEventListener('', (e) => {\n  \n});" },
          { label: "querySelector", type: "function", detail: "Select element", apply: "querySelector('');" },
          { label: "document.getElementById", type: "function", detail: "Get element by ID", apply: "document.getElementById('');" },
          { label: "flex-center", type: "snippet", detail: "CSS Flex Center", apply: "display: flex;\njustify-content: center;\nalign-items: center;" },
          { label: "media-mobile", type: "snippet", detail: "CSS Mobile Media Query", apply: "@media (max-width: 768px) {\n  \n}" },
        ]
      };
    };

    const currentThemeConfig = CM_THEMES[editorThemeName] || CM_THEMES['One Dark'];
    const currentCMTheme = currentThemeConfig.ext || cmOneDark;

    const exts = [
      currentCMTheme,
      EditorView.lineWrapping,
      indentUnit.of("  "),
      indentationMarkers({
        highlightActiveBlock: true,
        hideFirstIndent: false,
      }),
      foldGutter(),
      bracketMatching(),
      indentOnInput(),
      autocompletion({
        activateOnTyping: true,
        icons: true,
      }),
      EditorState.languageData.of(() => [{ autocomplete: aiCompletions }]),
      search({top: true}),
      keymap.of([
        { key: "Mod-p", run: () => { onShowQuickOpen?.(); return true; } },
        { key: "Shift-Mod-p", run: () => { onShowCommandPalette?.(); return true; } },
        { key: "Mod-,", run: () => { onShowSettings?.(); return true; } },
        { key: "Mod-n", run: () => { onCreateFile?.(); return true; } },
        { key: "Mod-s", run: () => { onSaveToLocal?.(); return true; } },
        { key: "Mod-w", run: () => { if (filename) onCloseFile?.(filename); return true; } },
        { key: "Alt-ArrowUp", run: moveLineUp },
        { key: "Alt-ArrowDown", run: moveLineDown },
        { key: "Shift-Alt-ArrowDown", run: copyLineDown },
        { key: "Mod-Enter", run: (view) => {
          const line = view.state.doc.lineAt(view.state.selection.main.to);
          view.dispatch({
            changes: { from: line.to, insert: "\n" },
            selection: { anchor: line.to + 1 }
          });
          return true;
        } },
        { key: "Shift-Mod-Enter", run: (view) => {
          const line = view.state.doc.lineAt(view.state.selection.main.from);
          view.dispatch({
            changes: { from: line.from, insert: "\n" },
            selection: { anchor: line.from }
          });
          return true;
        } },
        { key: "Mod-d", run: selectNextOccurrence },
        { key: "Shift-Mod-l", run: selectSelectionMatches },
        { key: "Shift-Mod-f", run: () => { onSetActiveTab?.('search'); return true; } },
        { key: "Mod-g", run: gotoLine },
        { key: "Mod-Shift-k", run: () => { onShowShortcuts?.(); return true; } }, // Mapping for Keyboard Shortcuts list
        ...completionKeymap, 
        ...foldKeymap, 
        ...searchKeymap
      ]),
      Prec.highest(EditorView.domEventHandlers({
        keydown: (event, view) => {
          const isModifierKey = ['Control', 'Shift', 'Alt', 'Meta'].includes(event.key);
          
          // If a modifier was toggled on mobile toolbar, we intercept the next non-modifier key
          if ((isCtrlActive || isShiftActive) && !isModifierKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
            const char = event.key.toLowerCase();
            const currentCtrl = isCtrlActive;
            const currentShift = isShiftActive;
            
            // Auto-reset state for next cycle
            setIsCtrlActive(false);
            setIsShiftActive(false);

            // Manual mapping for core productivity shortcuts (reliable fallback)
            if (currentCtrl && !currentShift) {
              if (char === 'a') { selectAll(view); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'z') { undo(view); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'y') { redo(view); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 's') { if (onSaveToLocal) onSaveToLocal(); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'f') { openSearchPanel(view); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'h') { openSearchPanel(view); event.preventDefault(); event.stopPropagation(); return true; } // search panel handles replace
              if (char === 'p') { if (onShowQuickOpen) onShowQuickOpen(); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'g') { gotoLine(view); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'c') { document.execCommand('copy'); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'x') { document.execCommand('cut'); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'v') { setShowPasteModal(true); event.preventDefault(); event.stopPropagation(); return true; }
              if (event.key === 'Enter') {
                const line = view.state.doc.lineAt(view.state.selection.main.to);
                view.dispatch({
                  changes: { from: line.to, insert: "\n" },
                  selection: { anchor: line.to + 1 }
                });
                event.preventDefault(); event.stopPropagation(); return true;
              }
            }

            if (currentCtrl && currentShift) {
              if (char === 'p') { if (onShowCommandPalette) onShowCommandPalette(); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'f') { if (onSetActiveTab) onSetActiveTab('search'); event.preventDefault(); event.stopPropagation(); return true; }
              if (char === 'k') { if (onShowShortcuts) onShowShortcuts(); event.preventDefault(); event.stopPropagation(); return true; }
            }
            
            // Re-dispatch for anything else (Arrows, complex combos, or other keys)
            event.preventDefault();
            event.stopPropagation();
            
            const modEvent = new KeyboardEvent('keydown', {
              key: event.key, 
              code: event.code || '',
              ctrlKey: currentCtrl || event.ctrlKey,
              shiftKey: currentShift || event.shiftKey,
              altKey: event.altKey,
              metaKey: event.metaKey,
              bubbles: true, 
              cancelable: true, 
              composed: true
            });
            
            // Dispatch to both contentDOM and the scroller to be safe
            view.contentDOM.dispatchEvent(modEvent);
            return true;
          }
          return false;
        }
      })),
      EditorView.theme({
        "&": {
          height: "100%",
          fontSize: `${fontSize}px !important`,
          fontFamily: `${fontFamily} !important`
        },
        "&.cm-focused": {
          outline: "none"
        },
        ".cm-scroller": {
          overflow: "auto",
          fontFamily: "inherit !important"
        },
        ".cm-content": {
          padding: "4px 0 !important",
          fontFamily: `${fontFamily} !important`,
          caretColor: "#c6c6c6 !important"
        },
        ".cm-gutter, .cm-tooltip-autocomplete, .cm-completionLabel": {
          fontFamily: `${fontFamily} !important`
        },
        ".cm-gutters": {
          border: "none !important",
          backgroundColor: "#1e1e1e !important",
          color: "#858585",
          fontSize: `${Math.max(10, fontSize - 1)}px`
        },
        ".cm-lineNumbers .cm-gutterElement": {
          padding: "0 8px 0 8px !important"
        },
        ".cm-foldGutter": {
          width: "12px",
          paddingRight: "2px",
          cursor: "pointer",
          color: "transparent"
        },
        ".cm-foldGutter:hover": {
          color: "#c5c5c5"
        },
        ".cm-foldGutter span": {
          transition: "color 0.1s"
        },
        ".cm-foldGutter span:hover": {
          color: "#ffffff"
        },
        ".cm-activeLine": {
          backgroundColor: "rgba(255, 255, 255, 0.04) !important"
        },
        ".cm-activeLineGutter": {
          backgroundColor: "rgba(255, 255, 255, 0.04) !important",
          color: "#c6c6c6 !important"
        },
        ".cm-selectionBackground": {
          backgroundColor: "#264f78 !important"
        },
        ".cm-indentation-marker": {
          background: "none !important",
          borderLeft: "1px solid rgba(255, 255, 255, 0.05) !important",
          marginLeft: "-1px !important"
        },
        ".cm-panels": {
          backgroundColor: "#252526 !important",
          color: "#cccccc !important",
          fontSize: "12px",
          fontFamily: "var(--font-sans), sans-serif",
          borderTop: "1px solid #333",
          zIndex: "100"
        },
        ".cm-panels-top": {
          borderBottom: "1px solid #333"
        },
        ".cm-search": {
          padding: "6px 12px !important",
          display: "flex !important",
          flexWrap: "wrap",
          gap: "8px",
          alignItems: "center"
        },
        ".cm-search label": {
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginRight: "8px",
          cursor: "pointer",
          userSelect: "none"
        },
        ".cm-search input[type=checkbox]": {
          accentColor: "#007acc"
        },
        ".cm-textfield": {
          backgroundColor: "#3c3c3c !important",
          border: "1px solid #3c3c3c !important",
          color: "#cccccc !important",
          borderRadius: "2px",
          padding: "3px 6px",
          margin: "2px",
          outline: "none",
          fontSize: "12px",
          minWidth: "150px"
        },
        ".cm-textfield:focus": {
          border: "1px solid #007acc !important"
        },
        ".cm-button": {
          backgroundColor: "rgba(255, 255, 255, 0.05) !important",
          border: "1px solid rgba(255, 255, 255, 0.1) !important",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2) !important",
          color: "#cccccc !important",
          borderRadius: "4px !important",
          padding: "4px 10px !important",
          cursor: "pointer",
          fontSize: "11px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          margin: "2px",
          transition: "all 0.1s"
        },
        ".cm-button:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1) !important",
          color: "#ffffff !important",
          borderColor: "rgba(255, 255, 255, 0.2) !important"
        },
        ".cm-button:active": {
          transform: "translateY(1px)",
          boxShadow: "none"
        },
        ".cm-button[name=close]": {
          fontSize: "16px",
          padding: "0 6px !important",
          lineHeight: "1",
          background: "none !important",
          border: "none !important",
          boxShadow: "none !important"
        }
      })
    ];

    if (language === 'javascript' || language === 'typescript') exts.push(javascript({ jsx: true, typescript: language === 'typescript' }));
    else if (language === 'html') exts.push(html());
    else if (language === 'css') exts.push(css());
    else if (language === 'python') exts.push(python());
    else if (language === 'java') exts.push(java());
    else if (language === 'cpp') exts.push(cpp());

    return exts;
  };

  const triggerAction = (actionId: string) => {
    if (viewRef.current) {
      if (actionId === 'undo') {
        // Redux standard undo maybe? Or better use keymap
        // For simplicity, just focus
        viewRef.current.focus();
      }
    }
  };

  const handleManualPaste = () => {
    if (pasteValue) {
      insertText(pasteValue);
    }
    setShowPasteModal(false);
    setPasteValue('');
  };

  const handleFormat = async () => {
    if (!localValue) return;
    try {
      if (language === 'cpp') {
        const beautify = await import("js-beautify");
        // Using js() for C++ as it's the closest thing in js-beautify
        const formatted = beautify.default.js(localValue, { 
          indent_size: 2,
          brace_style: "collapse",
          preserve_newlines: true,
          space_before_conditional: true
        });
        if (formatted) handleLocalChange(formatted);
        return;
      }

      const [prettier, prettierPluginBabel, prettierPluginEstree, prettierPluginHtml, prettierPluginCss] = await Promise.all([
        import("prettier/standalone"),
        import("prettier/plugins/babel"),
        import("prettier/plugins/estree"),
        import("prettier/plugins/html"),
        import("prettier/plugins/postcss")
      ]);

      let parser = "babel";
      let plugins: any[] = [prettierPluginBabel, prettierPluginEstree];

      if (language === 'html') {
        parser = "html";
        plugins = [prettierPluginHtml];
      } else if (language === 'css') {
        parser = "css";
        plugins = [prettierPluginCss];
      } else if (language === 'java') {
        const javaPlugin = await import("prettier-plugin-java");
        parser = "java";
        plugins = [javaPlugin.default || javaPlugin];
      } else if (language === 'python') {
        const pythonPlugin = await import("@prettier/plugin-python");
        parser = "python";
        plugins = [pythonPlugin.default || pythonPlugin];
      }

      const formatted = await prettier.default.format(localValue, {
        parser,
        plugins,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: "es5",
      });

      if (formatted) {
        handleLocalChange(formatted);
      }
    } catch (err) {
      console.error("Formatting error:", err);
    }
  };

  const insertText = (text: string) => {
    if (viewRef.current) {
      const { state, dispatch } = viewRef.current;
      const main = state.selection.main;
      dispatch({
        changes: { from: main.from, to: main.to, insert: text },
        selection: { anchor: main.from + text.length },
        scrollIntoView: true
      });
      viewRef.current.focus();
    }
  };

  const handleKeyboardAction = (action: string) => {
    if (!viewRef.current) return;
    const { state, dispatch } = viewRef.current;
    
    switch (action) {
      case 'tab': insertText('  '); break;
      case 'save': if (onSaveToLocal) onSaveToLocal(); break;
      case 'search': if (viewRef.current) openSearchPanel(viewRef.current); break;
      case 'left': cursorCharLeft(viewRef.current); break;
      case 'right': cursorCharRight(viewRef.current); break;
      case 'up': cursorLineUp(viewRef.current); break;
      case 'down': cursorLineDown(viewRef.current); break;
      case 'esc': closeCompletion(viewRef.current); break;
      default: break;
    }
    viewRef.current.focus();
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      {/* VS Code Style Dynamic Tabs */}
      <div className="h-9 flex items-center justify-between select-none border-b border-[#1e1e1e] bg-[#252526] shrink-0">
        <div className="flex items-center overflow-x-auto no-scrollbar h-full scroll-smooth flex-1 touch-pan-x">
          <button 
            onClick={onMenuClick}
            className="h-full px-3 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors border-r border-[#1e1e1e]"
            title="Toggle Sidebar"
          >
            <Menu size={16} />
          </button>
          {activeFiles.map((fname) => {
            const isSelected = filename === fname;
            const extension = fname.split('.').pop()?.toLowerCase() || '';
            const officialIconUrl = getOfficialIcon(extension);
            
            let FileIcon = File;
            let iconColor = 'text-zinc-500';
            
            if (!officialIconUrl) {
              if (extension === 'html') { FileIcon = FileCode; iconColor = 'text-orange-500'; }
              if (extension === 'css') { FileIcon = FileCode; iconColor = 'text-blue-500'; }
              if (extension === 'js' || extension === 'ts' || extension === 'tsx') { FileIcon = FileJson; iconColor = 'text-yellow-500'; }
            }

            return (
              <div 
                key={fname}
                onClick={() => onFileSelect?.(fname)}
                className={`h-full px-3 flex items-center gap-2 text-[12px] font-sans cursor-pointer min-w-fit max-w-[160px] relative group border-r border-[#1e1e1e] transition-none select-none ${isSelected ? 'bg-[#1e1e1e]' : 'hover:bg-[#2a2d2e]/50'}`}
              >
                {isSelected && <div className="absolute top-0 left-0 right-0 h-[1px] bg-accent shadow-[0_0_8px_rgba(59,130,246,0.3)]" />}
                <div className="flex items-center gap-2">
                  {officialIconUrl ? (
                    <img 
                      src={officialIconUrl} 
                      alt={extension} 
                      className="w-3.5 h-3.5 object-contain transition-transform group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <FileIcon size={14} className={`${iconColor} group-hover:scale-110 transition-transform`} />
                  )}
                  <span className={`${isSelected ? 'text-[#ffffff] font-medium' : 'text-[#969696]'} truncate tracking-tight`}>
                    {fname.split('/').pop()}
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onCloseFile?.(fname); }}
                  className={`ml-1.5 p-0.5 rounded-[2px] hover:bg-white/10 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center gap-0.5 px-2 h-full">
          <button 
            onClick={onPlay}
            className="p-1.5 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-colors"
            title="Run Code"
          >
            <Play size={16} fill="currentColor" />
          </button>
          <button 
            onClick={onToggleSplit}
            className="hidden md:flex p-1.5 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-colors"
            title="Split Editor"
          >
            <Maximize size={16} />
          </button>
          {isSplitPane && (
            <button 
              onClick={onClosePane}
              className="flex p-1.5 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-colors"
              title="Close Pane"
            >
              <X size={16} />
            </button>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-1.5 hover:bg-white/5 rounded text-zinc-400 hover:text-white transition-colors"
              title="More Actions"
            >
              <MoreVertical size={16} />
            </button>
            <AnimatePresence>
              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-full mt-1 w-52 bg-[#252526] border border-[#1e1e1e] rounded shadow-2xl z-50 py-1 overflow-hidden"
                  >
                    <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-[#1e1e1e] mb-1">
                        AI Assistants
                      </div>
                      <button
                        onClick={() => { handleAIAction('refactor'); setShowMoreMenu(false); }}
                        className="w-full px-3 py-2 text-left text-[12px] text-zinc-400 hover:text-white hover:bg-[#094771] flex items-center gap-2"
                      >
                        <Sparkles size={14} className="text-orange-400" />
                        AI Refactor
                      </button>
                      <button
                        onClick={() => { handleAIAction('document'); setShowMoreMenu(false); }}
                        className="w-full px-3 py-2 text-left text-[12px] text-zinc-400 hover:text-white hover:bg-[#094771] flex items-center gap-2"
                      >
                        <FileText size={14} className="text-blue-400" />
                        AI Document
                      </button>
                      <div className="my-1 border-t border-[#1e1e1e]" />
                      <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        Editor Tools
                      </div>
                      <button
                        onClick={() => { handleFormat(); setShowMoreMenu(false); }}
                        className="w-full px-3 py-2 text-left text-[12px] text-zinc-400 hover:text-white hover:bg-[#094771] flex items-center gap-2 mb-1"
                      >
                        <Edit size={14} />
                        Format Code
                      </button>
                      <button
                        onClick={() => { onShowHelp?.(); setShowMoreMenu(false); }}
                        className="w-full px-3 py-2 text-left text-[12px] text-zinc-400 hover:text-white hover:bg-[#094771] flex items-center gap-2 mb-1"
                      >
                        <HelpCircle size={14} />
                        Help & Documentation
                      </button>
                      <div className="my-1 border-t border-[#1e1e1e]" />
                      <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        Appearance
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowThemesMenu(!showThemesMenu); }}
                        className="w-full px-3 py-2 text-left text-[12px] text-zinc-400 hover:text-white hover:bg-[#094771] flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <Palette size={14} />
                          Themes
                        </div>
                        <ChevronRight size={12} className={`transition-transform duration-200 ${showThemesMenu ? 'rotate-90' : ''}`} />
                      </button>

                      {showThemesMenu && (
                        <div className="mt-1 pb-1 border-t border-[#1e1e1e] bg-black/10">
                          {Object.keys(CM_THEMES).map(tName => (
                            <button
                              key={tName}
                              onClick={() => { onSetEditorTheme?.(tName); setShowThemesMenu(false); setShowMoreMenu(false); }}
                              className={`w-full px-4 py-1.5 text-left text-[11px] flex items-center gap-2 transition-colors ${editorThemeName === tName ? 'text-white bg-[#37373d]' : 'text-zinc-400 hover:text-white hover:bg-[#2a2d2e]'}`}
                            >
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CM_THEMES[tName].colors[0] }} />
                              <span className="truncate">{tName}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      
      {/* VS Code Breadcrumb Bar */}
      <div className="h-[22px] flex items-center px-4 gap-0.5 text-[12px] font-sans select-none border-b border-[#1e1e1e] overflow-x-auto no-scrollbar whitespace-nowrap" style={{ backgroundColor: '#1e1e1e', color: '#858585' }}>
         <span className="hover:text-white cursor-pointer px-0.5 transition-colors">reversx-workspace</span>
         <ChevronRight size={14} className="opacity-40" />
         <span className="hover:text-white cursor-pointer px-0.5 transition-colors">src</span>
         <ChevronRight size={14} className="opacity-40" />
         <div className="flex items-center gap-1 text-[#cccccc] hover:text-white cursor-pointer px-0.5 transition-colors font-medium">
           {filename.endsWith('html') && <FileCode size={12} className="text-orange-400" />}
           {filename.endsWith('css') && <FileCode size={12} className="text-blue-400" />}
           {(filename.endsWith('js') || filename.endsWith('ts') || filename.endsWith('tsx')) && <FileCode size={12} className="text-blue-400" />}
           <span>{filename}</span>
         </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative overflow-hidden bg-background flex flex-col">
        {language === 'image' || filename.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-auto relative" style={{ backgroundColor: '#1e1e1e' }}>
             <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             <img src={localValue} alt={filename} className="max-w-full max-h-full object-contain rounded shadow-lg ring-1 ring-white/10 z-10" />
             <div className="mt-6 text-white/50 text-[11px] font-mono select-all z-10 bg-black/40 px-3 py-1.5 rounded border border-white/5 flex items-center justify-center">
                {filename} • {Math.round(localValue.length / 1024)} KB
             </div>
          </div>
        ) : (
          <React.Suspense fallback={<div className="flex h-full w-full items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div></div>}>
            <CodeMirror
            value={localValue}
            height="100%"
            theme={CM_THEMES[editorThemeName]?.ext || 'dark'}
            extensions={getExtensions()}
            onChange={handleLocalChange}
            placeholder="// Create something amazing..."
            onUpdate={(update) => {
              if (update.view) {
                viewRef.current = update.view;
                const pos = update.state.selection.main.head;
                const line = update.state.doc.lineAt(pos);
                const newPos = { row: line.number, column: pos - line.from + 1 };
                setCursorPos(prev => {
                  if (prev.row === newPos.row && prev.column === newPos.column) return prev;
                  return newPos;
                });
              }
            }}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: false,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              tabSize: 2,
            }}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent'
            }}
          />
        </React.Suspense>
        )}
      </div>

      {/* VS Code Style Editor Status Bar */}
      <div className="hidden md:flex h-[22px] items-center justify-between px-2 text-[11px] font-sans select-none shrink-0" style={{ backgroundColor: '#007acc', color: '#ffffff' }}>
        <div className="flex items-center gap-4 h-full">
          <div className="flex items-center gap-1 hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
            <CodeIcon size={12} />
            <span>main*</span>
          </div>
          <div className="flex items-center gap-1.5 hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
            <span className="flex items-center gap-1"><span className="text-[10px]">❌</span> 0</span>
            <span className="flex items-center gap-1"><span className="text-[10px]">⚠️</span> 0</span>
          </div>
        </div>
        <div className="flex items-center gap-3 h-full">
          <div className="flex items-center hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
            Ln {cursorPos.row}, Col {cursorPos.column}
          </div>
          <div className="flex items-center hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
            Spaces: 2
          </div>
          <div className="flex items-center hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
            CRLF
          </div>
          <div className="flex items-center hover:bg-white/20 px-1.5 h-full cursor-pointer transition-colors">
            <Settings size={12} />
          </div>
        </div>
      </div>

      {/* Professional Compact Mobile Keyboard Toolbar - Improved Multi-Row Layout */}
      <div className="md:hidden bg-[#2d2d2d] border-t border-black flex flex-col shrink-0 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
        {/* Row 1: Navigation & Undo/Redo */}
        <div className="px-1 py-1 flex items-center overflow-x-auto no-scrollbar gap-1.5 custom-scrollbar-hide h-[38px] bg-[#2d2d2d]">
          <button onClick={() => handleKeyboardAction('left')} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0"><ChevronLeft size={16} /></button>
          <button onClick={() => handleKeyboardAction('up')} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0"><ChevronUp size={16} /></button>
          <button onClick={() => handleKeyboardAction('down')} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0"><ChevronDown size={16} /></button>
          <button onClick={() => handleKeyboardAction('right')} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0"><ChevronRight size={16} /></button>
          <div className="w-[1px] h-4 bg-white/10 mx-0.5 shrink-0" />
          <button onClick={() => triggerAction('undo')} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0"><Undo2 size={16} /></button>
          <button onClick={() => triggerAction('redo')} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0"><Redo2 size={16} /></button>
          <div className="w-[1px] h-4 bg-white/10 mx-0.5 shrink-0" />
          <button onClick={() => onShowQuickOpen?.()} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0" title="Quick Open (Ctrl+P)"><Search size={14} /></button>
          <button onClick={() => onShowCommandPalette?.()} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0" title="Command Palette (Ctrl+Shift+P)"><Codicon name="terminal" size={14} /></button>
          <button onClick={() => handleKeyboardAction('tab')} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0"><ArrowRightToLine size={14} /></button>
          <button onClick={() => handleKeyboardAction('save')} className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-[#007acc] active:bg-[#202020] transition-all shrink-0" title="Save"><Save size={14} /></button>
        </div>

        {/* Row 2: Character Symbols (Middle) */}
        <div className="px-1 py-1 border-t border-black/20 flex items-center overflow-x-auto no-scrollbar gap-1 custom-scrollbar-hide h-[34px] bg-[#222222]">
          {['<', '>', '/', '{', '}', '[', ']', ';', '(', ')', '"', "'", ':', '=', '!', '&', '|', '+', '-', '*', '%', '?', '#', '$', '@', '^', '~', '`'].map(char => (
            <button
              key={char}
              onClick={() => insertText(char)}
              className="w-7 h-6 flex items-center justify-center bg-[#333333] border border-[#555555] border-b-[#111111] border-r-[#111111] rounded-[2px] text-[10px] font-medium text-[#e0e0e0] active:bg-[#111111] transition-all shrink-0"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Row 3: Primary Controls (Absolute Bottom Row) */}
        <div className="px-1 py-1 border-t border-black/30 flex items-center overflow-x-auto no-scrollbar gap-1.5 custom-scrollbar-hide h-[40px] bg-[#1a1a1a]">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCtrlActive(!isCtrlActive); viewRef.current?.focus(); }} 
            className={`h-7 px-2 border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-[10px] font-bold transition-all shadow-md shrink-0 ${isCtrlActive ? 'bg-[#007acc] text-white border-white/40 ring-1 ring-accent/50' : 'bg-[#404040] text-white shadow-black/50'}`}
          >
            Ctrl
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsShiftActive(!isShiftActive); viewRef.current?.focus(); }} 
            className={`h-7 px-2 border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-[10px] font-bold transition-all shadow-md shrink-0 ${isShiftActive ? 'bg-[#007acc] text-white border-white/40 ring-1 ring-accent/50' : 'bg-[#404040] text-white shadow-black/50'}`}
          >
            Shift
          </button>
          <div className="w-[1px] h-5 bg-white/10 mx-0.5 shrink-0" />
          <button 
            onClick={() => onShowPreview?.(false)} 
            className="h-7 px-3 bg-[#333333] border border-[#555555] border-b-[#111111] border-r-[#111111] rounded-[2px] text-[9px] font-bold text-white active:bg-[#111111] transition-all shrink-0 tracking-tighter"
          >
            Code
          </button>
          <button 
            onClick={() => onShowPreview?.(true)} 
            className="h-7 px-3 bg-[#333333] border border-[#555555] border-b-[#111111] border-r-[#111111] rounded-[2px] text-[9px] font-bold text-white active:bg-[#111111] transition-all shrink-0 tracking-tighter"
          >
            Preview
          </button>
          <button 
            onClick={onOpenFull} 
            className="h-7 px-3 bg-[#333333] border border-[#555555] border-b-[#111111] border-r-[#111111] rounded-[2px] text-[9px] font-bold text-white active:bg-[#111111] transition-all shrink-0 tracking-tighter"
          >
            Full
          </button>
          <div className="w-[1px] h-5 bg-white/10 mx-0.5 shrink-0" />
          <button 
            onClick={onShowSettings} 
            className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0"
            title="Settings"
          >
            <Settings size={14} />
          </button>
          <button 
            onClick={onShowTerminal} 
            className="w-8 h-7 flex items-center justify-center bg-[#404040] border border-[#777777] border-b-[#111111] border-r-[#111111] rounded-[2px] text-white active:bg-[#202020] transition-all shrink-0"
            title="Terminal"
          >
            <Terminal size={14} />
          </button>
        </div>
      </div>

      {/* Paste Fallback Modal */}
      <AnimatePresence mode="wait">
        {showPasteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-lg p-6 shadow-2xl"
            >
              <h3 className="text-lg font-normal text-foreground mb-2">Paste Content</h3>
              <p className="text-sm text-foreground/50 mb-4">
                Direct clipboard access is blocked by your browser's security policy. 
                Please paste your code below and click "Insert".
              </p>
              <textarea
                autoFocus
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                className="w-full h-40 bg-background border border-border rounded p-3 text-sm font-roboto text-foreground focus:outline-none focus:border-accent resize-none mb-4"
                placeholder="Paste your code here..."
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setShowPasteModal(false);
                    setPasteValue('');
                  }}
                  className="px-4 py-2 text-sm font-normal text-foreground/50 hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleManualPaste}
                  className="px-6 py-2 bg-accent text-accent-foreground text-sm font-normal rounded hover:bg-accent/90 transition-colors"
                >
                  Insert Code
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

const ChatList = React.memo(({ 
  messages, 
  isLoading, 
  chatContainerRef, 
  handleScroll, 
  chatEndRef, 
  theme, 
  themeName,
  userName,
  onEditAttachment,
  activePlatform,
  getPlatformConfig
}: { 
  messages: Message[], 
  isLoading: boolean, 
  chatContainerRef: React.RefObject<HTMLDivElement | null>, 
  handleScroll: () => void, 
  chatEndRef: React.RefObject<HTMLDivElement | null>,
  theme: any,
  themeName: string,
  userName: string | null,
  onEditAttachment?: (att: Attachment) => void,
  activePlatform?: string,
  getPlatformConfig?: () => any
}) => {
  return (
    <div 
      ref={chatContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col min-h-0"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {messages.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center py-20 w-full"
          >
            <div className="flex flex-col items-center justify-center">
              <svg className="w-40 h-40 mb-8" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M 200 40 L 340 360 L 200 250 L 60 360 Z" 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  strokeLinejoin="round"
                  className="opacity-80 text-foreground"
                />
              </svg>
              <h1 className="text-[48px] font-semibold text-foreground tracking-tighter m-0" style={{ fontFamily: "var(--font-sans), sans-serif" }}>
                Revers<span className="font-light opacity-70">X</span>
              </h1>
            </div>
          </motion.div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessage 
              key={msg.id || i} 
              msg={msg} 
              theme={theme} 
              themeName={themeName} 
              onEditAttachment={onEditAttachment} 
              isGenerating={isLoading && i === messages.length - 1 && msg.role === 'model'}
              activePlatform={activePlatform}
              getPlatformConfig={getPlatformConfig}
            />
          ))
        )}
      </AnimatePresence>
      {isLoading && (!messages[messages.length - 1] || messages[messages.length - 1].role !== 'model' || !messages[messages.length - 1].reasoning) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-[420px] font-mono select-none my-6 ml-2"
        >
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-2 font-sans px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60 animate-pulse" />
            <span className="tracking-wide">Terminal — thought-engine</span>
          </div>
          <div className="bg-[#1e1e1e] border border-white/[0.08] rounded-md overflow-hidden shadow-2xl">
            <div className="p-4 flex items-start gap-3">
              <div className="text-blue-400 mt-1">
                <Terminal size={14} />
              </div>
              <div className="flex-1 space-y-2.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[#cccccc] text-[13px]">Resolving context...</span>
                  <motion.span 
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0 }}
                    className="w-[0.6ch] h-[1.1em] bg-blue-400/50 inline-block align-middle"
                  />
                </div>
                <div className="flex flex-col gap-2 pt-1 border-t border-white/[0.03]">
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-sans">
                    <span>Checking workspace status</span>
                    <span>1.0.4</span>
                  </div>
                  <div className="h-[2px] w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-500/40"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 0 }}
                      style={{ width: '30%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
});


import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';

type TreeNodeType = {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children: Record<string, TreeNodeType>;
};

const getOfficialIcon = (ext: string) => {
  const icons: Record<string, string> = {
    html: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    css: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    js: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    jsx: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    ts: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    tsx: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    py: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    java: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    cpp: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
    c: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    md: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg',
    json: 'https://raw.githubusercontent.com/otaviopace/devicon/master/icons/json/json-original.svg'
  };
  return icons[ext] || null;
};

const FileTreeItem = ({ node, activeFile, activeFileMenu, handleFileOpen, setActiveFileMenu, handleRenameFile, handleDeleteFile, depth = 0 }: any) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'folder') {
    return (
      <div className="w-full flex flex-col">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-1.5 py-1 text-[13px] transition-all duration-200 group cursor-pointer text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white relative`}
          style={{ paddingLeft: `${Math.max(12, depth * 12 + 12)}px`, paddingRight: '16px' }}
        >
          {/* Indent Guide Line for Folders */}
          {depth > 0 && Array.from({ length: depth }).map((_, i) => (
            <div 
              key={i}
              className="absolute border-l border-white/5 h-full"
              style={{ left: `${i * 12 + 12}px` }}
            />
          ))}

          <div className="w-3.5 flex items-center justify-center opacity-80 group-hover:opacity-100">
            {isOpen ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
          </div>
          <div className="text-accent/80 group-hover:text-accent transition-colors">
            {isOpen ? <FolderOpen size={14} /> : <FolderClosedIcon size={14} />}
          </div>
          <span className="truncate flex-1 font-medium tracking-tight">{node.name}</span>
        </div>
        {isOpen && Object.values(node.children).sort((a: any, b: any) => {
           if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
           return a.name.localeCompare(b.name);
        }).map((child: any) => (
          <FileTreeItem 
            key={child.path}
            node={child}
            activeFile={activeFile}
            activeFileMenu={activeFileMenu}
            handleFileOpen={handleFileOpen}
            setActiveFileMenu={setActiveFileMenu}
            handleRenameFile={handleRenameFile}
            handleDeleteFile={handleDeleteFile}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  // File rendering
  const name = node.path;
  const isSelected = activeFile === name;
  const extension = name.split('.').pop()?.toLowerCase() || '';
  
  const officialIconUrl = getOfficialIcon(extension);
  let Icon = File;
  let iconColor = isSelected ? 'text-white' : 'text-[#cccccc]';

  if (!officialIconUrl) {
    if (extension === 'json') {
      Icon = FileJson;
      iconColor = isSelected ? 'text-white' : 'text-orange-400';
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) {
      Icon = ImageIcon;
      iconColor = isSelected ? 'text-white' : 'text-emerald-400';
    }
  }

  return (
    <div
      onClick={() => handleFileOpen(name)}
      className={`w-full flex items-center gap-2 py-1 text-[13px] transition-all duration-200 group cursor-pointer relative ${isSelected ? 'bg-accent/20 text-white shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]' : 'text-[#cccccc] hover:bg-[#2a2d2e] hover:text-white'}`}
      style={{ paddingLeft: `${Math.max(12, depth * 12 + 16)}px`, paddingRight: '16px' }}
    >
      {/* Indent Guide Line */}
      {depth > 0 && Array.from({ length: depth }).map((_, i) => (
        <div 
          key={i}
          className="absolute border-l border-white/5 h-full"
          style={{ left: `${i * 12 + 12}px` }}
        />
      ))}

      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
      
      {officialIconUrl ? (
        <img 
          src={officialIconUrl} 
          alt={extension} 
          className="w-3.5 h-3.5 object-contain transition-transform duration-300 group-hover:scale-110" 
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <Icon size={14} className={`${iconColor} transition-transform duration-300 group-hover:scale-110`} />
      )}
      
      <span className={`truncate flex-1 tracking-tight ${isSelected ? 'font-medium' : 'font-normal'}`}>{node.name}</span>
      
      <div className="relative flex items-center shrink-0">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            setActiveFileMenu(name === activeFileMenu ? null : name); 
          }}
          className="p-1 hover:bg-white/10 rounded text-foreground-subtle hover:text-foreground-muted transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={14} />
        </button>

        <AnimatePresence>
          {activeFileMenu === name && (
            <>
              <div 
                className="fixed inset-0 z-[60]" 
                onClick={(e) => { e.stopPropagation(); setActiveFileMenu(null); }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-1 w-32 bg-[#252526] border border-white/10 rounded-md shadow-xl z-[70] py-1 overflow-hidden"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameFile(name);
                    setActiveFileMenu(null);
                  }}
                  className="w-full px-3 py-2 text-left text-[12px] text-foreground-muted hover:text-foreground hover:bg-white/5 flex items-center gap-2 transition-colors"
                >
                  <Edit3 size={12} />
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(name);
                    setActiveFileMenu(null);
                  }}
                  className="w-full px-3 py-2 text-left text-[12px] text-red-400/60 hover:text-red-400 hover:bg-red-500/5 flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const buildFileTree = (filesList: string[]) => {
  const root: TreeNodeType = { name: 'root', type: 'folder', children: {}, path: '' };
  filesList.forEach(path => {
    const parts = path.split('/');
    let current = root;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current.children[part] = { name: part, type: 'file', path: path, children: {} };
      } else {
        if (!current.children[part]) {
          current.children[part] = { name: part, type: 'folder', children: {}, path: parts.slice(0, i + 1).join('/') };
        }
        current = current.children[part];
      }
    });
  });
  return root;
};

export default function App() {
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempName, setTempName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [previewPendingIdx, setPreviewPendingIdx] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const stopRef = useRef(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'projects' | 'settings' | 'byok' | 'friends' | 'search' | 'extensions'>('chat');
  const [installedExtensions, setInstalledExtensions] = useState<any[]>(() => {
    const saved = localStorage.getItem('reversx_extensions');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeExtensionId, setActiveExtensionId] = useState<string | null>(() => localStorage.getItem('reversx_active_ext'));
  const [docLanguage, setDocLanguage] = useState<'en' | 'bn'>('en');

  useEffect(() => {
    localStorage.setItem('reversx_extensions', JSON.stringify(installedExtensions));
  }, [installedExtensions]);

  useEffect(() => {
    if (activeExtensionId) {
      localStorage.setItem('reversx_active_ext', activeExtensionId);
    } else {
      localStorage.removeItem('reversx_active_ext');
    }
  }, [activeExtensionId]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [customExtJSON, setCustomExtJSON] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalReplaceQuery, setGlobalReplaceQuery] = useState('');
  const [globalSearchOptions, setGlobalSearchOptions] = useState({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false
  });
  const [globalSearchResults, setGlobalSearchResults] = useState<{ filename: string, matches: { line: number, text: string, index: number }[] }[]>([]);

  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<{ type: 'cmd' | 'output' | 'error', text: string }[]>([
    { type: 'output', text: 'ReversX v1 Terminal - Type "help" for a list of commands.' }
  ]);
  const [siliconFlowApiKey, setSiliconFlowApiKey] = useState('');
  const [siliconFlowModel, setSiliconFlowModel] = useState('');
  const [deepseekApiKey, setDeepseekApiKey] = useState('');
  const [deepseekModel, setDeepseekModel] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [anthropicModel, setAnthropicModel] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [groqModel, setGroqModel] = useState('');
  const [mistralApiKey, setMistralApiKey] = useState('');
  const [mistralModel, setMistralModel] = useState('');
  const [perplexityApiKey, setPerplexityApiKey] = useState('');
  const [perplexityModel, setPerplexityModel] = useState('');
  const [togetherApiKey, setTogetherApiKey] = useState('');
  const [togetherModel, setTogetherModel] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customBaseURL, setCustomBaseURL] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash');
  const [activePlatform, setActivePlatform] = useState<string>('gemini');
  const [isGithubImportOpen, setIsGithubImportOpen] = useState(false);
  const [isGithubExportOpen, setIsGithubExportOpen] = useState(false);
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [githubExportRepo, setGithubExportRepo] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubCommitMessage, setGithubCommitMessage] = useState('Update from ReversX Editor');
  const [isGitHubImporting, setIsGitHubImporting] = useState(false);
  const [isGitHubExporting, setIsGitHubExporting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const exchangeToken = async () => {
        setIsGitHubExporting(true);
        try {
          const res = await fetch('/api/github/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          });
          const data = await res.json();
          if (data.access_token) {
            setGithubToken(data.access_token);
            if (isDbLoaded) idbSet('reversx_github_token', data.access_token);
            setIsGithubExportOpen(true);
          } else {
            throw new Error(data.error_description || data.error || 'Failed to authenticate');
          }
        } catch (err: any) {
          console.error('GitHub Auth Error:', err);
        } finally {
          setIsGitHubExporting(false);
        }
      };
      exchangeToken();
    }
  }, [isDbLoaded]);

  const handleGithubLogin = useCallback(() => {
    const clientId = (import.meta as any).env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = (import.meta as any).env.VITE_GITHUB_REDIRECT_URI || window.location.origin;
    if (!clientId) {
      alert('GitHub Client ID is not configured. Please add VITE_GITHUB_CLIENT_ID in the dashboard settings.');
      return;
    }
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo`;
    window.location.href = githubUrl;
  }, []);

  const getPlatformConfig = useCallback((): { platform: string, apiKey: string, model: string, extra?: { baseURL?: string } } => {
    const base = { platform: activePlatform };
    if (activePlatform === 'gemini') return { ...base, apiKey: 'env-key', model: geminiModel };
    if (activePlatform === 'openai') return { ...base, apiKey: openaiApiKey, model: openaiModel };
    if (activePlatform === 'anthropic') return { ...base, apiKey: anthropicApiKey, model: anthropicModel };
    if (activePlatform === 'siliconflow') return { ...base, apiKey: siliconFlowApiKey, model: siliconFlowModel };
    if (activePlatform === 'deepseek') return { ...base, apiKey: deepseekApiKey, model: deepseekModel };
    if (activePlatform === 'groq') return { ...base, apiKey: groqApiKey, model: groqModel };
    if (activePlatform === 'mistral') return { ...base, apiKey: mistralApiKey, model: mistralModel };
    if (activePlatform === 'perplexity') return { ...base, apiKey: perplexityApiKey, model: perplexityModel };
    if (activePlatform === 'together') return { ...base, apiKey: togetherApiKey, model: togetherModel };
    if (activePlatform === 'custom') return { ...base, apiKey: customApiKey, model: customModel, extra: { baseURL: customBaseURL } };
    return { ...base, apiKey: '', model: '' };
  }, [activePlatform, geminiModel, openaiApiKey, openaiModel, anthropicApiKey, anthropicModel, siliconFlowApiKey, siliconFlowModel, deepseekApiKey, deepseekModel, groqApiKey, groqModel, mistralApiKey, mistralModel, perplexityApiKey, perplexityModel, togetherApiKey, togetherModel, customApiKey, customModel, customBaseURL]);

  const [mainView, setMainView] = useState<'editor' | 'preview' | 'projects' | 'settings'>('editor');
  const [mobileView, setMobileView] = useState<'editor' | 'chat' | 'preview' | 'projects' | 'settings'>('editor');
  const [showProjectNaming, setShowProjectNaming] = useState(false);
  const [pendingProjectName, setPendingProjectName] = useState('');
  const [pendingUserMessage, setPendingUserMessage] = useState('');
  const [pendingUserAttachments, setPendingUserAttachments] = useState<Attachment[]>([]);
  const [editingAttachment, setEditingAttachment] = useState<{ attachment: Attachment, index?: number, isPending: boolean } | null>(null);
  const [pendingUserAttachmentsForAI, setPendingUserAttachmentsForAI] = useState<Attachment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeActionsId, setActiveActionsId] = useState<string | null>(null);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [editorThemeName, setEditorThemeName] = useState('Deep Night');
  const [editorFontSize, setEditorFontSize] = useState(13);
  const [editorFontFamily, setEditorFontFamily] = useState('"JetBrains Mono", monospace');
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [openFiles, setOpenFiles] = useState<string[]>(['index.html']);
  const [appThemeName, setAppThemeName] = useState('VS Code Dark');
  const [iconThemeName, setIconThemeName] = useState('VS code');
  const [markers, setMarkers] = useState<EditorMarker[]>([]);
  const [auditResults, setAuditResults] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'laptop' | 'desktop'>('desktop');
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);

  const [files, setFiles] = useState<Record<string, { code: string, language: string }>>({
    'index.html': {
      code: getInitialCode('User'),
      language: 'html'
    }
  });
  const [previewFiles, setPreviewFiles] = useState<Record<string, { code: string, language: string }>>(files);
  const [activeFile, setActiveFile] = useState('index.html');
  const [activeFileSecondary, setActiveFileSecondary] = useState<string | null>(null);
  const [editorPanes, setEditorPanes] = useState<string[]>(['index.html']);
  const [paneWidths, setPaneWidths] = useState<number[]>([100]);
  const [isResizingPane, setIsResizingPane] = useState<number | null>(null);

  useEffect(() => {
    // Sync pane widths when panes are added/removed
    if (editorPanes.length !== paneWidths.length) {
      const equalWidth = 100 / editorPanes.length;
      setPaneWidths(new Array(editorPanes.length).fill(equalWidth));
    }
  }, [editorPanes.length]);

  const startResizingPane = (index: number) => {
    setIsResizingPane(index);
  };

  const stopResizingPane = () => {
    setIsResizingPane(null);
  };

  const handlePaneResize = useCallback((e: MouseEvent | TouchEvent) => {
    if (isResizingPane === null) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const container = document.getElementById('main-editor-container');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const totalWidth = rect.width;
    const percentage = (x / totalWidth) * 100;

    setPaneWidths(prev => {
      const next = [...prev];
      const i = isResizingPane;
      
      // Calculate current cumulative percentage up to the pane before the handle
      let leftCumulative = 0;
      for (let j = 0; j < i; j++) leftCumulative += next[j];
      
      const minWidth = 10; // 10% minimum width
      const delta = percentage - (leftCumulative + next[i]);
      
      if (next[i] + delta > minWidth && next[i+1] - delta > minWidth) {
        next[i] += delta;
        next[i+1] -= delta;
      }
      
      return next;
    });
  }, [isResizingPane]);

  useEffect(() => {
    if (isResizingPane !== null) {
      window.addEventListener('mousemove', handlePaneResize);
      window.addEventListener('mouseup', stopResizingPane);
      window.addEventListener('touchmove', handlePaneResize);
      window.addEventListener('touchend', stopResizingPane);
      return () => {
        window.removeEventListener('mousemove', handlePaneResize);
        window.removeEventListener('mouseup', stopResizingPane);
        window.removeEventListener('touchmove', handlePaneResize);
        window.removeEventListener('touchend', stopResizingPane);
      };
    }
  }, [isResizingPane, handlePaneResize]);

  const [focusedPaneIndex, setFocusedPaneIndex] = useState(0);
  const [focusedPane, setFocusedPane] = useState<'left' | 'right'>('left');
  const [editorSplit, setEditorSplit] = useState(false);
  const [editorSplitRatio, setEditorSplitRatio] = useState(50);
  const [isResizingEditorSplit, setIsResizingEditorSplit] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isExplorerCreateMenuOpen, setIsExplorerCreateMenuOpen] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameOldName, setRenameOldName] = useState('');
  const [renameNewName, setRenameNewName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [activeFileMenu, setActiveFileMenu] = useState<string | null>(null);
  const fileHandles = useRef<Record<string, any>>({});
  const [copied, setCopied] = useState(false);

  // Persistence Effects
  useEffect(() => {
    if (isDbLoaded && userName) idbSet('reversx_userName', userName);
  }, [userName, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_messages', messages);
  }, [messages, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_siliconflow_key', siliconFlowApiKey);
  }, [siliconFlowApiKey, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_siliconflow_model', siliconFlowModel);
  }, [siliconFlowModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_deepseek_key', deepseekApiKey);
  }, [deepseekApiKey, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_deepseek_model', deepseekModel);
  }, [deepseekModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_anthropic_key', anthropicApiKey);
  }, [anthropicApiKey, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_anthropic_model', anthropicModel);
  }, [anthropicModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_openai_key', openaiApiKey);
  }, [openaiApiKey, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_openai_model', openaiModel);
  }, [openaiModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_groq_key', groqApiKey);
  }, [groqApiKey, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_groq_model', groqModel);
  }, [groqModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_mistral_key', mistralApiKey);
  }, [mistralApiKey, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_mistral_model', mistralModel);
  }, [mistralModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_perplexity_key', perplexityApiKey);
  }, [perplexityApiKey, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_perplexity_model', perplexityModel);
  }, [perplexityModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_together_key', togetherApiKey);
  }, [togetherApiKey, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_together_model', togetherModel);
  }, [togetherModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_custom_key', customApiKey);
  }, [customApiKey, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_custom_model', customModel);
  }, [customModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_custom_baseurl', customBaseURL);
  }, [customBaseURL, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_gemini_model', geminiModel);
  }, [geminiModel, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_active_platform', activePlatform);
  }, [activePlatform, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_active_tab', activeTab);
  }, [activeTab, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_github_token', githubToken);
  }, [githubToken, isDbLoaded]);

  useEffect(() => {
    if (activeFile && files[activeFile]) {
      const newMarkers = checkErrors(files[activeFile].code, files[activeFile].language);
      setMarkers(newMarkers);
    }
  }, [files, activeFile]);

  const handleAudit = useCallback(async (type: 'bugs' | 'security' | 'performance') => {
    if (!activeFile || !files[activeFile] || isLoading) return;
    
    setIsLoading(true);
    setAuditResults(null);

    const code = files[activeFile].code;
    const lang = files[activeFile].language;
    
    let sysPrompt = "";
    if (type === 'bugs') {
      sysPrompt = "You are a World-Class Bug Hunter. Analyze the following code specifically for logical errors, edge cases, and runtime bugs. List the issues found and provide fixes. Speak in Bengali if possible for the descriptions.";
    } else if (type === 'security') {
      sysPrompt = "You are a Cyber-Security Expert. Perform a deep security audit on this code. Look for XSS, SQL injection, insecure storage, and sensitive data leaks. Provide clear warnings and solutions. Use Bengali for explanations.";
    } else {
      sysPrompt = "You are a Performance Engineer. Analyze this code for performance bottlenecks, memory leaks, and inefficient algorithms. Provide optimization tips. Use Bengali for explanations.";
    }

    const prompt = `${sysPrompt}\n\nCode Preview:\n\`\`\`${lang}\n${code}\n\`\`\``;
    
    try {
      const { apiKey: currentApiKey, model: currentModel, extra } = getPlatformConfig();
      const res = await chatWithAI(prompt, [], currentApiKey, currentModel, activePlatform, [], extra);
      setAuditResults(res);
      
      // Update sidebar messages if we want it in chat too (optional), but here we show it in audit tab
    } catch (error) {
      console.error("Audit failed", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeFile, files, isLoading, activePlatform, siliconFlowApiKey, siliconFlowModel, deepseekApiKey, deepseekModel]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_editor_theme', editorThemeName);
  }, [editorThemeName, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_editor_font_size', editorFontSize.toString());
  }, [editorFontSize, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_editor_font_family', editorFontFamily);
  }, [editorFontFamily, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_split_screen', isSplitScreen.toString());
  }, [isSplitScreen, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_open_files', openFiles);
  }, [openFiles, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_app_theme', appThemeName);
  }, [appThemeName, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_icon_theme', iconThemeName);
  }, [iconThemeName, isDbLoaded]);
  
  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_projects', projects);
  }, [projects, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) {
      if (activeProjectId) {
        idbSet('reversx_active_project_id', activeProjectId);
      } else {
        idbDel('reversx_active_project_id');
      }
    }
  }, [activeProjectId, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_files', files);
  }, [files, isDbLoaded]);

  useEffect(() => {
    if (isDbLoaded) idbSet('reversx_active_file', activeFile);
  }, [activeFile, isDbLoaded]);

  // Initial Data Load
  useEffect(() => {
    const loadState = async () => {
      try {
        const checkAndMigrate = async (key: string, parse = false, defaultVal: any = null) => {
          let val = await idbGet(key);
          if (val === undefined) {
            const lsVal = localStorage.getItem(key);
            if (lsVal !== null) {
              val = parse ? JSON.parse(lsVal) : lsVal;
              await idbSet(key, val); 
            } else {
              val = defaultVal;
            }
          } else if (parse && typeof val === 'string') {
            try {
              // Automatically recover stringified data mistakenly saved as strings back into objects
              val = JSON.parse(val);
              await idbSet(key, val); // update it back correctly
            } catch (e) {
              console.warn(`Could not parse ${key} from string fallback: `, val);
            }
          }
          return val;
        };

        const dbUserName = await checkAndMigrate('reversx_userName', false, null);
        setUserName(dbUserName);
        setShowNamePrompt(!dbUserName);

        const loadedMessages = await checkAndMigrate('reversx_messages', true, []);
        if (loadedMessages.length > 0) setMessages(loadedMessages);

        const loadedProjects = await checkAndMigrate('reversx_projects', true, []);
        if (loadedProjects.length > 0) setProjects(loadedProjects);

        setActiveProjectId(await checkAndMigrate('reversx_active_project_id', false, null));
        setActiveTab(await checkAndMigrate('reversx_active_tab', false, 'chat'));
        setSiliconFlowApiKey(await checkAndMigrate('reversx_siliconflow_key', false, ''));
        setSiliconFlowModel(await checkAndMigrate('reversx_siliconflow_model', false, ''));
        setDeepseekApiKey(await checkAndMigrate('reversx_deepseek_key', false, ''));
        setDeepseekModel(await checkAndMigrate('reversx_deepseek_model', false, ''));
        setAnthropicApiKey(await checkAndMigrate('reversx_anthropic_key', false, ''));
        setAnthropicModel(await checkAndMigrate('reversx_anthropic_model', false, ''));
        setOpenaiApiKey(await checkAndMigrate('reversx_openai_key', false, ''));
        setOpenaiModel(await checkAndMigrate('reversx_openai_model', false, ''));
        setGroqApiKey(await checkAndMigrate('reversx_groq_key', false, ''));
        setGroqModel(await checkAndMigrate('reversx_groq_model', false, ''));
        setMistralApiKey(await checkAndMigrate('reversx_mistral_key', false, ''));
        setMistralModel(await checkAndMigrate('reversx_mistral_model', false, ''));
        setPerplexityApiKey(await checkAndMigrate('reversx_perplexity_key', false, ''));
        setPerplexityModel(await checkAndMigrate('reversx_perplexity_model', false, ''));
        setTogetherApiKey(await checkAndMigrate('reversx_together_key', false, ''));
        setTogetherModel(await checkAndMigrate('reversx_together_model', false, ''));
        setCustomApiKey(await checkAndMigrate('reversx_custom_key', false, ''));
        setCustomModel(await checkAndMigrate('reversx_custom_model', false, ''));
        setCustomBaseURL(await checkAndMigrate('reversx_custom_baseurl', false, ''));
        setGeminiModel(await checkAndMigrate('reversx_gemini_model', false, 'gemini-2.0-flash'));
        setActivePlatform(await checkAndMigrate('reversx_active_platform', false, 'gemini'));
        setGithubToken(await checkAndMigrate('reversx_github_token', false, ''));
        
        setEditorThemeName(await checkAndMigrate('reversx_editor_theme', false, 'Deep Night'));
        setEditorFontSize(Number(await checkAndMigrate('reversx_editor_font_size', false, 13)));
        setEditorFontFamily(await checkAndMigrate('reversx_editor_font_family', false, '"JetBrains Mono", monospace'));
        
        const splitVal = await checkAndMigrate('reversx_split_screen', false, 'false');
        setIsSplitScreen(splitVal === 'true' || splitVal === true);
        
        const defaultFiles = {
          'index.html': { code: getInitialCode('User'), language: 'html' }
        };
        const loadedFiles = await checkAndMigrate('reversx_files', true, defaultFiles);
        setFiles(loadedFiles);
        setPreviewFiles(loadedFiles);
        setActiveFile(await checkAndMigrate('reversx_active_file', false, 'index.html'));
        setOpenFiles(await checkAndMigrate('reversx_open_files', true, ['index.html']));
        setAppThemeName(await checkAndMigrate('reversx_app_theme', false, 'VS Code Dark'));
        setIconThemeName(await checkAndMigrate('reversx_icon_theme', false, 'VS code'));

        setIsDbLoaded(true);
      } catch (err) {
        console.error("Failed to load from IndexedDB", err);
        setIsDbLoaded(true);
      }
    };
    loadState();
  }, []);

  const currentEditorTheme = React.useMemo(() => THEMES[editorThemeName] || THEMES['VS Code Dark+'], [editorThemeName]);
  const currentAppTheme = React.useMemo(() => APP_THEMES[appThemeName] || APP_THEMES['VS Code Dark'], [appThemeName]);
  const currentIconTheme = React.useMemo(() => {
    const theme = ICON_THEMES[iconThemeName] || ICON_THEMES['VS code'];
    return { ...ICON_THEMES['VS code'], ...theme };
  }, [iconThemeName]);

  const { 
    MessageSquare, Code, Settings, Files, Play, ChevronRight, ChevronLeft, ChevronDown, 
    Send, User, Terminal, Plus, Copy, Check, Trash2, Edit3, Undo2, Redo2, 
    ClipboardPaste, Save, RefreshCw, Maximize2, FolderOpen, ArrowUp, Wand2, 
    Sparkles, Hash, Bug, FileText, Loader2, Users, Paperclip, HelpCircle, ImageIcon, FileCode, 
    FileJson, File, ChevronDownIcon, ChevronRightIcon, MoreVertical, SearchCode, CheckCircle2,
    Bell, GitBranch, Key, Edit, Palette, Search
  } = currentIconTheme;
  
  const combinedHtml = React.useMemo(() => {
    const htmlFile = previewFiles['index.html'] || Object.values(previewFiles).find(f => f.language === 'html');
    if (!htmlFile) {
      const activeF = previewFiles[activeFile];
      if (!activeF) return '';
      let code = activeF.code;
      if (activeFile.endsWith('.ts') || activeFile.endsWith('.tsx')) {
        try {
          // Automatic Bare Import Resolution to CDN (esm.sh)
          const rewrittenCode = activeF.code.replace(
            /(from\s+['"]|import\s+['"])(?!\.|\/|https?:\/\/)([^'"]+)(['"])/g,
            `$1https://esm.sh/$2$3`
          );
          const transpiled = transform(rewrittenCode, { transforms: ['typescript', 'jsx'] }).code;
          code = `<!DOCTYPE html><html><head>
          <style>body { background: #0d0d0d; color: #e0e0e0; font-family: sans-serif; }</style>
          </head><body><script type="module">
          try {
            ${transpiled}
          } catch(e) {
            console.error('Runtime Error:', e);
            const errDiv = document.createElement('div');
            errDiv.style.color = '#f48771';
            errDiv.style.padding = '20px';
            errDiv.style.background = '#1e1e1e';
            errDiv.style.border = '1px solid #f48771';
            errDiv.style.borderRadius = '8px';
            errDiv.style.margin = '20px';
            errDiv.innerHTML = '<strong>Runtime Error:</strong><br>' + e.message;
            document.body.appendChild(errDiv);
          }
          </script></body></html>`;
        } catch (e: any) {
          return `<!DOCTYPE html><html><body><pre style="color:red;padding:20px;">Compilation Error: ${e.message}</pre></body></html>`;
        }
      }
      return code;
    }

    let combined = htmlFile.code;
    
    // Error Overlay Script
    const errorOverlayScript = `
    <script id="reversx-error-overlay">
      window.onerror = function(message, source, lineno, colno, error) {
        showError(message, source, lineno, colno, error);
        return false;
      };
      window.addEventListener('unhandledrejection', function(event) {
        showError(event.reason, 'Promise', '', '', event.reason);
      });
      function showError(msg, source, line, col, error) {
        const existing = document.getElementById('reversx-error-container');
        if (existing) existing.remove();

        const div = document.createElement('div');
        div.id = 'reversx-error-container';
        div.style.position = 'fixed';
        div.style.bottom = '20px';
        div.style.left = '20px';
        div.style.right = '20px';
        div.style.background = '#1e1e1e';
        div.style.color = '#f48771';
        div.style.padding = '20px';
        div.style.borderRadius = '8px';
        div.style.fontSize = '13px';
        div.style.fontFamily = "'Fira Code', 'JetBrains Mono', monospace";
        div.style.zIndex = '999999';
        div.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        div.style.border = '1px solid #f48771';
        div.style.maxHeight = '80vh';
        div.style.overflowY = 'auto';
        
        let stack = error && error.stack ? error.stack : '';
        let cleanSource = source ? source.split('/').pop() : 'unknown';

        div.innerHTML = \`
          <div style="display:flex; justify-content:between; align-items:start; margin-bottom:10px;">
            <div style="flex:1">
              <strong style="font-size:15px; color:#f44336;">Runtime Error Found</strong>
              <div style="margin-top:8px; color:#fff; font-weight:bold;">\${msg}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer; padding:0 5px;">&times;</button>
          </div>
          <div style="background:#252526; padding:12px; border-radius:4px; margin-top:10px; border-left:3px solid #f48771;">
            <div style="color:#858585; margin-bottom:5px;">Location:</div>
            <div style="color:#61afef;">\${cleanSource}\${line ? ':' + line : ''}\${col ? ':' + col : ''}</div>
            \${stack ? \`<div style="color:#858585; margin-top:10px; margin-bottom:5px;">Stack Trace:</div><pre style="margin:0; white-space:pre-wrap; font-size:11px; color:#abb2bf; opacity:0.8;">\${stack}</pre>\` : ''}
          </div>
          <div style="margin-top:15px; font-size:11px; color:#858585;">
            Tip: Check the line number in your code editor to fix this issue.
          </div>
        \`;
        document.body.appendChild(div);
      }
    </script>`;

    // Get image files
    const imageFiles = Object.entries(previewFiles).filter(([name, f]) => 
      f.language === 'image' || name.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i)
    );

    // Replace images in HTML
    imageFiles.forEach(([imgName, imgF]) => {
      combined = combined.split(`"${imgName}"`).join(`"${imgF.code}"`)
                         .split(`'${imgName}'`).join(`'${imgF.code}'`)
                         .split(`"./${imgName}"`).join(`"${imgF.code}"`)
                         .split(`'./${imgName}'`).join(`'${imgF.code}'`);
    });

    // Inject all CSS files
    const cssFiles = Object.entries(previewFiles).filter(([name, f]) => name.endsWith('.css'));
    let cssContent = '';
    cssFiles.forEach(([name, f]) => {
      let code = f.code;
      // Replace images in CSS
      imageFiles.forEach(([imgName, imgF]) => {
        code = code.split(`"${imgName}"`).join(`"${imgF.code}"`)
                   .split(`'${imgName}'`).join(`'${imgF.code}'`)
                   .split(` url(${imgName})`).join(` url(${imgF.code})`)
                   .split(` url("${imgName}")`).join(` url("${imgF.code}")`)
                   .split(` url('${imgName}')`).join(` url('${imgF.code}')`);
      });
      cssContent += `\n/* --- ${name} --- */\n${code}\n`;
    });

    if (cssContent) {
      const styleTag = `<style id="reversx-injected-styles">${cssContent}</style>`;
      if (combined.includes('</head>')) {
        combined = combined.replace('</head>', `${styleTag}</head>`);
      } else if (combined.includes('<head>')) {
        combined = combined.replace('<head>', `<head>${styleTag}`);
      } else {
        combined = `<head>${styleTag}</head>` + combined;
      }
    }

    // Inject Error Overlay
    if (combined.includes('</head>')) {
      combined = combined.replace('</head>', `${errorOverlayScript}</head>`);
    } else {
      combined = errorOverlayScript + combined;
    }

    // Inject all JS files
    const jsFiles = Object.entries(previewFiles).filter(([name, f]) => name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.tsx'));
    
    // Generate Import Map for ES Modules
    const importMap: Record<string, string> = {};
    jsFiles.forEach(([name, f]) => {
      let code = f.code;
      if (name.endsWith('.ts') || name.endsWith('.tsx')) {
        try {
          // Bare import resolution for CDN
          const rewrittenCode = f.code.replace(
            /(from\s+['"]|import\s+['"])(?!\.|\/|https?:\/\/)([^'"]+)(['"])/g,
            `$1https://esm.sh/$2$3`
          );
          code = transform(rewrittenCode, { transforms: ['typescript', 'jsx'] }).code;
        } catch (e: any) {
          code = `console.error('Compilation Error in ${name}:', ${JSON.stringify(e.message)});`;
        }
      } else {
        // Even for JS, resolve bare imports
        code = f.code.replace(
          /(from\s+['"]|import\s+['"])(?!\.|\/|https?:\/\/)([^'"]+)(['"])/g,
          `$1https://esm.sh/$2$3`
        );
      }
      
      const blob = new Blob([code], { type: 'text/javascript' });
      importMap[`./${name}`] = URL.createObjectURL(blob);
      importMap[name] = importMap[`./${name}`];
    });

    const importMapScript = `<script type="importmap">${JSON.stringify({ imports: importMap })}</script>`;
    
    if (combined.includes('</head>')) {
      combined = combined.replace('</head>', `${importMapScript}</head>`);
    } else {
      combined = importMapScript + combined;
    }

    // Find entry point or inject scripts
    let jsContent = '';
    jsFiles.forEach(([name, f]) => {
      // We only auto-inject scripts if they are NOT modules intended to be imported
      // or if they are traditionally used entry points
      if (name === 'index.js' || name === 'main.js' || name === 'script.js' || name === 'App.tsx' || name === 'main.tsx') {
        jsContent += `\nimport './${name}';\n`;
      }
    });

    if (jsContent) {
      const scriptTag = `<script type="module" id="reversx-injected-scripts">${jsContent}</script>`;
      if (combined.includes('</body>')) {
        combined = combined.replace('</body>', `${scriptTag}</body>`);
      } else if (combined.includes('</html>')) {
        combined = combined.replace('</html>', `${scriptTag}</html>`);
      } else {
        combined = combined + scriptTag;
      }
    }

    return combined;
  }, [previewFiles, activeFile]);

  const activeProject = React.useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);

  // Static placeholder
  const placeholderText = "Ask ReversX";

  // Optimized Sidebar Resizing with CSS Variables
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [explorerWidth, setExplorerWidth] = useState(260);
  const [isResizingExplorer, setIsResizingExplorer] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  // ReversX v1 Agent States
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [showAgentQuestions, setShowAgentQuestions] = useState(false);
  const [agentQuestions, setAgentQuestions] = useState<{question: string, options: string[]}[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [currentAgentPrompt, setCurrentAgentPrompt] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // If within 100px of the bottom, consider it scrolled to bottom
      shouldAutoScroll.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (chatEndRef.current && (force || shouldAutoScroll.current)) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const isSyncingRef = useRef(true);

  useEffect(() => {
    if (activeProjectId && !isSyncingRef.current && !isLoading) {
      setProjects(prev => {
        const projectIndex = prev.findIndex(p => p.id === activeProjectId);
        if (projectIndex === -1) return prev;
        
        const project = prev[projectIndex];
        // Only update if something actually changed to avoid infinite loops
        if (
          project.messages === messages && 
          project.files === files && 
          project.openFiles === openFiles && 
          project.activeFile === activeFile
        ) {
          return prev;
        }

        const updatedProjects = [...prev];
        updatedProjects[projectIndex] = {
          ...project,
          messages,
          files,
          openFiles,
          activeFile
        };
        return updatedProjects;
      });
    }
  }, [messages, files, openFiles, activeFile, activeProjectId, isLoading]);

  useEffect(() => {
    // Reset syncing flag after states have likely updated
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
    }
  }, [messages, files, activeFile, activeProjectId]);

  useEffect(() => {
    db.setItem('reversx_editor_font_size', editorFontSize);
  }, [editorFontSize]);

  useEffect(() => {
    db.setItem('reversx_editor_font_family', editorFontFamily);
  }, [editorFontFamily]);

  useEffect(() => {
    db.setItem('reversx_open_files', openFiles);
  }, [openFiles]);

  useEffect(() => {
    db.setItem('reversx_split_screen', isSplitScreen);
  }, [isSplitScreen]);

  const handleSplit = useCallback(() => {
    if (editorPanes.length < 4) {
      const currentFile = editorPanes[focusedPaneIndex] || 'index.html';
      setEditorPanes(prev => [...prev, currentFile]);
      setFocusedPaneIndex(editorPanes.length);
    }
  }, [editorPanes, focusedPaneIndex]);

  const handleClosePane = useCallback((index: number) => {
    if (editorPanes.length > 1) {
      setEditorPanes(prev => {
        const next = [...prev];
        next.splice(index, 1);
        return next;
      });
      setFocusedPaneIndex(prev => Math.max(0, prev >= index ? prev - 1 : prev));
    }
  }, [editorPanes]);

  const setPaneFile = useCallback((index: number, fileName: string) => {
    setEditorPanes(prev => {
      const next = [...prev];
      next[index] = fileName;
      return next;
    });
    setFocusedPaneIndex(index);
    setActiveFile(fileName);
  }, []);

  const handleFileOpen = useCallback((name: string) => {
    setOpenFiles(prev => {
      if (prev.includes(name)) return prev;
      const newTabs = [...prev, name];
      if (newTabs.length > 10) { // Increased tab limit slightly if needed
        return newTabs.slice(-10);
      }
      return newTabs;
    });
    setPaneFile(focusedPaneIndex, name);
  }, [focusedPaneIndex, setPaneFile]);

  const handleFileClose = useCallback((name: string) => {
    setOpenFiles(prev => {
      if (prev.length <= 1 && prev[0] === name) return prev;
      const next = prev.filter(f => f !== name);
      
      // Update panes if closing a file that is active in some pane
      setEditorPanes(pPanes => pPanes.map(p => p === name ? (next[next.length - 1] || 'index.html') : p));
      
      if (activeFile === name) {
        setActiveFile(next[next.length - 1] || 'index.html');
      }
      return next;
    });
  }, [activeFile]);
  useEffect(() => {
    if (projects.length > 0) {
      const timeoutId = setTimeout(() => {
        db.setItem('reversx_projects', projects);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [projects]);

  useEffect(() => {
    const loadData = async () => {
      // ... existing loads ...
      const savedFontSize = await db.getItem('reversx_editor_font_size');
      if (savedFontSize) setEditorFontSize(Number(savedFontSize));

      const savedFontFamily = await db.getItem('reversx_editor_font_family');
      if (savedFontFamily) setEditorFontFamily(savedFontFamily);

      const savedOpenFiles = await db.getItem('reversx_open_files');
      if (savedOpenFiles) setOpenFiles(savedOpenFiles);

      const savedSplit = await db.getItem('reversx_split_screen');
      if (savedSplit !== null) setIsSplitScreen(!!savedSplit);
      const savedName = await db.getItem('reversx_user');
      if (savedName) {
        setUserName(savedName);
        setShowNamePrompt(false);
        // Update initial files with the correct name if no projects exist yet
        setFiles({
          'index.html': {
            code: getInitialCode(savedName),
            language: 'html'
          }
        });
        setPreviewFiles({
          'index.html': {
            code: getInitialCode(savedName),
            language: 'html'
          }
        });
      }

      const savedApiKey = await db.getItem('reversx_siliconflow_api_key');
      if (savedApiKey) setSiliconFlowApiKey(savedApiKey);

      const savedModel = await db.getItem('reversx_siliconflow_model');
      if (savedModel) setSiliconFlowModel(savedModel);

      const savedEditorTheme = await db.getItem('reversx_editor_theme');
      if (savedEditorTheme) setEditorThemeName(savedEditorTheme);

      const savedAppTheme = await db.getItem('reversx_app_theme');
      if (savedAppTheme) setAppThemeName(savedAppTheme);

      const savedIconTheme = await db.getItem('reversx_icon_theme');
      if (savedIconTheme) setIconThemeName(savedIconTheme);

      const savedTab = await db.getItem('reversx_active_tab');
      if (savedTab) {
        setActiveTab(savedTab as any);
      }

      const savedMobileView = await db.getItem('reversx_mobile_view');
      if (savedMobileView) {
        setMobileView(savedMobileView as any);
      }

      const savedProjects = await db.getItem('reversx_projects');
      if (savedProjects && savedProjects.length > 0) {
        isSyncingRef.current = true;
        setProjects(savedProjects);
        const last = savedProjects[0];
        setActiveProjectId(last.id);
        
        // Force update greeting if it's an unmodified New Project
        let projectFiles = last.files;
        if (last.name === 'New Project' || last.name === 'My First Project') {
          const indexHtml = projectFiles['index.html']?.code || '';
          if (indexHtml.includes('ReversX AI') || indexHtml.includes('glitch') || indexHtml.includes('New Project Started')) {
            const newCode = getInitialCode(savedName || 'User');
            projectFiles = {
              ...projectFiles,
              'index.html': { code: newCode, language: 'html' }
            };
          }
        }

        // Filter out old welcome messages to show new branding
        const filteredMessages = last.messages.filter((m: any) => m.content !== "What do you want to build?");
        setMessages(filteredMessages);
        setFiles(projectFiles);
        setPreviewFiles(projectFiles);
        if (last.openFiles && last.openFiles.length > 0) {
          setOpenFiles(last.openFiles.slice(0, 4));
        } else {
          setOpenFiles(Object.keys(projectFiles).slice(0, 4));
        }
        setActiveFile(last.activeFile);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    db.setItem('reversx_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    db.setItem('reversx_mobile_view', mobileView);
  }, [mobileView]);

  useEffect(() => {
    if (userName) {
      db.setItem('reversx_user', userName);
    }
  }, [userName]);

  useEffect(() => {
    db.setItem('reversx_siliconflow_api_key', siliconFlowApiKey);
  }, [siliconFlowApiKey]);

  useEffect(() => {
    db.setItem('reversx_siliconflow_model', siliconFlowModel);
  }, [siliconFlowModel]);

  useEffect(() => {
    db.setItem('reversx_editor_theme', editorThemeName);
  }, [editorThemeName]);

  useEffect(() => {
    db.setItem('reversx_app_theme', appThemeName);
    
    // Apply app theme variables
    const theme = APP_THEMES[appThemeName] || APP_THEMES['Default Dark'];
    const root = document.documentElement;
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-foreground', theme.foreground);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-foreground', theme.accentForeground || '#ffffff');
    root.style.setProperty('--color-sidebar', theme.sidebar);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-foreground-muted', theme.muted);
    root.style.setProperty('--color-foreground-subtle', theme.subtle);
  }, [appThemeName]);

  useEffect(() => {
    db.setItem('reversx_icon_theme', iconThemeName);
  }, [iconThemeName]);


  const resize = useCallback((e: MouseEvent | TouchEvent) => {
    if (isResizing) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const newWidth = clientX - 56;
      const minWidth = 200;
      const maxWidth = window.innerWidth * 0.8;
      
      if (newWidth > minWidth && newWidth < maxWidth) {
        setSidebarWidth(newWidth);
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
      }
    }
  }, [isResizing]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = 'default';
  }, []);

  const startResizing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Check if it's a touch event and prevent default only if needed
    if (e.type === 'touchstart') {
      // Don't prevent default to allow scrolling if user is not on handle
    } else {
      e.preventDefault();
    }
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  }, []);

  const resizeExplorer = useCallback((e: MouseEvent | TouchEvent) => {
    if (isResizingExplorer) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      // clientX - total offset from left (activity bar + sidebar)
      const offset = 56 + (isSidebarMinimized ? 0 : sidebarWidth);
      const newWidth = clientX - offset;
      const minWidth = 150;
      const maxWidth = 500;
      
      if (newWidth > minWidth && newWidth < maxWidth) {
        setExplorerWidth(newWidth);
      }
    }
  }, [isResizingExplorer, isSidebarMinimized, sidebarWidth]);

  const resizeEditorSplit = useCallback((e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const container = document.getElementById('main-editor-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const ratio = (relativeX / rect.width) * 100;
      setEditorSplitRatio(Math.max(10, Math.min(90, ratio)));
    }
  }, []);

  const stopResizingEditorSplit = useCallback(() => {
    setIsResizingEditorSplit(false);
    document.body.style.cursor = 'default';
  }, []);

  const startResizingEditorSplit = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.type !== 'touchstart') {
      e.preventDefault();
    }
    setIsResizingEditorSplit(true);
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizingExplorer = useCallback(() => {
    setIsResizingExplorer(false);
    document.body.style.cursor = 'default';
  }, []);

  const startResizingExplorer = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.type !== 'touchstart') {
      e.preventDefault();
    }
    setIsResizingExplorer(true);
    document.body.style.cursor = 'col-resize';
  }, []);

  useEffect(() => {
    const handleWindowMove = (e: MouseEvent | TouchEvent) => {
      if (isResizing) resize(e);
      if (isResizingExplorer) resizeExplorer(e);
      if (isResizingEditorSplit) resizeEditorSplit(e);
    };

    const handleWindowEnd = () => {
      if (isResizing) stopResizing();
      if (isResizingExplorer) stopResizingExplorer();
      if (isResizingEditorSplit) stopResizingEditorSplit();
    };

    if (isResizing || isResizingExplorer || isResizingEditorSplit) {
      window.addEventListener('mousemove', handleWindowMove);
      window.addEventListener('mouseup', handleWindowEnd);
      window.addEventListener('touchmove', handleWindowMove, { passive: false });
      window.addEventListener('touchend', handleWindowEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMove);
      window.removeEventListener('mouseup', handleWindowEnd);
      window.removeEventListener('touchmove', handleWindowMove);
      window.removeEventListener('touchend', handleWindowEnd);
    };
  }, [isResizing, isResizingExplorer, isResizingEditorSplit, resize, resizeExplorer, resizeEditorSplit, stopResizing, stopResizingExplorer, stopResizingEditorSplit]);

  const handleNameSubmit = useCallback(() => {
    if (!tempName.trim()) return;
    const name = tempName.trim();
    setUserName(name);
    setShowNamePrompt(false);
    
    if (projects.length === 0) {
      isSyncingRef.current = true;
      const initialCode = getInitialCode(name);
      const newProject: Project = {
        id: generateId(),
        name: 'My First Project',
        messages: [],
        files: {
          'index.html': {
            code: initialCode,
            language: 'html'
          }
        },
        activeFile: 'index.html',
        createdAt: Date.now()
      };
      
      setProjects([newProject]);
      setActiveProjectId(newProject.id);
      setMessages([]);
      setFiles(newProject.files);
      setPreviewFiles(newProject.files);
      setOpenFiles(['index.html']);
      setActiveFile('index.html');
    }
  }, [tempName, projects.length]);

  const createNewProject = useCallback(() => {
    isSyncingRef.current = true;
    const initialCode = getInitialCode(userName || 'User');
    const newProject: Project = {
      id: generateId(),
      name: `Project ${projects.length + 1}`,
      messages: [],
      files: {
        'index.html': {
          code: initialCode,
          language: 'html'
        }
      },
      activeFile: 'index.html',
      createdAt: Date.now()
    };
    setProjects(prev => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setMessages([]);
    setFiles(newProject.files);
    setPreviewFiles(newProject.files);
    setOpenFiles(['index.html']);
    setActiveFile('index.html');
    setActiveTab('chat');
  }, [userName]);

  const switchProject = useCallback((id: string) => {
    if (id === activeProjectId) {
      // Don't reset tab if already active
      return;
    }

    const targetProject = projects.find(p => p.id === id);
    if (targetProject) {
      isSyncingRef.current = true;
      setActiveProjectId(id);
      // Filter out old welcome messages to show new branding
      const filteredMessages = targetProject.messages.filter(m => m.content !== "What do you want to build?");
      setMessages(filteredMessages);
      setFiles(targetProject.files);
      setPreviewFiles(targetProject.files);
      if (targetProject.openFiles && targetProject.openFiles.length > 0) {
        setOpenFiles(targetProject.openFiles);
      } else {
        setOpenFiles(Object.keys(targetProject.files));
      }
      setActiveFile(targetProject.activeFile);
      setActiveTab('chat');
      setMobileView('chat');
    }
  }, [activeProjectId, projects]);

  const [projectToDeleteId, setProjectToDeleteId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const deleteProject = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (projects.length <= 1) return;
    
    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);
    
    if (activeProjectId === id) {
      isSyncingRef.current = true;
      const next = newProjects[0];
      setActiveProjectId(next.id);
      setMessages(next.messages);
      setFiles(next.files);
      setPreviewFiles(next.files);
      setOpenFiles([next.activeFile]);
      setActiveFile(next.activeFile);
      setActiveTab('chat');
      setMobileView('chat');
    }
    setProjectToDeleteId(null);
    setDeleteConfirmName('');
  }, [projects, activeProjectId]);

  const startRenaming = useCallback((e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditNameValue(project.name);
  }, []);

  const saveRename = useCallback((e: React.FormEvent | React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editNameValue.trim()) return;
    
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: editNameValue.trim() } : p));
    setEditingProjectId(null);
  }, [editNameValue]);

  const handleHoldStart = useCallback((id: string) => {
    holdTimer.current = setTimeout(() => {
      setActiveActionsId(id);
    }, 600); // 600ms hold time
  }, []);

  const handleHoldEnd = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }, []);

  const handleStop = useCallback(() => {
    stopRef.current = true;
    setIsLoading(false);
  }, []);

  const processMessage = async (userMessage: string, attachments: Attachment[] = []) => {
    setIsLoading(true);
    stopRef.current = false;
    shouldAutoScroll.current = true;
    setTimeout(() => scrollToBottom(true), 100);

    try {
      const maxFileContextChars = 15000;
      let totalChars = 0;
      const currentFilesContext = Object.entries(files)
        .map(([name, file]) => {
          if (totalChars > maxFileContextChars) return null;
          const content = file.code.length > 3000 ? file.code.substring(0, 3000) + "\n... [file truncated]" : file.code;
          const chunk = `File: ${name}\n\`\`\`${file.language}\n${content}\n\`\`\``;
          totalChars += chunk.length;
          return chunk;
        })
        .filter(Boolean)
        .join('\n\n');

      const attachmentContext = attachments
        .map(att => {
          const isImage = att.type.startsWith('image/');
          if (isImage) {
            return `[Attached Image: ${att.name}]`;
          } else {
            const contentPreview = att.content.length < 5000 ? att.content : att.content.substring(0, 5000) + '... [truncated]';
            return `[Attached File: ${att.name}]\nContent:\n${contentPreview}`;
          }
        })
        .join('\n\n');

      const agentSystemPrompt = isAgentActive 
        ? `You are the ReversX v1 Agent, an advanced AI integrated into the ReversX v1 IDE. You are extremely serious, professional, and precise. 
           Your goal is to build high-quality, production-ready web applications and assist the user in navigating this IDE.

           ### COMPREHENSIVE IDE GUIDE:
           1. **Activity Bar (Leftmost)**:
              - *Projects*: Create, rename, delete, and switch between different coding projects.
              - *Chat*: Your primary communication channel with me.
              - *BYOK Hub*: Set up your own API keys for SiliconFlow or Deepseek models.
              - *Friends*: Connect with other developers.
              - *Settings*: Customize the App Theme (Dark/Light/etc.), Icon Themes, and Syntax Highlighting.
           2. **Sidebar (Left)**: Shows the content of the tab selected in the Activity Bar. It can be minimized using the chevron button or resized by dragging the vertical handle.
           3. **Code Editor (Center)**:
              - *Tabbed Interface*: Open multiple files simultaneously.
              - *File Explorer Button*: Click the "FILE EXPLORER" text button at the top left of the editor to toggle the file tree.
              - *File Tree*: Right-click or use the '...' menu on files to Rename or Delete. Use the '+' icon at the top of the explorer to create new files.
           4. **Preview Area (Right/Toggle)**: Displays the live output of your code.
           5. **Top Navigation Bar**:
              - *Code/Preview*: Toggle between the editor and the live preview.
              - *Full*: Opens the current project in a new browser tab for a full-screen experience.
              - *Refresh*: Forces the preview to reload.
              - *Settings/Terminal*: Quick shortcuts to the settings panel or a terminal-style view.
           6. **File Attachments**:
              - Users can upload files or images using the '+' button in the chat input.
              - Clicking an attached file opens a modal where the user can edit the content, save changes, or specifically "Send to AI" for focused analysis.
           7. **Responsive Design**: On mobile, the IDE uses a single-view layout. Users can switch between Chat, Editor, and Preview using the navigation.

           Focus on clean code, modern design, and robust functionality. If the user asks about any feature or is stuck, use this guide to provide clear, step-by-step assistance.`
        : '';

      const prompt = `${agentSystemPrompt}\n\nCurrent project files:\n${currentFilesContext}\n\n${attachmentContext ? `Attachments:\n${attachmentContext}\n\n` : ''}User request: ${userMessage}`;

      const history = messages
        .filter(m => !m.content.startsWith('Welcome_msg:'))
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));
      
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'model', content: '' }]);
      
      const { apiKey: currentApiKey, model: currentModel, extra } = getPlatformConfig();

      const stream = await chatWithAIStream(prompt, history, currentApiKey, currentModel, activePlatform, attachments, extra);
      let fullResponse = '';
      let fullReasoning = '';
      
      const langMap: Record<string, string> = {
        'js': 'javascript',
        'javascript': 'javascript',
        'ts': 'typescript',
        'typescript': 'typescript',
        'py': 'python',
        'python': 'python',
        'py3': 'python',
        'html': 'html',
        'css': 'css',
        'cpp': 'cpp',
        'c++': 'cpp',
        'c': 'c',
        'java': 'java',
        'php': 'php',
        'sql': 'sql',
        'sh': 'bash',
        'bash': 'bash',
        'json': 'json',
        'md': 'markdown',
        'markdown': 'markdown',
        'rust': 'rust',
        'rs': 'rust',
        'go': 'go',
        'golang': 'go'
      };

      const fileMap: Record<string, string> = {
        'html': 'index.html',
        'javascript': 'script.js',
        'typescript': 'index.ts',
        'python': 'main.py',
        'css': 'style.css',
        'cpp': 'main.cpp',
        'c': 'main.c',
        'java': 'Main.java',
        'php': 'index.php',
        'sql': 'query.sql',
        'bash': 'script.sh',
        'json': 'data.json',
        'markdown': 'README.md',
        'rust': 'main.rs',
        'go': 'main.go'
      };

      let lastUpdateTime = Date.now();
      const updateInterval = 100; // Optimal tick length for lag-free typing rendering in React

      for await (const chunk of stream) {
        if (stopRef.current) break;
        
        if (typeof chunk === 'object' && chunk !== null) {
          if (chunk.type === 'reasoning') {
            fullReasoning += chunk.content;
          } else if (chunk.type === 'content') {
            fullResponse += chunk.content;
          }
        } else {
          fullResponse += chunk;
        }
        
        const now = Date.now();
        if (now - lastUpdateTime > updateInterval) {
          lastUpdateTime = now;
          
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastIdx = newMsgs.length - 1;
            if (newMsgs[lastIdx] && newMsgs[lastIdx].role === 'model') {
              newMsgs[lastIdx] = { 
                ...newMsgs[lastIdx],
                content: fullResponse,
                reasoning: fullReasoning 
              };
            }
            return newMsgs;
          });
        }
      }

      // Final update to ensure everything is caught
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastIdx = newMsgs.length - 1;
        if (newMsgs[lastIdx] && newMsgs[lastIdx].role === 'model') {
          newMsgs[lastIdx] = { 
            ...newMsgs[lastIdx],
            content: fullResponse,
            reasoning: fullReasoning 
          };
        }
        return newMsgs;
      });

      const finalFiles: Record<string, { code: string, language: string }> = {};
      const segments = fullResponse.split(/```/);
      
      for (let i = 1; i < segments.length; i += 2) {
        const block = segments[i];
        const prevText = segments[i-1] || '';
        
        const langMatch = block.match(/^(\w+)\s*\n/);
        const detectedLang = langMatch ? langMatch[1].toLowerCase() : 'text';
        const code = block.replace(/^(\w+)\s*\n/, '');
        const finalLang = langMap[detectedLang] || detectedLang;
        
        // Try to find filename in the previous text (e.g., "### Filename.js" or "File: Filename.js")
        const nameMatch = prevText.match(/(?:###|File:?|Filename:?)\s*([a-zA-Z0-9_.\-/]+)/i);
        let name = nameMatch ? nameMatch[1].trim() : (fileMap[finalLang] || `file_${Math.floor(i/2) + 1}.${finalLang}`);
        
        // Sanitize name
        if (name.includes('/') && !name.startsWith('./')) name = name.split('/').pop() || name;
        
        finalFiles[name] = { code, language: finalLang };
      }

      if (Object.keys(finalFiles).length > 0) {
        setFiles(prev => {
          const next = { ...prev, ...finalFiles };
          setPreviewFiles(next);
          return next;
        });

        const newFileNames = Object.keys(finalFiles);
        setOpenFiles(prev => {
          const next = [...prev];
          newFileNames.forEach(name => {
            if (!next.includes(name)) next.push(name);
          });
          return next;
        });

        // Silent Self-Healing Loop
        let isFixed = false;
        let attempts = 0;
        const maxAttempts = 3;
        let currentResponse = fullResponse;

        while (!isFixed && attempts < maxAttempts) {
          if (stopRef.current) break;
          
          const healingPrompt = `Silent verification: Check the following code for any broken buttons, non-functional JavaScript interactions, or missing HTML structure (like <head> or <body>). 
          
          Critical checklist:
          1. Do all buttons have corresponding event listeners in 'script.js' using addEventListener?
          2. Are there any 'onclick' attributes in HTML that might fail due to scope? (If yes, move them to addEventListener in script.js)
          3. Is the JavaScript logic complete and functional?
          4. Does 'index.html' have proper <head> and <body> tags for script injection?
          
          If any issue is found, provide the fixed code blocks for all relevant files. 
          If everything is 100% functional and follows the best practices, respond only with the word "stable".
          
          Code to verify:
          ${currentResponse}`;
          
          const healingResponse = await chatWithAI(healingPrompt, [], currentApiKey, currentModel, activePlatform, [], extra);
          if (healingResponse.trim().toUpperCase() === "STABLE") {
            isFixed = true;
          } else {
            const healingCodeBlocks = Array.from(healingResponse.matchAll(/```(\w*)\s*\n([\s\S]*?)(?:```|$)/g));
            if (healingCodeBlocks.length > 0) {
              const healingFiles: Record<string, { code: string, language: string }> = {};
              healingCodeBlocks.forEach((block, index) => {
                const detectedLang = (block[1] || 'text').toLowerCase();
                const code = block[2];
                const finalLang = langMap[detectedLang] || detectedLang;
                const name = fileMap[finalLang] || `file_${index + 1}.${finalLang}`;
                healingFiles[name] = { code, language: finalLang };
              });
              setFiles(prev => {
                const next = { ...prev, ...healingFiles };
                setPreviewFiles(next);
                return next;
              });
              currentResponse = healingResponse;
              attempts++;
            } else {
              isFixed = true;
            }
          }
        }
      }

    } catch (error: any) {
      console.error("Chat Error:", error);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        const errorMessage = error.message || "Sorry, I encountered an error. Please try again.";
        if (last && last.role === 'model' && last.content === '') {
          return [...prev.slice(0, -1), { role: 'model', content: `Error: ${errorMessage}` }];
        }
        return [...prev, { role: 'model', content: `Error: ${errorMessage}` }];
      });
    } finally {
      setIsLoading(false);
      if (!stopRef.current) {
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(e => console.warn("Audio play blocked by browser:", e));
        } catch (e) {
          console.warn("Failed to play notification sound:", e);
        }
      }
    }
  };

  const handleOpenInNewTab = useCallback(() => {
    const blob = new Blob([combinedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, [combinedHtml]);

  const handleTerminalCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setTerminalHistory(prev => [...prev, { type: 'cmd', text: trimmed }]);
    setTerminalInput('');

    const args = trimmed.split(' ');
    const baseCmd = args[0].toLowerCase();

    if (baseCmd === 'help') {
      setTerminalHistory(prev => [...prev, { type: 'output', text: 'Available commands: help, clear, ls, npm install <pkg>, npm uninstall <pkg>' }]);
    } else if (baseCmd === 'clear') {
      setTerminalHistory([]);
    } else if (baseCmd === 'ls') {
      const fileList = Object.keys(files).join('  ');
      setTerminalHistory(prev => [...prev, { type: 'output', text: fileList || 'No files found.' }]);
    } else if (baseCmd === 'npm' && args[1] === 'install') {
      const pkg = args[2];
      if (!pkg) {
        setTerminalHistory(prev => [...prev, { type: 'error', text: 'Error: Please specify a package name. Example: npm install lodash' }]);
        return;
      }

      setTerminalHistory(prev => [...prev, { type: 'output', text: `Installing ${pkg}...` }]);
      
      setTimeout(() => {
        let pkgJson = files['package.json'] ? JSON.parse(files['package.json'].code) : { dependencies: {} };
        if (!pkgJson.dependencies) pkgJson.dependencies = {};
        pkgJson.dependencies[pkg] = "latest";

        setFiles(prev => ({
          ...prev,
          'package.json': {
            code: JSON.stringify(pkgJson, null, 2),
            language: 'json'
          }
        }));

        setTerminalHistory(prev => [...prev, { type: 'output', text: `+ ${pkg}@latest installed successfully.` }]);
      }, 800);
    } else if (baseCmd === 'npm' && args[1] === 'uninstall') {
        const pkg = args[2];
        if (!pkg) {
          setTerminalHistory(prev => [...prev, { type: 'error', text: 'Error: Please specify a package name.' }]);
          return;
        }
        let pkgJson = files['package.json'] ? JSON.parse(files['package.json'].code) : null;
        if (pkgJson && pkgJson.dependencies && pkgJson.dependencies[pkg]) {
          delete pkgJson.dependencies[pkg];
          setFiles(prev => ({
            ...prev,
            'package.json': {
              code: JSON.stringify(pkgJson, null, 2),
              language: 'json'
            }
          }));
          setTerminalHistory(prev => [...prev, { type: 'output', text: `uninstalled ${pkg}.` }]);
        } else {
          setTerminalHistory(prev => [...prev, { type: 'error', text: `Package ${pkg} not found in dependencies.` }]);
        }
    } else {
      setTerminalHistory(prev => [...prev, { type: 'error', text: `Command not found: ${baseCmd}` }]);
    }
  }, [files]);

  const handleOpenBrandingPage = useCallback(() => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReversX v1</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0d0d0d;
            --side: #181818;
            --text: #cccccc;
            --blue: #4fc1ff;
            --orange: #ce9178;
            --green: #6a9955;
            --border: #2b2b2b;
            --highlight: #1e1e1e;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'Roboto', sans-serif;
            display: flex;
            height: 100vh;
            font-size: 14px;
        }

        /* --- SIDEBAR ICONS --- */
        .sidebar {
            width: 50px;
            background: var(--side);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 20px;
            gap: 25px;
        }

        .icon { width: 22px; height: 22px; position: relative; opacity: 0.6; }
        .icon-files { border: 2px solid #858585; border-radius: 2px; }
        .icon-files::after { content: ''; position: absolute; top: 4px; left: 4px; width: 10px; height: 2px; background: #858585; box-shadow: 0 4px 0 #858585, 0 8px 0 #858585; }

        /* --- MAIN AREA --- */
        .main {
            flex: 1;
            padding: 35px;
            overflow-y: auto;
        }

        .comment { color: var(--green); margin-bottom: 8px; }
        h1 { color: #fff; font-size: 26px; font-weight: 500; margin-bottom: 25px; }

        /* --- HIGH VISIBILITY TABLE --- */
        .data-table {
            width: 100%;
            max-width: 450px;
            margin: 25px 0;
            border-collapse: collapse;
            background: var(--highlight);
            border: 1px solid var(--border);
            border-left: 4px solid var(--blue); /* Highlight side */
            border-radius: 4px;
        }

        .data-table tr {
            border-bottom: 1px solid var(--border);
        }

        .data-table tr:last-child {
            border-bottom: none;
        }

        .data-table td {
            padding: 14px 20px;
            font-size: 13px;
        }

        .key { 
            color: var(--blue); 
            font-weight: 500;
            width: 40%;
            border-right: 1px solid var(--border);
        }

        .val { 
            color: var(--orange); 
        }

        .text { margin-bottom: 10px; }

        /* --- FOOTER --- */
        .status-bar {
            position: fixed;
            bottom: 0;
            width: 100%;
            background: #007acc;
            color: white;
            font-size: 11px;
            padding: 4px 15px;
            display: flex;
            justify-content: space-between;
        }

        @media (max-width: 500px) {
            .main { padding: 25px; }
            .sidebar { display: none; }
        }
    </style>
</head>
<body>

    <div class="sidebar">
        <div class="icon icon-files"></div>
    </div>

    <div class="main">
        <div class="comment">// About ReversX v1</div>
        <h1>ReversX v1</h1>
        
        <p class="text">A free helper to build websites easily.</p>
        <p class="text">Made for people who code on their phone.</p>

        <table class="data-table">
            <tr>
                <td class="key">Works on</td>
                <td class="val">Android Phones</td>
            </tr>
            <tr>
                <td class="key">Price</td>
                <td class="val">Free</td>
            </tr>
            <tr>
                <td class="key">Users</td>
                <td class="val">20,000</td>
            </tr>
            <tr>
                <td class="key">Saved work</td>
                <td class="val">Lifetime</td>
            </tr>
        </table>

        <div class="comment">/* How to use */</div>
        <p class="text">1. Add your key.</p>
        <p class="text">2. Tell the AI your idea.</p>
        <p class="text">3. Get your code back.</p>
    </div>

    <div class="status-bar">
        <div>main*</div>
        <div>ReversX System Active</div>
    </div>

</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, []);

  const generateAgentQuestions = async (userPrompt: string) => {
    setIsLoading(true);
    setCurrentAgentPrompt(userPrompt);
    
    const prompt = `The user wants to build: "${userPrompt}". 
    As a professional ReversX v1 Agent, generate exactly 3 specific multiple-choice questions to better understand the technical requirements, design preferences, and functionality of this project. 
    Keep the questions concise and professional.
    Format your response as a JSON array of objects, each with "question" and "options" (array of strings).
    Example: [{"question": "What is the primary color theme?", "options": ["Dark", "Light", "Vibrant"]}]`;

     try {
       const { apiKey: currentApiKey, model: currentModel, extra } = getPlatformConfig();
       const response = await chatWithAI(prompt, [], currentApiKey, currentModel, activePlatform, [], extra);
       const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]);
        setAgentQuestions(questions);
        setSelectedAnswers({});
        setShowAgentQuestions(true);
      } else {
        processMessage(userPrompt);
      }
    } catch (error) {
      console.error("Agent Question Generation Error:", error);
      processMessage(userPrompt);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentSubmit = () => {
    if (Object.keys(selectedAnswers).length < agentQuestions.length) return;
    
    const answersText = agentQuestions.map((q, i) => `Q: ${q.question}\nA: ${selectedAnswers[i]}`).join('\n');
    const finalPrompt = `User Project Request: ${currentAgentPrompt}\n\nTechnical Requirements & Preferences:\n${answersText}`;
    
    setShowAgentQuestions(false);
    processMessage(finalPrompt);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const content = await new Promise<string>((resolve) => {
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        if (file.type.startsWith('image/')) {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });

      newAttachments.push({
        name: file.name,
        type: file.type,
        content: content
      });
    }

    setPendingAttachments(prev => [...prev, ...newAttachments]);
    if (e.target) e.target.value = '';
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
    if (previewPendingIdx === index) setPreviewPendingIdx(null);
    else if (previewPendingIdx !== null && previewPendingIdx > index) setPreviewPendingIdx(previewPendingIdx - 1);
  }, [previewPendingIdx]);

  const handleSaveAttachment = useCallback((updated: Attachment) => {
    if (editingAttachment?.isPending && editingAttachment.index !== undefined) {
      const newAttachments = [...pendingAttachments];
      newAttachments[editingAttachment.index] = updated;
      setPendingAttachments(newAttachments);
    }
    setEditingAttachment(null);
  }, [editingAttachment, pendingAttachments]);

  const handleSendEditedAttachment = useCallback(async (updated: Attachment) => {
    setEditingAttachment(null);
    const userMessage = `I've edited the file "${updated.name}". Here is the updated content:`;
    processMessage(userMessage, [updated]);
  }, [processMessage]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && pendingAttachments.length === 0) || isLoading) return;

    const userMessage = input;
    const attachments = [...pendingAttachments];
    setInput('');
    setPendingAttachments([]);
    setPreviewPendingIdx(null);
    
    // Reset textarea height immediately
    if (textareaRef.current) {
      textareaRef.current.style.height = '60px';
    }
    
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      attachments: attachments.length > 0 ? attachments : undefined
    }]);
    
    if (isAgentActive) {
      generateAgentQuestions(userMessage);
      return;
    }

    // Handle project naming if it's the first real message
    const isFirstMessage = messages.filter(m => !m.content.startsWith('Welcome_msg:')).length === 0;

    if (isFirstMessage && activeProjectId) {
      const project = projects.find(p => p.id === activeProjectId);
      if (project && (
        project.name === 'New Project' || 
        project.name === 'My First Project' || 
        project.name.startsWith('Project ')
      )) {
        setPendingUserMessage(userMessage);
        setPendingUserAttachments(attachments);
        setShowProjectNaming(true);
        return;
      }
    }

    await processMessage(userMessage, attachments);
  }, [input, pendingAttachments, isLoading, isAgentActive, messages, activeProjectId, projects, processMessage]);

  const handleProjectNamingSubmit = useCallback(() => {
    if (!pendingProjectName.trim()) return;
    
    const cleanName = pendingProjectName.trim();
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, name: cleanName } : p));
    setShowProjectNaming(false);
    setPendingProjectName('');
    
    if (pendingUserMessage || pendingUserAttachments.length > 0) {
      processMessage(pendingUserMessage, pendingUserAttachments);
      setPendingUserMessage('');
      setPendingUserAttachments([]);
    }
  }, [pendingUserAttachments, processMessage]);
  
  
  
  const handleCreateFile = useCallback(() => {
    setNewFileName('');
    setShowNewFileModal(true);
    setIsExplorerCreateMenuOpen(false);
  }, []);

  const handleCreateFolder = useCallback(() => {
    setNewFolderName('');
    setShowNewFolderModal(true);
    setIsExplorerCreateMenuOpen(false);
  }, []);

  const handleGithubImport = useCallback(() => {
    setIsGithubImportOpen(true);
    setIsExplorerCreateMenuOpen(false);
  }, []);

  const handleGithubExport = useCallback(() => {
    setIsGithubExportOpen(true);
    setIsExplorerCreateMenuOpen(false);
  }, []);

  const confirmGithubExport = async () => {
    if (!githubExportRepo || !githubToken) {
      alert('Repository path and Personal Access Token are required.');
      return;
    }
    
    setIsGitHubExporting(true);
    try {
      const repoPath = githubExportRepo.trim().replace('https://github.com/', '').replace('http://github.com/', '');
      const [owner, repo] = repoPath.split('/');
      if (!owner || !repo) throw new Error('Invalid Repository path. Use owner/repo');

      const headers = {
        'Authorization': `token ${githubToken.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };

      // 1. Get the latest commit SHA of the branch
      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${githubBranch}`, { headers });
      
      let baseTreeSha: string | undefined;
      let parentCommitSha: string | undefined;

      if (refRes.ok) {
        const refData = await refRes.json();
        parentCommitSha = refData.object.sha;
        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${parentCommitSha}`, { headers });
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      } else if (refRes.status === 404) {
        // Branch might not exist, or repo is empty. For a real app, we'd handle initial commit differently.
        throw new Error('Branch not found. Please ensure the repository exists and has at least one commit.');
      } else {
        throw new Error('Failed to connect to GitHub. Check your token and repository permissions.');
      }

      // 2. Create Blobs and Tree
      const treeItems = Object.entries(files).map(([path, file]) => ({
        path,
        mode: '100644',
        type: 'blob',
        content: file.code
      }));

      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeItems
        })
      });
      const treeData = await treeRes.json();
      if (!treeRes.ok) throw new Error(treeData.message || 'Failed to create tree');

      // 3. Create Commit
      const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: githubCommitMessage || 'Update from Editor',
          tree: treeData.sha,
          parents: [parentCommitSha]
        })
      });
      const commitData = await commitRes.json();
      if (!commitRes.ok) throw new Error(commitData.message || 'Failed to create commit');

      // 4. Update Reference
      const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${githubBranch}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          sha: commitData.sha,
          force: false
        })
      });

      if (!updateRes.ok) {
        const data = await updateRes.json();
        throw new Error(data.message || 'Failed to update branch reference');
      }

      alert('Successfully pushed to GitHub!');
      setIsGithubExportOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(`Push error: ${err.message}`);
    } finally {
      setIsGitHubExporting(false);
    }
  };

  const confirmGithubImport = async () => {
    if (!githubRepoUrl) return;
    setIsGitHubImporting(true);
    try {
      let repoPath = githubRepoUrl.trim().replace('https://github.com/', '').replace('http://github.com/', '');
      if (repoPath.endsWith('.git')) repoPath = repoPath.slice(0, -4);
      
      const parts = repoPath.split('/');
      if (parts.length < 2) throw new Error('Invalid GitHub URL structure. Use owner/repo');
      const owner = parts[0];
      const repo = parts[1];

      const fetchRepo = async (path: string = ''): Promise<Record<string, { code: string, language: string }>> => {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${githubBranch}`);
        if (!response.ok) {
           if (response.status === 403) throw new Error('GitHub API rate limit exceeded. Please try again later.');
           throw new Error(`Failed to fetch ${path || 'repository'}`);
        }
        const data = await response.json();
        
        let newFiles: Record<string, { code: string, language: string }> = {};
        const items = Array.isArray(data) ? data : [data];
        
        for (const item of items) {
          if (item.type === 'file') {
            const fileRes = await fetch(item.download_url);
            const content = await fileRes.text();
            const ext = item.name.split('.').pop() || 'plaintext';
            const langMap: Record<string, string> = {
              'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
              'html': 'html', 'css': 'css', 'py': 'python', 'json': 'json', 'md': 'markdown'
            };
            newFiles[item.path] = { code: content, language: langMap[ext] || 'plaintext' };
          } else if (item.type === 'dir') {
            const dirFiles = await fetchRepo(item.path);
            newFiles = { ...newFiles, ...dirFiles };
          }
        }
        return newFiles;
      };

      const importedFiles = await fetchRepo();
      if (Object.keys(importedFiles).length > 0) {
        setFiles(prev => ({ ...prev, ...importedFiles }));
        const firstFile = Object.keys(importedFiles)[0];
        setActiveFile(firstFile);
        setOpenFiles(prev => Array.from(new Set([...prev, firstFile])));
      }
      setIsGithubImportOpen(false);
      setGithubRepoUrl('');
    } catch (err: any) {
      console.error(err);
      alert(`Import error: ${err.message}`);
    } finally {
      setIsGitHubImporting(false);
    }
  };

  const confirmCreateFolder = useCallback(() => {
    const name = newFolderName.trim();
    if (!name) return;
    
    // We create a hidden file to represent the folder in the flat file system
    const folderPath = name.endsWith('/') ? name.substring(0, name.length - 1) : name;
    const dummyFile = `${folderPath}/.keep`;
    
    if (files[dummyFile]) {
      alert('Folder already exists!');
      return;
    }

    setFiles(prev => ({
      ...prev,
      [dummyFile]: { code: '', language: 'plaintext' }
    }));
    setShowNewFolderModal(false);
  }, [newFolderName, files]);

  const confirmCreateFile = useCallback(() => {
    const name = newFileName.trim();
    if (!name) return;
    if (files[name]) {
      alert('File already exists!');
      return;
    }
    
    const language = getLanguageFromPath(name);

    setFiles(prev => ({
      ...prev,
      [name]: { code: '', language }
    }));
    setOpenFiles(prev => {
      const newTabs = prev.includes(name) ? prev : [...prev, name];
      if (newTabs.length > 4) return newTabs.slice(-4);
      return newTabs;
    });
    setActiveFile(name);
    setShowNewFileModal(false);
    setNewFileName('');
  }, [newFileName, files]);

  const marketplaceExtensions = useMemo(() => [
    {
      id: 'neon-vibe',
      name: 'Neon Vibe',
      description: 'A dark neon aesthetic for cyberpunk lovers.',
      author: 'ReversX Team',
      version: '1.0.0',
      icon: 'zap',
      theme: {
        background: '#0a0a0a',
        foreground: '#00ffcc',
        accent: '#ff00ff',
        sidebarBackground: '#111',
        editorBackground: '#050505',
        fontFamily: "'JetBrains Mono', monospace"
      },
      styles: `
        .extension-controlled button { border-color: #ff00ff44 !important; }
        .extension-controlled .text-accent { color: #ff00ff !important; }
      `
    },
    {
      id: 'minimalist-white',
      name: 'Minimalist Snow',
      description: 'Clean, professional light mode extension.',
      author: 'DesignGuru',
      version: '1.1.0',
      icon: 'sun',
      theme: {
        background: '#ffffff',
        foreground: '#1a1a1a',
        accent: '#3b82f6',
        sidebarBackground: '#f5f5f5',
        editorBackground: '#fafafa',
        fontFamily: "'Inter', sans-serif"
      },
      styles: `
        .extension-sidebar { border-right: 1px solid #e5e5e5 !important; }
        .extension-controlled { border-color: #e5e5e5 !important; }
      `
    },
    {
      id: 'retro-terminal',
      name: 'Retro CRT',
      description: 'Golden era of computing with amber glows.',
      author: 'OldSchool',
      version: '0.9.0',
      icon: 'monitor',
      theme: {
        background: '#1a1105',
        foreground: '#ffb000',
        accent: '#ffd000',
        sidebarBackground: '#2a1d0a',
        editorBackground: '#150d04',
        fontFamily: "'Courier New', monospace"
      },
      styles: `
        .extension-controlled { text-shadow: 0 0 5px #ffb000; }
        .extension-controlled * { border-color: #ffb00033 !important; }
      `
    }
  ], []);

  const activeExtension = useMemo(() => {
    const fromInstalled = installedExtensions.find(ext => ext.id === activeExtensionId);
    if (fromInstalled) return fromInstalled;
    return marketplaceExtensions.find(ext => ext.id === activeExtensionId);
  }, [activeExtensionId, installedExtensions, marketplaceExtensions]);

  useEffect(() => {
    // Inject marketplace styles
    const styleId = 'extension-styles';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    if (activeExtension && activeExtension.theme) {
      const theme = activeExtension.theme;
      styleTag.innerHTML = `
        :root {
          ${theme.accent ? `--color-accent: ${theme.accent};` : ''}
        }
        body.extension-enabled .extension-root:not(.no-extension) {
          ${theme.background ? `background-color: ${theme.background} !important;` : ''}
          ${theme.foreground ? `color: ${theme.foreground} !important;` : ''}
          ${theme.fontFamily ? `font-family: ${theme.fontFamily} !important;` : ''}
        }
        /* Target Root for inheritance */
        body.extension-enabled .extension-root {
          ${theme.fontFamily ? `font-family: ${theme.fontFamily} !important;` : ''}
        }
        /* Target specific text elements for better coverage */
        body.extension-enabled .extension-root p, 
        body.extension-enabled .extension-root span, 
        body.extension-enabled .extension-root button,
        body.extension-enabled .extension-root div:not(.no-extension) {
          ${theme.fontFamily ? `font-family: ${theme.fontFamily} !important;` : ''}
        }
        /* Target Icons Safely */
        body.extension-enabled .extension-root svg:not(.no-extension svg) {
          ${theme.accent ? `color: ${theme.accent} !important; fill: none; stroke: currentColor;` : ''}
        }
        body.extension-enabled .extension-sidebar {
          ${theme.sidebarBackground ? `background-color: ${theme.sidebarBackground} !important;` : ''}
        }
        body.extension-enabled .extension-editor {
          ${theme.editorBackground ? `background-color: ${theme.editorBackground} !important;` : ''}
        }
        ${activeExtension.styles || ''}
      `;
      document.body.classList.add('extension-enabled');
    } else {
      styleTag.innerHTML = '';
      document.body.classList.remove('extension-enabled');
    }
  }, [activeExtension]);

  const handleInstallExtension = (ext: any) => {
    if (installedExtensions.find(e => e.id === ext.id)) {
      setActiveExtensionId(ext.id);
    } else {
      setInstalledExtensions(prev => [...prev, ext]);
      setActiveExtensionId(ext.id);
    }
  };

  const confirmUploadExtension = () => {
    try {
      setUploadError('');
      const ext = JSON.parse(customExtJSON);
      if (!ext.id || !ext.name) throw new Error('Invalid format: "id" and "name" are required.');
      if (!ext.theme) throw new Error('Invalid format: "theme" object is required.');
      
      setInstalledExtensions(prev => {
        const filtered = prev.filter(e => e.id !== ext.id);
        return [...filtered, ext];
      });
      
      setTimeout(() => {
        setActiveExtensionId(ext.id);
      }, 0);

      setShowUploadModal(false);
      setCustomExtJSON('');
    } catch (err: any) {
      setUploadError(err.message || 'Unknown error during upload');
    }
  };

  const handleRenameFile = useCallback((oldName: string) => {
    setRenameOldName(oldName);
    setRenameNewName(oldName);
    setShowRenameModal(true);
  }, []);

  const confirmRenameFile = useCallback(() => {
    const oldName = renameOldName;
    const newName = renameNewName.trim();
    if (!newName || newName === oldName) {
      setShowRenameModal(false);
      return;
    }
    if (files[newName]) {
      alert('File already exists!');
      return;
    }

    setFiles(prev => {
      const newFiles = { ...prev };
      const oldData = newFiles[oldName];
      const newLanguage = getLanguageFromPath(newName);
      newFiles[newName] = { ...oldData, language: newLanguage };
      delete newFiles[oldName];
      return newFiles;
    });
    if (activeFile === oldName) setActiveFile(newName);
    setShowRenameModal(false);
  }, [renameOldName, renameNewName, files, activeFile]);

  const handleDeleteFile = useCallback((name: string) => {
    if (Object.keys(files).length <= 1) {
      alert('Cannot delete the last file.');
      return;
    }
    setFileToDelete(name);
    setShowDeleteModal(true);
  }, [files]);

  const confirmDeleteFile = useCallback(() => {
    const name = fileToDelete;
    if (!name) {
      setShowDeleteModal(false);
      return;
    }

    setFiles(prev => {
      const updated = { ...prev };
      delete updated[name];
      setPreviewFiles(updated);
      return updated;
    });

    setOpenFiles(prev => prev.filter(f => f !== name));

    if (activeFile === name) {
      const remaining = Object.keys(files).filter(f => f !== name);
      setActiveFile(remaining[0] || '');
    }
    setShowDeleteModal(false);
    setFileToDelete('');
  }, [fileToDelete, files, activeFile]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        setFiles(prev => {
          const next = {
            ...prev,
            [activeFile]: {
              ...prev[activeFile],
              code: value
            }
          };
          setPreviewFiles(next);
          return next;
        });
      }, 500); // 500ms debounce
    }
  }, [activeFile]);

  const handleOpenLocalFile = async () => {
    // Check if we are in an iframe
    const isIframe = window.self !== window.top;

    if (!('showOpenFilePicker' in window) || isIframe) {
      handleOpenFileSystem();
      return;
    }

    try {
      const [handle] = await (window as any).showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: 'Code Files',
            accept: {
              'text/*': ['.js', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.txt', '.py', '.c', '.cpp', '.java', '.php', '.sql', '.sh', '.rs', '.go'],
            },
          },
        ],
      });

      const file = await handle.getFile();
      const contents = await file.text();
      const name = file.name;
      
      fileHandles.current[name] = handle;
      const language = getLanguageFromPath(name);

      setFiles(prev => ({
        ...prev,
        [name]: { code: contents, language }
      }));
      setActiveFile(name);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      
      console.warn('File System Access API blocked or failed, falling back to standard input:', err);
      handleOpenFileSystem();
    }
  };

  const handleDownloadFallback = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    alert(`Downloaded ${filename} to your device.`);
  };

  const handleSaveToLocal = useCallback(async () => {
    const handle = fileHandles.current[activeFile];
    const content = files[activeFile]?.code || '';
    const isIframe = window.self !== window.top;

    if (handle && !isIframe) {
      try {
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        alert(`Saved ${activeFile} to device!`);
      } catch (err) {
        console.error('Error saving to local file:', err);
        handleDownloadFallback(activeFile, content);
      }
    } else {
      if (!('showSaveFilePicker' in window) || isIframe) {
        handleDownloadFallback(activeFile, content);
        return;
      }

      try {
        const newHandle = await (window as any).showSaveFilePicker({
          suggestedName: activeFile,
        });
        const writable = await newHandle.createWritable();
        await writable.write(content);
        await writable.close();
        fileHandles.current[activeFile] = newHandle;
        alert(`Saved ${activeFile} to device!`);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error saving new local file:', err);
          handleDownloadFallback(activeFile, content);
        }
      }
    }
  }, [activeFile, files]);

  const handleOpenFileSystem = useCallback(async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = async (e: any) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles) return;
        
        const newFiles = { ...files };
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const contents = await file.text();
          const name = file.name;
          const language = getLanguageFromPath(name);

          newFiles[name] = { code: contents, language };
        }
        setFiles(newFiles);
        setPreviewFiles(newFiles);
      };
      input.click();
    } catch (err) {
      console.error('Error opening files:', err);
    }
  }, [files]);

  const handleGlobalSearch = useCallback((query: string) => {
    if (!query) {
      setGlobalSearchResults([]);
      return;
    }

    const results: { filename: string, matches: { line: number, text: string, index: number }[] }[] = [];
    
    Object.entries(files).forEach(([filename, fileData]) => {
      const code = fileData.code;
      if (typeof code !== 'string') return;
      
      const fileMatches: { line: number, text: string, index: number }[] = [];
      const lines = code.split('\n');
      
      let flags = 'g';
      if (!globalSearchOptions.caseSensitive) flags += 'i';
      
      let pattern = query;
      if (!globalSearchOptions.useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      
      if (globalSearchOptions.wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      
      const regex = new RegExp(pattern, flags);
      
      lines.forEach((lineText, lineIdx) => {
        let match;
        const lineRegex = new RegExp(pattern, flags);
        while ((match = lineRegex.exec(lineText)) !== null) {
          fileMatches.push({
            line: lineIdx + 1,
            text: lineText.trim(),
            index: match.index
          });
          if (!flags.includes('g')) break;
        }
      });
      
      if (fileMatches.length > 0) {
        results.push({ filename, matches: fileMatches });
      }
    });
    
    setGlobalSearchResults(results);
  }, [files, globalSearchOptions]);

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items) return;

    const newFiles = { ...files };
    
    const readFileEntry = (entry: any): Promise<File> => {
      return new Promise((resolve) => entry.file(resolve));
    };

    const readDirectoryEntry = (entry: any): Promise<any[]> => {
      const dirReader = entry.createReader();
      return new Promise((resolve, reject) => {
        const results: any[] = [];
        const readEntries = () => {
          dirReader.readEntries((entries: any[]) => {
            if (entries.length === 0) {
              resolve(results);
            } else {
              results.push(...entries);
              readEntries();
            }
          }, (err: any) => reject(err));
        };
        readEntries();
      });
    };

    const processEntry = async (entry: any, path: string = '') => {
      if (entry.isFile) {
        const file = await readFileEntry(entry);
        const relativePath = path + entry.name;
        
        // Skip common large or unnecessary files/folders
        if (relativePath.includes('node_modules') || relativePath.includes('.git')) return;

        let content: string;
        let language: string;
        
        if (file.type.startsWith('image/')) {
          content = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.readAsDataURL(file);
          });
          language = 'image';
        } else {
          content = await file.text();
          language = getLanguageFromPath(entry.name);
        }
        
        newFiles[relativePath] = { code: content, language };
      } else if (entry.isDirectory) {
        const entries = await readDirectoryEntry(entry);
        for (const childEntry of entries) {
          await processEntry(childEntry, path + entry.name + '/');
        }
      }
    };

    const promises = [];
    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) {
        promises.push(processEntry(entry));
      }
    }
    
    await Promise.all(promises);
    setFiles(newFiles);
    setPreviewFiles(newFiles);
  }, [files]);

  const handleGlobalReplace = useCallback((filename: string, oldText: string, newText: string) => {
    setFiles(prev => {
      const fileData = prev[filename];
      if (!fileData) return prev;
      
      let flags = 'g';
      if (!globalSearchOptions.caseSensitive) flags += 'i';
      
      let pattern = oldText;
      if (!globalSearchOptions.useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (globalSearchOptions.wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      
      const regex = new RegExp(pattern, flags);
      const newCode = fileData.code.replace(regex, newText);
      
      return {
        ...prev,
        [filename]: { ...fileData, code: newCode }
      };
    });
    // Refresh search
    setTimeout(() => handleGlobalSearch(globalSearchQuery), 0);
  }, [globalSearchOptions, handleGlobalSearch, globalSearchQuery]);

  const handleGlobalReplaceAll = useCallback(() => {
    if (!globalSearchQuery) return;
    
    setFiles(prev => {
      const newFiles = { ...prev };
      let flags = 'g';
      if (!globalSearchOptions.caseSensitive) flags += 'i';
      
      let pattern = globalSearchQuery;
      if (!globalSearchOptions.useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (globalSearchOptions.wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      
      const regex = new RegExp(pattern, flags);
      
      Object.keys(newFiles).forEach(filename => {
        const fileData = newFiles[filename];
        if (typeof fileData.code === 'string') {
          newFiles[filename] = {
            ...fileData,
            code: fileData.code.replace(regex, globalReplaceQuery)
          };
        }
      });
      
      return newFiles;
    });
    setGlobalSearchResults([]);
  }, [globalSearchQuery, globalReplaceQuery, globalSearchOptions]);

  const handleUploadImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e: any) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles) return;
      
      const newFiles = { ...files };
      Array.from(selectedFiles).forEach((file: any) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setFiles(prev => ({ ...prev, [file.name]: { code: base64, language: 'image' } }));
          setPreviewFiles(prev => ({ ...prev, [file.name]: { code: base64, language: 'image' } }));
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  }, [files]);

  const byokConfig = React.useMemo(() => {
    return getPlatformConfig();
  }, [getPlatformConfig]);

  const onEditAttachment = useCallback((att: Attachment) => {
    setEditingAttachment({ attachment: att, isPending: false });
  }, []);

  const onCodeChange = useCallback((newCode: string) => {
    setFiles(prev => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], code: newCode }
    }));
  }, [activeFile]);

  if (!isDbLoaded) {
    return (
      <div className="flex w-screen h-screen bg-background items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <IconContext.Provider value={iconThemeName}>
      <div className={`flex flex-col md:flex-row h-full w-full bg-background text-foreground overflow-hidden relative extension-root ${(!showPreview && mobileView === 'editor') ? 'font-roboto' : ''}`}>
      
      <AnimatePresence mode="wait">
        {showAgentQuestions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg bg-sidebar border border-accent/30 p-6 rounded-xl shadow-[0_0_30px_rgba(0,255,65,0.1)]"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Terminal size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-normal text-foreground tracking-tight">ReversX v1 Agent</h2>
                  <p className="text-foreground/70 text-xs">Clarifying technical requirements</p>
                </div>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {agentQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-3">
                    <p className="text-sm font-normal text-foreground/80">{q.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => setSelectedAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                          className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                            selectedAnswers[qIdx] === opt
                              ? 'bg-accent/10 border-accent text-accent'
                              : 'bg-black/20 border-white/5 text-white/70 hover:border-white/10 hover:text-white/85'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setShowAgentQuestions(false);
                    processMessage(currentAgentPrompt);
                  }}
                  className="flex-1 py-3 bg-foreground/5 text-foreground-subtle font-normal rounded-lg hover:bg-foreground/10 transition-all text-sm"
                >
                  Skip
                </button>
                <button
                  onClick={handleAgentSubmit}
                  disabled={Object.keys(selectedAnswers).length < agentQuestions.length}
                  className="flex-[2] py-3 bg-accent text-accent-foreground font-normal rounded-lg hover:bg-accent/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm shadow-[0_0_20px_rgba(0,255,65,0.2)]"
                >
                  Submit & Build
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showNamePrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-sidebar border border-border p-8 rounded-xl shadow-2xl"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Terminal size={32} />
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-normal tracking-tight text-foreground">Welcome to ReversX</h1>
                  <p className="text-foreground/50 text-sm">Please enter your name to continue</p>
                </div>
                <div className="w-full space-y-4">
                  <input 
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                    placeholder="Your Name"
                    autoFocus
                    className="w-full bg-foreground/5 border border-border rounded-lg p-4 text-center text-lg focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-foreground/10"
                  />
                  <button 
                    onClick={handleNameSubmit}
                    disabled={!tempName.trim()}
                    className="w-full py-4 bg-[#007ACC] hover:bg-[#006BB3] text-white font-medium rounded-[2px] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    Start Building
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showProjectNaming && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-sidebar border border-border p-8 rounded-xl shadow-2xl"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <Files size={32} />
                </div>
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-normal tracking-tight text-foreground">Name Your Project</h1>
                  <p className="text-foreground/50 text-sm">Give your project a name to save it</p>
                </div>
                <div className="w-full space-y-4">
                  <input 
                    type="text"
                    value={pendingProjectName}
                    onChange={(e) => setPendingProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleProjectNamingSubmit()}
                    placeholder="Project Name"
                    autoFocus
                    className="w-full bg-foreground/5 border border-border rounded-lg p-4 text-center text-lg focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-foreground/10"
                  />
                  <button 
                    onClick={handleProjectNamingSubmit}
                    disabled={!pendingProjectName.trim()}
                    className="w-full py-4 bg-[#007ACC] hover:bg-[#006BB3] text-white font-medium rounded-[2px] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {editingAttachment && (
          <AttachmentEditorModal 
            editingData={editingAttachment}
            onClose={() => setEditingAttachment(null)}
            onSave={handleSaveAttachment}
            onSend={handleSendEditedAttachment}
          />
        )}
      </AnimatePresence>

      {/* Activity Bar (Desktop only) */}
      <div className="hidden md:flex w-12 flex-col items-center py-2 border-r border-[#1e1e1e] bg-[#333333] shrink-0">
        <div className="flex flex-col w-full">
          <button 
            onClick={() => {
              if (activeTab === 'projects') {
                setIsExplorerOpen(!isExplorerOpen);
              } else {
                setActiveTab('projects');
                setIsExplorerOpen(true);
              }
            }}
            className={`w-full h-12 flex items-center justify-center transition-all relative ${activeTab === 'projects' && isExplorerOpen ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            title="Explorer"
          >
            {activeTab === 'projects' && isExplorerOpen && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_white]" />}
            <Files size={24} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setActiveTab('search')}
            className={`w-full h-12 flex items-center justify-center transition-all relative ${activeTab === 'search' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            title="Search"
          >
            {activeTab === 'search' && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_white]" />}
            <Search size={24} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full h-12 flex items-center justify-center transition-all relative ${activeTab === 'chat' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            title="Chat Agent"
          >
            {activeTab === 'chat' && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_white]" />}
            <MessageSquare size={24} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-auto flex flex-col w-full pb-2">
          <button 
            onClick={() => setActiveTab('byok')}
            className={`w-full h-12 flex items-center justify-center transition-all relative ${activeTab === 'byok' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            title="API Keys"
          >
            {activeTab === 'byok' && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_white]" />}
            <Key size={24} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setActiveTab('friends')}
            className={`w-full h-12 flex items-center justify-center transition-all relative ${activeTab === 'friends' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            title="Friends"
          >
            {activeTab === 'friends' && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_white]" />}
            <Users size={24} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full h-12 flex items-center justify-center transition-all relative ${activeTab === 'settings' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            title="Settings"
          >
            {activeTab === 'settings' && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_white]" />}
            <Settings size={24} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setActiveTab('extensions')}
            className={`w-full h-12 flex items-center justify-center transition-all relative ${activeTab === 'extensions' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
            title="Extension Marketplace"
          >
            {activeTab === 'extensions' && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white shadow-[0_0_8px_white]" />}
            <Blocks size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>


      {/* Sidebar Content */}
      <div 
        style={{ width: isSidebarMinimized ? '0px' : (activeTab === 'friends' ? '100%' : (window.innerWidth >= 768 ? `${sidebarWidth}px` : '100%')) }}
        className={`
          ${mobileView === 'chat' ? 'flex flex-1' : 'hidden'} 
          md:flex border-r border-[#1e1e1e] bg-[#252526] flex-col overflow-hidden transition-[width] ${isResizing ? 'duration-0' : 'duration-300'} ease-in-out relative extension-sidebar
        `}
      >
        <div className="h-9 px-4 flex items-center justify-between shrink-0 select-none">
          <span className="text-[11px] font-medium text-foreground-subtle tracking-tight capitalize">{activeTab}</span>
          <div className="flex items-center gap-1">
            {activeTab === 'chat' && (
              <>
                <button 
                  onClick={() => setIsSidebarMinimized(true)}
                  className="hidden md:flex w-5 h-5 items-center justify-center text-foreground-subtle hover:text-white hover:bg-white/5 rounded-[2px] transition-all"
                  title="Minimize"
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={createNewProject}
                  className="w-5 h-5 flex items-center justify-center text-foreground-subtle hover:text-white hover:bg-white/5 rounded-[2px] transition-all"
                  title="New Project"
                >
                  <Plus size={14} />
                </button>
              </>
            )}
          </div>
        </div>


        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-white/[0.01] no-extension">
            <ChatList 
              messages={messages}
              isLoading={isLoading}
              chatContainerRef={chatContainerRef}
              handleScroll={handleScroll}
              chatEndRef={chatEndRef}
              theme={currentEditorTheme}
              themeName={editorThemeName}
              userName={userName}
              onEditAttachment={onEditAttachment}
              activePlatform={activePlatform}
              getPlatformConfig={getPlatformConfig}
            />

            <div className="px-6 pt-4 pb-2 border-t border-white/5 bg-sidebar">
              <div className="relative group max-w-4xl mx-auto">
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {pendingAttachments.map((att, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded text-[10px] text-blue-400">
                          <div 
                            className="flex items-center gap-2 cursor-pointer hover:text-blue-300"
                            onClick={() => setEditingAttachment({ attachment: att, index: idx, isPending: true })}
                          >
                            <Files size={10} />
                            <span className="truncate max-w-[100px]">{att.name}</span>
                          </div>
                          <button onClick={() => removeAttachment(idx)} className="hover:text-red-400 ml-1">
                            <Trash2 size={10} />
                          </button>
                        </div>
                        {previewPendingIdx === idx && (
                          <div className="mt-1 p-1 bg-black/40 border border-white/10 rounded overflow-hidden max-w-[200px] relative">
                            {att.type.startsWith('image/') ? (
                              <img 
                                src={att.content} 
                                alt={att.name} 
                                className="w-full h-auto rounded block"
                                referrerPolicy="no-referrer"
                                style={{ maxHeight: '150px', objectFit: 'contain' }}
                              />
                            ) : (
                              <pre className="text-[8px] font-mono text-white/50 whitespace-pre-wrap break-all max-h-[100px] overflow-y-auto custom-scrollbar p-1" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                                {att.content}
                              </pre>
                            )}
                            <button 
                              onClick={() => setPreviewPendingIdx(null)}
                              className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white/70 hover:text-white"
                            >
                              <Plus size={10} className="rotate-45" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 w-10 flex items-center justify-center bg-[#3e3e42] hover:bg-[#4d4d52] text-white transition-all active:scale-90 shrink-0 rounded-[2px]"
                    title="Upload File"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    multiple
                  />
                  <div className="relative flex-1">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        // Enter to send disabled per user request
                      }}
                      placeholder={placeholderText}
                      className="w-full bg-foreground/[0.02] border-2 border-[#3b82f6] rounded-none py-4 px-6 pr-14 text-sm font-roboto focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all resize-none min-h-[60px] max-h-[500px] overflow-y-auto text-foreground/90 placeholder:text-foreground/20 placeholder:text-[12px] hide-scrollbar"
                      rows={1}
                    />
                    {isLoading ? (
                      <button 
                        onClick={handleStop}
                        className="absolute bottom-3 right-3 h-8 w-8 flex items-center justify-center bg-[#3e3e42] hover:bg-[#4d4d52] text-white rounded-[2px] cursor-pointer transition-all active:scale-90"
                        title="Stop"
                      >
                        <div className="w-2.5 h-2.5 bg-white rounded-sm" />
                      </button>
                    ) : (
                      <button 
                        onClick={handleSend}
                        disabled={isLoading || (!input.trim() && pendingAttachments.length === 0)}
                        className={`absolute bottom-3 right-3 h-8 w-8 flex items-center justify-center bg-[#007ACC] text-white rounded-[2px] cursor-pointer transition-all active:scale-90 ${
                          isLoading || (!input.trim() && pendingAttachments.length === 0) ? 'opacity-10 grayscale pointer-events-none' : 'hover:bg-[#006BB3]'
                        }`}
                      >
                        <ArrowUp size={18} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'projects' ? (
          <div className="flex-1 flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.25em]">Project Manager</span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-foreground/80">Workspace Apps</span>
                  <span className="bg-accent/15 text-accent text-[9px] px-2 py-0.5 rounded-full font-bold tabular-nums border border-accent/20">{projects.length}</span>
                </div>
              </div>
              <button 
                onClick={createNewProject}
                className="w-8 h-8 flex items-center justify-center hover:bg-accent hover:text-white text-foreground/40 hover:text-foreground rounded-[4px] transition-all bg-white/5 border border-white/5 shadow-sm"
                title="New Application"
              >
                <Codicon name="add" size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 gap-3 grayscale">
                  <Codicon name="folder" size={48} />
                  <span className="text-[13px] font-medium tracking-tight">No applications found</span>
                </div>
              ) : projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => switchProject(project.id)}
                  className={`w-full bg-[#181818] border rounded-lg p-4 flex gap-4 transition-all group cursor-pointer relative ${
                    activeProjectId === project.id 
                      ? 'border-accent/40 shadow-[0_4px_16px_rgba(0,122,204,0.15)] ring-1 ring-accent/20' 
                      : 'border-[#2d2d2d] hover:bg-[#2a2d2e] hover:border-[#444]'
                  }`}
                >
                  <div className={`w-[50px] h-[50px] rounded-md flex items-center justify-center shrink-0 bg-[#252525] border border-[#2d2d2d] transition-transform duration-300 ${activeProjectId === project.id ? 'scale-105 border-accent/30' : 'group-hover:scale-105'}`}>
                    <svg width="34" height="34" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <rect x="10" y="10" width="80" height="80" rx="12" fill="none" stroke={activeProjectId === project.id ? "var(--color-accent)" : "#555"} strokeWidth="4" />
                      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="24" fill={activeProjectId === project.id ? "var(--color-accent)" : "#ffffff"}>RX</text>
                    </svg>
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex flex-col gap-1">
                      {editingProjectId === project.id ? (
                        <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={e => setEditNameValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && saveRename(e as any, project.id)}
                            autoFocus
                            className="bg-[#252526] border border-accent/40 rounded px-2.5 py-1.5 text-sm w-full focus:outline-none focus:ring-1 focus:ring-accent/50 text-white"
                          />
                          <button onClick={e => saveRename(e, project.id)} className="bg-accent text-white p-1.5 rounded hover:brightness-110 shrink-0">
                            <Codicon name="check" size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className={`text-[15px] font-medium tracking-wide truncate ${activeProjectId === project.id ? 'text-white' : 'text-[#cccccc]'}`}>
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-3 font-mono text-[11px] text-[#858585] tracking-tight">
                            <span className="flex items-center gap-1.5 shrink-0">
                              {new Date(project.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="shrink-0">{new Date(project.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                          </div>
                          {project.messages && project.messages.length > 0 && (
                            <div className="mt-2 text-[11px] text-[#858585] italic truncate max-w-full flex items-center gap-1.5 opacity-60">
                              <Codicon name="comment" size={10} />
                              {project.messages[0].content}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mt-3 overflow-hidden">
                            <button 
                              onClick={(e) => { e.stopPropagation(); startRenaming(e, project); }}
                              className="px-3 py-1.5 bg-[#2d2d2d] border border-[#2d2d2d] text-[#cccccc] text-[11px] rounded hover:bg-[#444] hover:text-white transition-all flex items-center gap-1.5"
                            >
                              <Codicon name="edit" size={12} />
                              Edit
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setProjectToDeleteId(project.id); setDeleteConfirmName(''); }}
                              className="px-3 py-1.5 bg-[#2d2d2d] border border-[#2d2d2d] text-[#cccccc] text-[11px] rounded hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all flex items-center gap-1.5"
                            >
                              <Codicon name="trash" size={12} />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {activeProjectId === project.id && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-accent rounded-l shadow-[0_0_12px_rgba(0,122,204,0.5)]" />
                  )}
                </div>
              ))}
            </div>

            {/* Custom Delete Modal */}
            {projectToDeleteId && (
              <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-[2px]"
                onClick={() => setProjectToDeleteId(null)}
              >
                <div 
                  className="bg-[#1e1e1e] border border-[#2d2d2d] w-[90%] max-w-[350px] p-6 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in duration-200"
                  onClick={e => e.stopPropagation()}
                >
                  <h2 className="text-[16px] font-semibold text-white mb-3 tracking-wide">Delete Project</h2>
                  <p className="text-[13px] text-[#858585] mb-4 leading-relaxed">
                    To confirm, type <span className="font-bold text-white bg-[#333] px-2 py-0.5 rounded text-[12px]">{projects.find(p => p.id === projectToDeleteId)?.name}</span> in the box below.
                  </p>
                  
                  <input
                    type="text"
                    placeholder="Type name here..."
                    value={deleteConfirmName}
                    onChange={e => setDeleteConfirmName(e.target.value)}
                    className="w-full bg-[#252526] border border-[#2d2d2d] text-white px-3 py-2.5 rounded outline-none focus:border-accent transition-colors text-[13px] mb-6"
                    autoFocus
                  />
                  
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setProjectToDeleteId(null)}
                      className="px-4 py-2 text-[#858585] hover:text-white text-[12px] font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={deleteConfirmName !== projects.find(p => p.id === projectToDeleteId)?.name}
                      onClick={(e) => deleteProject(e, projectToDeleteId)}
                      className={`px-5 py-2 rounded text-[12px] font-semibold transition-all ${
                        deleteConfirmName === projects.find(p => p.id === projectToDeleteId)?.name
                          ? 'bg-[#f85149] text-white hover:brightness-110 active:scale-95'
                          : 'bg-transparent border border-[#f85149]/30 text-[#f85149]/40 cursor-not-allowed opacity-50'
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01] flex justify-center items-center">
              <span className="text-[11px] text-foreground/20 font-medium tracking-tight">Your created project will appear here.</span>
            </div>
          </div>
        ) : activeTab === 'byok' ? (
          <div className="flex-1 flex flex-col overflow-hidden" style={{ fontFamily: 'system-ui' }}>
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-normal text-foreground-subtle">Byok Hub</span>
              <ByokDropdown activePlatform={activePlatform} setActivePlatform={setActivePlatform} />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded text-[11px] text-blue-400/80 italic flex items-center gap-2 mb-2">
                Click settings button to see API provider
              </div>
              {activePlatform === 'gemini' ? (
                <section>
                  <h3 className="text-[12px] font-medium text-foreground-subtle tracking-tight mb-3">Gemini API configuration</h3>
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-[2px] mb-4">
                    <p className="text-xs text-[#cccccc] leading-relaxed">
                      Gemini is currently using the <span className="text-white font-medium">system default API key</span>. 
                      You don't need to provide your own key to start building.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      <span className="text-[10px] text-green-500 font-medium">Active and ready</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-foreground-muted">Select Model</label>
                    <select
                      value={geminiModel}
                      onChange={(e) => setGeminiModel(e.target.value)}
                      className="w-full bg-foreground/5 border border-border rounded p-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                    >
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast & Modern)</option>
                      <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Standard)</option>
                    </select>
                  </div>
                </section>
              ) : (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Key size={14} className="text-accent" />
                    <h3 className="text-[12px] font-medium text-foreground-subtle tracking-tight capitalize">
                      {activePlatform} API configuration
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded mb-4">
                    <p className="text-[10px] text-foreground-muted leading-relaxed">
                      Configure your {activePlatform} credentials to use it as the reasoning backend.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {activePlatform === 'custom' && (
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-foreground-muted">Base URL</label>
                        <input
                          type="text"
                          value={customBaseURL}
                          onChange={(e) => setCustomBaseURL(e.target.value)}
                          placeholder="https://api.example.com/v1"
                          className="w-full bg-foreground/5 border border-border rounded p-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-foreground-muted">Api Key</label>
                      <input
                        type="password"
                        value={
                          activePlatform === 'openai' ? openaiApiKey :
                          activePlatform === 'anthropic' ? anthropicApiKey :
                          activePlatform === 'siliconflow' ? siliconFlowApiKey :
                          activePlatform === 'deepseek' ? deepseekApiKey :
                          activePlatform === 'groq' ? groqApiKey :
                          activePlatform === 'mistral' ? mistralApiKey :
                          activePlatform === 'perplexity' ? perplexityApiKey :
                          activePlatform === 'together' ? togetherApiKey :
                          customApiKey
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activePlatform === 'openai') setOpenaiApiKey(val);
                          else if (activePlatform === 'anthropic') setAnthropicApiKey(val);
                          else if (activePlatform === 'siliconflow') setSiliconFlowApiKey(val);
                          else if (activePlatform === 'deepseek') setDeepseekApiKey(val);
                          else if (activePlatform === 'groq') setGroqApiKey(val);
                          else if (activePlatform === 'mistral') setMistralApiKey(val);
                          else if (activePlatform === 'perplexity') setPerplexityApiKey(val);
                          else if (activePlatform === 'together') setTogetherApiKey(val);
                          else setCustomApiKey(val);
                        }}
                        placeholder={`Enter ${activePlatform} Api Key`}
                        className="w-full bg-foreground/5 border border-border rounded p-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-foreground-muted">Model Name</label>
                      <input
                        type="text"
                        value={
                          activePlatform === 'openai' ? openaiModel :
                          activePlatform === 'anthropic' ? anthropicModel :
                          activePlatform === 'siliconflow' ? siliconFlowModel :
                          activePlatform === 'deepseek' ? deepseekModel :
                          activePlatform === 'groq' ? groqModel :
                          activePlatform === 'mistral' ? mistralModel :
                          activePlatform === 'perplexity' ? perplexityModel :
                          activePlatform === 'together' ? togetherModel :
                          customModel
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activePlatform === 'openai') setOpenaiModel(val);
                          else if (activePlatform === 'anthropic') setAnthropicModel(val);
                          else if (activePlatform === 'siliconflow') setSiliconFlowModel(val);
                          else if (activePlatform === 'deepseek') setDeepseekModel(val);
                          else if (activePlatform === 'groq') setGroqModel(val);
                          else if (activePlatform === 'mistral') setMistralModel(val);
                          else if (activePlatform === 'perplexity') setPerplexityModel(val);
                          else if (activePlatform === 'together') setTogetherModel(val);
                          else setCustomModel(val);
                        }}
                        placeholder="e.g., gpt-4o, claude-3-5-sonnet, etc."
                        className="w-full bg-foreground/5 border border-border rounded p-2 text-xs text-foreground focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        ) : activeTab === 'extensions' ? (
          <div className="flex-1 flex flex-col overflow-hidden extension-sidebar extension-controlled">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.25em]">UX Enhancers</span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-foreground/80">Marketplace</span>
                  <span className="bg-orange-500/15 text-orange-400 text-[9px] px-2 py-0.5 rounded-full font-bold tabular-nums border border-orange-500/20">{marketplaceExtensions.length}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/5 text-zinc-400 hover:text-white rounded-[2px] transition-all"
                  title={docLanguage === 'en' ? 'Upload Custom Extension' : 'কাস্টম এক্সটেনশন আপলোড করুন'}
                >
                  <UploadCloud size={14} />
                </button>
                <button 
                  onClick={() => setDocLanguage(prev => prev === 'en' ? 'bn' : 'en')}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/5 text-zinc-400 hover:text-white rounded-[2px] transition-all"
                  title="Documentation Language / নথিপত্রের ভাষা"
                >
                  <Languages size={14} />
                  <span className="text-[8px] ml-0.5 font-bold">{docLanguage.toUpperCase()}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/5 text-zinc-400 hover:text-white rounded-[2px] transition-all"
                >
                  <Codicon name="close" size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 mb-4">
                <div className="flex items-start gap-2">
                  <BookOpen size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[12px] font-bold text-blue-400 mb-1">
                      {docLanguage === 'en' ? 'Extension Guide' : 'এক্সটেনশন গাইড'}
                    </h4>
                    <p className="text-[10px] text-blue-300/80 leading-relaxed">
                      {docLanguage === 'en' 
                        ? 'Extensions can change fonts, colors, and UI elements. ReversX Chat tab is protected and remains original.' 
                        : 'এক্সটেনশনগুলি ফন্ট, রঙ এবং UI উপাদান পরিবর্তন করতে পারে। ReversX চ্যাট ট্যাব সুরক্ষিত এবং আসল থাকে।'}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => setShowDocModal(true)}
                        className="text-[9px] font-bold underline hover:text-blue-200"
                      >
                        {docLanguage === 'en' ? 'Read Full Guide Online' : 'অনলাইনে সম্পূর্ণ গাইড পড়ুন'}
                      </button>
                      <button 
                        onClick={() => {
                          const content = docLanguage === 'en' ? `ReversX Extension Documentation Master Guide...` : `ReversX এক্সটেনশন মাস্টার গাইড...`;
                          const blob = new Blob([content], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'EXTENSIONS_GUIDE.md';
                          a.click();
                        }}
                        className="text-[9px] font-bold border-l border-blue-500/30 pl-3 underline hover:text-blue-200"
                      >
                        {docLanguage === 'en' ? 'Download .md' : '.md ডাউনলোড'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Marketplace Section */}
                <div>
                  <h5 className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Zap size={10} className="text-orange-500" />
                    {docLanguage === 'en' ? 'Community Marketplace' : 'কমিউনিটি মার্কেটপ্লেস'}
                  </h5>
                  <div className="space-y-3">
                    {marketplaceExtensions.map((ext) => (
                      <div 
                        key={ext.id}
                        className={`p-3 rounded-lg border transition-all ${activeExtensionId === ext.id ? 'bg-orange-500/5 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
                            {ext.icon === 'zap' ? <Zap size={20} /> : ext.icon === 'sun' ? <Sun size={20} /> : <Monitor size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[12px] font-bold text-white truncate">{ext.name}</h4>
                              <span className="text-[10px] text-zinc-500">v{ext.version}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1 leading-normal">{ext.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-[9px] text-zinc-500 italic">by {ext.author}</span>
                              <button 
                                onClick={() => handleInstallExtension(ext)}
                                className={`px-4 py-1.5 rounded-[2px] text-[10px] font-bold transition-all ${activeExtensionId === ext.id ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-accent text-white hover:shadow-[0_0_10px_rgba(var(--color-accent),0.3)]'}`}
                              >
                                {activeExtensionId === ext.id 
                                  ? (docLanguage === 'en' ? 'Enabled' : 'সক্রিয়') 
                                  : (docLanguage === 'en' ? 'Enable' : 'সক্রিয় করুন')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Installed Section */}
                {installedExtensions.length > 0 && (
                  <div className="pt-4 border-t border-white/5">
                    <h5 className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Blocks size={10} className="text-blue-500" />
                      {docLanguage === 'en' ? 'My Extensions' : 'আমার এক্সটেনশনসমূহ'}
                    </h5>
                    <div className="space-y-2">
                      {installedExtensions.map((ext) => (
                        <div 
                          key={ext.id}
                          className={`p-2.5 rounded border transition-all flex items-center justify-between gap-3 ${activeExtensionId === ext.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div 
                              className="w-1.5 h-1.5 rounded-full shrink-0" 
                              style={{ backgroundColor: ext.theme?.accent || '#888' }}
                            />
                            <div className="min-w-0">
                              <h4 className="text-[11px] font-medium text-white truncate">{ext.name}</h4>
                              <p className="text-[9px] text-zinc-500 truncate">{ext.author || 'Custom'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setActiveExtensionId(activeExtensionId === ext.id ? null : ext.id)}
                              className={`px-2 py-1 text-[9px] font-bold rounded-[2px] transition-all border ${activeExtensionId === ext.id ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white hover:bg-white/10'}`}
                            >
                              {activeExtensionId === ext.id 
                                ? (docLanguage === 'en' ? 'Disable' : 'নিষ্ক্রিয়') 
                                : (docLanguage === 'en' ? 'Enable' : 'সক্রিয়')}
                            </button>
                            <button
                              onClick={() => {
                                setInstalledExtensions(prev => prev.filter(e => e.id !== ext.id));
                                if (activeExtensionId === ext.id) setActiveExtensionId(null);
                              }}
                              className="w-6 h-6 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeExtensionId && (
                <div className="pt-4 mt-4 border-t border-white/5">
                  <button 
                    onClick={() => setActiveExtensionId(null)}
                    className="w-full py-2 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 hover:text-red-300 transition-all font-bold uppercase tracking-widest"
                  >
                    {docLanguage === 'en' ? 'Clear Active Extension' : 'সক্রিয় এক্সটেনশন সরান'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'settings' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-normal text-foreground-subtle">Settings</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
              <section>
                <h3 className="text-[11px] font-bold text-[#f0f0f0] tracking-normal mb-3 leading-[17px]">App theme</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(APP_THEMES).map((themeName) => (
                    <button
                      key={themeName}
                      onClick={() => setAppThemeName(themeName)}
                      className={`flex flex-col gap-2 p-3 rounded-[2px] border transition-all ${appThemeName === themeName ? 'bg-accent border-accent text-accent-foreground' : 'bg-foreground/5 border-transparent text-foreground-muted hover:bg-foreground/10'}`}
                    >
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ background: APP_THEMES[themeName].background }} />
                        <div className="w-3 h-3 rounded-full" style={{ background: APP_THEMES[themeName].accent }} />
                      </div>
                      <span className="text-[8px] font-normal truncate w-full text-right border-[#3a00c9] font-['Georgia'] underline italic">{themeName}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[12px] font-bold text-accent tracking-normal mb-3">Icon theme</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(ICON_THEMES).map((themeName) => {
                    const PreviewIcon = ICON_THEMES[themeName].Files;
                    return (
                      <button
                        key={themeName}
                        onClick={() => setIconThemeName(themeName)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-[2px] border transition-all ${iconThemeName === themeName ? 'bg-accent border-accent text-accent-foreground' : 'bg-foreground/5 border-transparent text-foreground-muted hover:bg-foreground/10'}`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground/5">
                          <PreviewIcon size={16} />
                        </div>
                        <span className="text-[10px] font-normal truncate w-full text-center">{themeName}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h3 className="text-[12px] font-bold text-accent tracking-normal mb-3">Editor settings</h3>
                <div className="space-y-4 px-1">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-foreground-muted">
                      <label>Font Size</label>
                      <span>{editorFontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="30" 
                      value={editorFontSize} 
                      onChange={(e) => setEditorFontSize(parseInt(e.target.value))}
                      className="w-full accent-accent bg-foreground/5 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-foreground-muted tracking-tight">Code font</label>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
                        { name: 'Fira Code', value: '"Fira Code", monospace' },
                        { name: 'Inter', value: '"Inter", sans-serif' },
                        { name: 'Roboto Mono', value: '"Roboto Mono", monospace' },
                        { name: 'Cascadia Code', value: '"Cascadia Code", monospace' },
                        { name: 'Courier New', value: '"Courier New", Courier, monospace' }
                      ].map((f) => (
                        <button
                          key={f.name}
                          onClick={() => setEditorFontFamily(f.value)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded transition-all text-[11px] ${editorFontFamily === f.value ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-foreground/5 text-foreground-subtle border border-transparent hover:bg-foreground/10'}`}
                        >
                          <span style={{ fontFamily: f.value }}>{f.name}</span>
                          {editorFontFamily === f.value && <Check size={10} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-foreground-muted tracking-tight">Split screen (Desktop)</label>
                    <button 
                      onClick={() => setIsSplitScreen(!isSplitScreen)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${isSplitScreen ? 'bg-accent' : 'bg-foreground/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-accent-foreground transition-all ${isSplitScreen ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </section>


            </div>
          </div>
        ) : activeTab === 'friends' ? (
          <FriendsTab />
        ) : activeTab === 'search' ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-sidebar">
            <div className="p-4 border-b border-white/5">
              <h2 className="text-[11px] font-bold text-foreground-subtle tracking-normal mb-4">Search</h2>
              <div className="space-y-2">
                <div className="relative">
                  <input 
                    type="text"
                    value={globalSearchQuery}
                    onChange={(e) => {
                      setGlobalSearchQuery(e.target.value);
                      handleGlobalSearch(e.target.value);
                    }}
                    placeholder="Search"
                    className="w-full bg-white/5 border border-white/10 rounded-[2px] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                  />
                  <div className="absolute right-2 top-1.5 flex items-center gap-1">
                    <button 
                      onClick={() => setGlobalSearchOptions(prev => ({ ...prev, caseSensitive: !prev.caseSensitive }))}
                      className={`p-0.5 rounded ${globalSearchOptions.caseSensitive ? 'bg-accent text-white' : 'text-white/70 hover:text-white/85'}`}
                      title="Match Case"
                    >
                      <span className="text-[10px] font-bold px-0.5">Ab</span>
                    </button>
                    <button 
                      onClick={() => setGlobalSearchOptions(prev => ({ ...prev, wholeWord: !prev.wholeWord }))}
                      className={`p-0.5 rounded ${globalSearchOptions.wholeWord ? 'bg-accent text-white' : 'text-white/70 hover:text-white/85'}`}
                      title="Match Whole Word"
                    >
                      <span className="text-[10px] font-bold px-0.5">W</span>
                    </button>
                    <button 
                      onClick={() => setGlobalSearchOptions(prev => ({ ...prev, useRegex: !prev.useRegex }))}
                      className={`p-0.5 rounded ${globalSearchOptions.useRegex ? 'bg-accent text-white' : 'text-white/70 hover:text-white/85'}`}
                      title="Use Regular Expression"
                    >
                      <span className="text-[10px] font-bold px-0.5">.*</span>
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={globalReplaceQuery}
                    onChange={(e) => setGlobalReplaceQuery(e.target.value)}
                    placeholder="Replace"
                    className="flex-1 bg-white/5 border border-white/10 rounded-[2px] px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                  />
                  <button 
                    onClick={handleGlobalReplaceAll}
                    className="px-2 py-1 bg-white/5 border border-white/10 rounded-[2px] text-[10px] text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    title="Replace All"
                  >
                    Replace All
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {globalSearchResults.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white/20">
                  <Search size={32} strokeWidth={1} className="mb-2 opacity-20" />
                  <p className="text-[11px]">No results found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {globalSearchResults.map((result, rIdx) => (
                    <div key={rIdx} className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-medium text-white/60 bg-white/5 rounded">
                        <Files size={10} />
                        <span className="truncate">{result.filename}</span>
                        <span className="ml-auto text-[10px] opacity-40">{result.matches.length}</span>
                      </div>
                      <div className="space-y-[1px]">
                        {result.matches.map((match, mIdx) => (
                          <div 
                            key={mIdx}
                            onClick={() => {
                              setActiveFile(result.filename);
                              setMobileView('editor');
                            }}
                            className="group flex items-start gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-all"
                          >
                            <span className="text-[10px] font-mono text-white/20 mt-0.5 min-w-[20px]">{match.line}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-white/60 font-mono truncate leading-tight">
                                {match.text}
                              </p>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGlobalReplace(result.filename, globalSearchQuery, globalReplaceQuery);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded text-white transition-all shadow-lg"
                            >
                              <Edit3 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-[12px] md:text-sm text-accent/30 font-sans tracking-tight text-center mt-20 opacity-50">
            {String(activeTab).charAt(0).toUpperCase() + String(activeTab).slice(1)} is currently offline
          </div>
        )}
      </div>

      {/* Resizer Handle */}
      {!isSidebarMinimized && activeTab !== 'friends' && (
        <div 
          onMouseDown={startResizing}
          onTouchStart={startResizing}
          className={`hidden md:block w-6 -mx-3 bg-transparent cursor-col-resize transition-all z-[100] relative group ${isResizing ? 'bg-accent/5' : ''} touch-none`}
          title="Drag to resize sidebar"
        >
          {/* Vertical divider line */}
          <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-border group-hover:bg-accent/50 transition-colors ${isResizing ? 'bg-accent' : ''}`} />
          
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[10px] bg-accent/0 group-hover:bg-accent/10 transition-all blur-md" />
        </div>
      )}

      {/* Resize Overlays */}
      {(isResizing || isResizingExplorer) && (
        <div 
          className="fixed inset-0 z-[9999] cursor-col-resize bg-transparent"
        />
      )}

      {/* Main Content Area */}
      <div className={`
        ${mobileView !== 'chat' ? 'flex flex-1' : 'hidden'} 
        md:flex md:flex-1 flex-col bg-background overflow-hidden relative extension-controlled
      `}>
        {isSidebarMinimized && (
          <button
            onClick={() => setIsSidebarMinimized(false)}
            className="hidden md:flex absolute top-1/2 left-0 transform -translate-y-1/2 z-[60] w-6 h-12 bg-sidebar hover:bg-foreground/10 border border-border border-l-0 rounded-r-[2px] items-center justify-center text-foreground-muted transition-all shadow-xl"
            title="Expand Sidebar"
          >
            <ChevronRight size={14} />
          </button>
        )}
        {/* Main Editor/Preview Container */}
        <div className={`flex-1 relative overflow-hidden bg-background flex flex-col md:pt-0 pt-2 extension-editor ${activeTab === 'friends' ? 'hidden' : ''}`}>
          {(!showPreview && mobileView !== 'preview') ? (
            <div className="flex-1 flex font-sans overflow-hidden">
              {/* VS Code Style File Explorer */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`flex flex-col bg-[#252526] border-r border-[#1e1e1e] transition-all duration-300 ease-in-out overflow-hidden
                  ${isExplorerOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}
                  ${isDragging ? 'ring-2 ring-accent ring-inset bg-accent/5' : ''}
                  fixed md:relative inset-y-0 left-0 z-[60] md:z-auto md:opacity-100 md:pointer-events-auto
                `}
              >
                {isDragging && (
                  <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-accent/10 backdrop-blur-[2px] pointer-events-none border-2 border-dashed border-accent/40 m-2 rounded-lg">
                    <PlusIcon className="text-accent mb-2" size={24} />
                    <span className="text-[10px] font-extrabold text-accent tracking-[0.2em] uppercase">Drop to Import</span>
                  </div>
                )}
                <div className="h-9 flex items-center justify-between px-4 bg-[#252526] shrink-0 select-none">
                  <span className="text-[11px] font-medium text-foreground-subtle tracking-tight capitalize">Explorer</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleOpenLocalFile}
                      className="p-1 hover:bg-white/5 rounded-[2px] text-zinc-400 hover:text-white transition-colors"
                      title="Open Local File"
                    >
                      <FolderOpen size={14} />
                    </button>
                    <button 
                      onClick={handleUploadImage}
                      className="p-1 hover:bg-white/5 rounded-[2px] text-zinc-400 hover:text-white transition-colors"
                      title="Upload Image"
                    >
                      <ImageIcon size={14} />
                    </button>
                    <button 
                      onClick={handleGithubImport}
                      className="p-1 hover:bg-white/5 rounded-[2px] text-zinc-400 hover:text-white transition-colors"
                      title="Import from GitHub"
                    >
                      <Github size={14} />
                    </button>
                    <button 
                      onClick={handleGithubExport}
                      className="p-1 hover:bg-white/5 rounded-[2px] text-zinc-400 hover:text-white transition-colors"
                      title="Push to GitHub"
                    >
                      <Share2 size={14} />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setIsExplorerCreateMenuOpen(!isExplorerCreateMenuOpen)}
                        className={`p-1 hover:bg-white/5 rounded-[2px] transition-colors ${isExplorerCreateMenuOpen ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
                        title="New File/Folder"
                      >
                        <Plus size={14} />
                      </button>
                      
                      <AnimatePresence>
                        {isExplorerCreateMenuOpen && (
                          <>
                            <div className="fixed inset-0 z-[70]" onClick={() => setIsExplorerCreateMenuOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute right-0 top-full mt-1 w-32 bg-[#252526] border border-[#454545] rounded-[4px] shadow-xl z-[80] overflow-hidden py-1"
                            >
                              <button 
                                onClick={handleCreateFile}
                                className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-[11px] text-[#cccccc] hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <FilePlus size={12} strokeWidth={2.5} />
                                <span>New File</span>
                              </button>
                              <button 
                                onClick={handleCreateFolder}
                                className="w-full px-3 py-1.5 flex items-center gap-2 text-left text-[11px] text-[#cccccc] hover:bg-white/5 hover:text-white transition-colors"
                              >
                                <FolderPlus size={12} strokeWidth={2.5} />
                                <span>New Folder</span>
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar bg-[#252526]">
                  <div className="px-3 py-1.5 flex items-center justify-between text-[#cccccc] hover:bg-[#2a2d2e] cursor-pointer group mb-1 transition-colors">
                    <div className="flex items-center gap-1.5 font-bold text-[10px] tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                      <ChevronDownIcon size={14} className="text-[#cccccc]" />
                      <span>REVERSX PROJECT</span>
                    </div>
                  </div>

                  <div className="space-y-[1px]">
                    {(() => {
                      const root = buildFileTree(Object.keys(files));
                      return Object.values(root.children).sort((a: any, b: any) => {
                        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                        return a.name.localeCompare(b.name);
                      }).map((child: any) => (
                        <FileTreeItem 
                          key={child.path}
                          node={child}
                          activeFile={activeFile}
                          activeFileMenu={activeFileMenu}
                          handleFileOpen={(name) => {
                            handleFileOpen(name);
                            if (window.innerWidth < 768) setIsExplorerOpen(false);
                          }}
                          setActiveFileMenu={setActiveFileMenu}
                          handleRenameFile={handleRenameFile}
                          handleDeleteFile={handleDeleteFile}
                          depth={0}
                        />
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Explorer Overlay Backdrop for Mobile */}
              {isExplorerOpen && (
                <div 
                  onClick={() => setIsExplorerOpen(false)}
                  className="fixed inset-0 bg-black/50 z-50 md:hidden animate-in fade-in duration-300"
                />
              )}

              {/* Explorer Resizer Handle */}
              {isExplorerOpen && (
                <div 
                  onMouseDown={startResizingExplorer}
                  onTouchStart={startResizingExplorer}
                  className={`hidden md:block w-4 -mx-2 bg-transparent cursor-col-resize transition-all z-20 relative group ${isResizingExplorer ? 'bg-accent/5' : ''} touch-none`}
                  title="Drag to resize explorer"
                >
                  <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-white/5 group-hover:bg-accent/40 transition-colors ${isResizingExplorer ? 'bg-accent/60' : ''}`} />
                </div>
              )}

              {/* Main Editor Area */}
              <div id="main-editor-container" className="flex-1 flex overflow-hidden bg-[#0d0d0d] relative">
                <div className="flex-1 flex flex-row overflow-hidden border-r border-[#1e1e1e]">
                  {editorPanes.map((paneFile, idx) => (
                    <React.Fragment key={idx}>
                      <div 
                        className={`flex flex-col overflow-hidden relative z-10 transition-shadow ${focusedPaneIndex === idx ? 'ring-1 ring-accent/30 shadow-[0_0_20px_rgba(0,255,65,0.05)]' : ''}`}
                        style={{ width: `${paneWidths[idx]}%` }}
                        onClickCapture={() => setFocusedPaneIndex(idx)}
                      >
                        <MemoizedCodeEditor 
                          code={files[paneFile]?.code || ''} 
                          language={files[paneFile]?.language || 'text'} 
                          filename={paneFile}
                          allFiles={files}
                          activeFiles={openFiles}
                          onFileSelect={(name) => setPaneFile(idx, name)}
                          onCloseFile={(name) => {
                            if (editorPanes.length > 1) {
                              handleClosePane(idx);
                            } else {
                              handleFileClose(name);
                            }
                          }}
                          fontSize={editorFontSize}
                          fontFamily={editorFontFamily}
                          splitScreen={isSplitScreen && editorPanes.length === 1}
                          isSplitPane={editorPanes.length > 1}
                          onToggleSplit={handleSplit}
                          onClosePane={() => handleClosePane(idx)}
                          onSetEditorTheme={setEditorThemeName}
                          editorThemeName={editorThemeName}
                          onChange={handleCodeChange}
                          onSaveToLocal={handleSaveToLocal}
                          onPlay={() => { setPreviewFiles(files); setShowPreview(true); setMobileView('preview'); }}
                          onShowPreview={(show) => { setShowPreview(show); setMobileView(show ? 'preview' : 'editor'); }}
                          onOpenFull={handleOpenInNewTab}
                          onShowSettings={() => { setMobileView('chat'); setActiveTab('settings'); }}
                          onBackToChat={() => setMobileView('chat')}
                          onShowTerminal={() => {}} 
                          onMenuClick={() => setIsExplorerOpen(prev => !prev)}
                          onCreateFile={handleCreateFile}
                          onRenameFile={handleRenameFile}
                          onDeleteFile={handleDeleteFile}
                          byokConfig={byokConfig}
                          activePlatform={activePlatform}
                          appThemeName={appThemeName}
                          onShowHelp={() => setShowHelpModal(true)}
                          onShowQuickOpen={() => setShowQuickOpen(true)}
                          onShowCommandPalette={() => setShowCommandPalette(true)}
                          onShowShortcuts={() => setShowShortcutsModal(true)}
                          onSetActiveTab={(tab: any) => setActiveTab(tab)}
                        />
                      </div>
                      
                      {idx < editorPanes.length - 1 && (
                        <div 
                          onMouseDown={() => startResizingPane(idx)}
                          onTouchStart={() => startResizingPane(idx)}
                          className={`flex w-4 bg-transparent cursor-col-resize transition-all z-20 items-center justify-center group -mx-2 touch-none ${isResizingPane === idx ? 'bg-accent/5' : ''}`}
                          title="Drag to resize panes"
                        >
                          <div className={`h-full transition-all duration-150 ${isResizingPane === idx ? 'w-[2px] bg-[#007acc] shadow-[0_0_12px_rgba(0,122,204,0.6)]' : 'w-[1px] bg-[#1e1e1e] group-hover:bg-[#007acc]/40'}`} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {isSplitScreen && editorPanes.length === 1 && (
                  <div className="hidden md:flex flex-[0.8] flex-col bg-background border-l border-border relative text-foreground">
                    <div className="h-11 bg-background border-b border-border flex items-center px-4 justify-between shrink-0">
                      <span className="text-[10px] tracking-widest text-foreground-subtle font-bold">Split Preview</span>
                      <button 
                        onClick={() => setIsSplitScreen(false)}
                        className="text-foreground-subtle hover:text-foreground transition-colors"
                      >
                        <Plus size={16} className="rotate-45" />
                      </button>
                    </div>
                    <iframe
                      title="Split Preview"
                      srcDoc={combinedHtml}
                      className="flex-1 w-full border-none bg-white"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`h-full w-full relative md:pt-0 pt-10 flex flex-col items-center transition-all duration-500 ${previewDevice !== 'desktop' ? 'bg-[#121212] p-8 overflow-auto' : 'bg-white'} custom-scrollbar`}>
              <div className={`relative transition-all duration-500 shadow-2xl overflow-hidden shrink-0 flex flex-col items-center ${previewDevice === 'desktop' ? '' : 'my-auto'}`} style={{
                width: previewDevice === 'mobile' ? '375px' : previewDevice === 'laptop' ? '1024px' : '100%',
                height: previewDevice === 'mobile' ? '667px' : previewDevice === 'laptop' ? '640px' : '100%',
                maxWidth: previewDevice === 'desktop' ? '100%' : '95%',
                maxHeight: previewDevice === 'desktop' ? '100%' : 'calc(100% - 20px)',
                borderRadius: previewDevice === 'mobile' ? '40px' : previewDevice === 'laptop' ? '12px' : '0px',
                border: previewDevice === 'mobile' ? '12px solid #222' : previewDevice === 'laptop' ? '8px solid #333' : 'none',
                backgroundColor: 'white'
              }}>
                {previewDevice === 'mobile' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#222] rounded-b-2xl z-10 flex items-center justify-center">
                    <div className="w-12 h-1 bg-white/10 rounded-full" />
                  </div>
                )}
                <iframe
                  title="ReversX Preview"
                  srcDoc={combinedHtml}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
                />
              </div>

              {previewDevice === 'laptop' && (
                <div className="w-full max-w-[1040px] h-3 bg-[#444] rounded-b-2xl border-t border-white/10 shadow-xl shrink-0 -mt-2 z-10 hidden lg:block" />
              )}
              
              {/* Floating Action Controls in Preview */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-[60]">
                <div className="relative">
                  <button 
                    onClick={() => setShowDeviceMenu(!showDeviceMenu)}
                    className="h-10 px-4 bg-black/60 hover:bg-black/80 text-white/90 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 transition-all shadow-lg group"
                  >
                    <MonitorSmartphone size={16} className="text-accent group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold tracking-widest hidden md:block">Device's</span>
                  </button>
                  
                  <AnimatePresence>
                    {showDeviceMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-[65]" 
                          onClick={() => setShowDeviceMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full mt-2 right-0 bg-[#1a1a1b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-[70] min-w-[140px] backdrop-blur-xl"
                        >
                          {[
                            { id: 'mobile', label: 'Mobile', icon: Smartphone },
                            { id: 'laptop', label: 'Laptop', icon: Laptop },
                            { id: 'desktop', label: 'Desktop', icon: Monitor }
                          ].map((device) => (
                            <button
                              key={device.id}
                              onClick={() => {
                                setPreviewDevice(device.id as any);
                                setShowDeviceMenu(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-all ${
                                previewDevice === device.id 
                                  ? 'text-accent bg-accent/10 font-bold' 
                                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <device.icon size={14} />
                              <span className="text-[11px] tracking-wide">{device.label}</span>
                              {previewDevice === device.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_accent]" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => { setShowPreview(false); setMobileView('editor'); }}
                  className="h-10 px-4 bg-black/60 hover:bg-black/80 text-white/90 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2 transition-all shadow-lg"
                >
                  <ArrowLeftToLine size={16} />
                  <span className="text-[10px] font-bold tracking-widest hidden md:block">Back to Code</span>
                </button>
                <button 
                  onClick={() => setPreviewFiles({...files})}
                  className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white/90 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center transition-all shadow-lg"
                  title="Refresh"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={handleOpenInNewTab}
                  className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white/90 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center transition-all shadow-lg"
                  title="Full Screen"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {isLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                  <div className="w-12 h-12 rounded-full border-4 border-accent border-t-transparent animate-spin mb-4" />
                  <div className="text-accent font-normal tracking-[0.2em] text-xs animate-pulse">
                    Loading assets...
                  </div>
                  <div className="text-white/40 text-[12px] mt-2 font-roboto">
                    Waiting for HTML, CSS, and JS to complete
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      {/* StatusBar */}
      <div className="h-6 border-t border-border bg-[#007acc] flex items-center px-3 justify-between text-[11px] font-medium text-white select-none shrink-0">
        <div className="flex items-center gap-4 h-full">
           <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full cursor-pointer transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-[#28a745]" />
              <span>Ready</span>
           </div>
           <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full cursor-pointer transition-colors">
              <GitBranch size={12} />
              <span>main*</span>
           </div>
        </div>
        <div className="flex items-center gap-3 h-full">
           <div className="hover:bg-white/10 px-2 h-full flex items-center cursor-pointer transition-colors">
             <Bell size={12} />
           </div>
        </div>
      </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`md:hidden h-14 border-t border-border bg-sidebar flex items-center px-4 overflow-x-auto hide-scrollbar gap-5 z-50 ${mobileView === 'chat' ? 'border-t-0' : ''}`}>
        <button 
          onClick={() => setMobileView('editor')}
          className={`flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-500/5 border border-blue-500/10 rounded-full transition-all ${mobileView === 'editor' ? 'text-accent border-accent/40' : 'text-foreground/75'}`}
        >
          <Code size={14} strokeWidth={1.5} />
          <span className="text-[7px] font-bold tracking-tighter">Code</span>
        </button>
        <button 
          onClick={() => setMobileView('preview')}
          className={`flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-500/5 border border-blue-500/10 rounded-full transition-all ${mobileView === 'preview' ? 'text-accent border-accent/40' : 'text-foreground/75'}`}
        >
          <Play size={14} strokeWidth={1.5} />
          <span className="text-[7px] font-bold tracking-tighter">Prev</span>
        </button>
        <button 
          onClick={() => { setMobileView('chat'); setActiveTab('chat'); }}
          className={`flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-500/5 border border-blue-500/10 rounded-full transition-all ${mobileView === 'chat' && activeTab === 'chat' ? 'text-accent border-accent/40' : 'text-foreground/75'}`}
        >
          <div className="relative">
            <MessageSquare size={14} strokeWidth={1.5} />
            {isLoading && <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-accent rounded-full animate-ping" />}
          </div>
          <span className="text-[7px] font-bold tracking-tighter">Chat</span>
        </button>
        <button 
          onClick={() => { setMobileView('chat'); setActiveTab('friends'); }}
          className={`flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-500/5 border border-blue-500/10 rounded-full transition-all ${mobileView === 'chat' && activeTab === 'friends' ? 'text-accent border-accent/40' : 'text-foreground/75'}`}
        >
          <Users size={14} strokeWidth={1.5} />
          <span className="text-[7px] font-bold tracking-tighter">Friends</span>
        </button>
        <button 
          onClick={() => { 
            if (mobileView === 'editor') {
              setIsExplorerOpen(!isExplorerOpen);
            } else {
              setMobileView('chat'); 
              setActiveTab('projects'); 
            }
          }}
          className={`flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-500/5 border border-blue-500/10 rounded-full transition-all ${(mobileView === 'chat' && activeTab === 'projects') || (mobileView === 'editor' && isExplorerOpen) ? 'text-accent border-accent/40' : 'text-foreground/85'}`}
        >
          <Files size={14} strokeWidth={1.5} />
          <span className="text-[7px] font-bold tracking-tighter">Apps</span>
        </button>
        <button 
          onClick={() => { setMobileView('chat'); setActiveTab('search'); }}
          className={`flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-500/5 border border-blue-500/10 rounded-full transition-all ${mobileView === 'chat' && activeTab === 'search' ? 'text-accent border-accent/40' : 'text-foreground/75'}`}
        >
          <Search size={14} strokeWidth={1.5} />
          <span className="text-[7px] font-bold tracking-tighter">Search</span>
        </button>
        <button 
          onClick={handleOpenInNewTab}
          className="flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-500/5 border border-blue-500/10 rounded-full transition-all text-foreground/75 hover:text-accent"
        >
          <Maximize2 size={14} strokeWidth={1.5} />
          <span className="text-[7px] font-bold tracking-tighter">Full</span>
        </button>
        <button 
          onClick={() => { setMobileView('chat'); setActiveTab('byok'); }}
          className={`flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-500/5 border border-blue-500/10 rounded-full transition-all ${mobileView === 'chat' && activeTab === 'byok' ? 'text-accent border-accent/40' : 'text-foreground/75'}`}
        >
          <Key size={14} strokeWidth={1.5} />
          <span className="text-[7px] font-bold tracking-tighter">Keys</span>
        </button>
        <button 
          onClick={() => { setMobileView('chat'); setActiveTab('settings'); }}
          className={`flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-blue-500/5 border border-blue-500/10 rounded-full transition-all ${mobileView === 'chat' && activeTab === 'settings' ? 'text-accent border-accent/40' : 'text-foreground/75'}`}
        >
          <Settings size={14} strokeWidth={1.5} />
          <span className="text-[7px] font-bold tracking-tighter">Set</span>
        </button>
        <button 
          onClick={() => { setMobileView('chat'); setActiveTab('extensions'); }}
          className={`flex flex-col items-center justify-center w-10 h-10 shrink-0 bg-orange-500/5 border border-orange-500/10 rounded-full transition-all ${mobileView === 'chat' && activeTab === 'extensions' ? 'text-orange-400 border-orange-400/40' : 'text-foreground/75'}`}
        >
          <Blocks size={14} strokeWidth={1.5} />
          <span className="text-[7px] font-bold tracking-tighter">Ext</span>
        </button>
      </div>

      {/* New File Modal */}
      <AnimatePresence>
        {showNewFileModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-lg p-6 shadow-2xl"
            >
              <h3 className="text-lg font-normal text-white mb-4">New File</h3>
              <input
                autoFocus
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmCreateFile();
                  if (e.key === 'Escape') setShowNewFileModal(false);
                }}
                placeholder="filename.js"
                className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent mb-6"
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowNewFileModal(false)}
                  className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4d4d52] text-white text-sm transition-colors rounded-[2px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmCreateFile}
                  className="px-6 py-2 bg-[#007ACC] hover:bg-[#006BB3] text-white text-sm font-medium rounded-[2px] transition-colors"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GitHub Export Modal */}
      <AnimatePresence>
        {isGithubExportOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-lg p-6 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Github size={20} className="text-white" />
                <h3 className="text-lg font-normal text-white">Push to GitHub</h3>
              </div>
              
              {!githubToken ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Github size={32} className="text-zinc-400" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Connect Your Account</h4>
                  <p className="text-[11px] text-zinc-400 mb-6 max-w-xs">Securely sign in to GitHub to push your projects directly to your repositories.</p>
                  <button 
                    onClick={handleGithubLogin}
                    className="w-full py-3 bg-white text-black hover:bg-zinc-200 text-sm font-bold rounded-[4px] transition-all flex items-center justify-center gap-2"
                  >
                    <Github size={18} />
                    Continue with GitHub
                  </button>
                  <button 
                    onClick={() => setIsGithubExportOpen(false)}
                    className="mt-4 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Maybe later
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-zinc-400 mb-4">You are connected. Configure your push settings below.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 ml-1">Repository (owner/repo)</label>
                      <input
                        type="text"
                        value={githubExportRepo}
                        onChange={(e) => setGithubExportRepo(e.target.value)}
                        placeholder="e.g. username/project-repo"
                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 ml-1">Branch</label>
                        <input
                          type="text"
                          value={githubBranch}
                          onChange={(e) => setGithubBranch(e.target.value)}
                          placeholder="main"
                          className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 ml-1">Commit Message</label>
                        <input
                          type="text"
                          value={githubCommitMessage}
                          onChange={(e) => setGithubCommitMessage(e.target.value)}
                          placeholder="Commit message"
                          className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
                    <button 
                      onClick={() => {
                        setGithubToken('');
                        idbSet('reversx_github_token', '');
                      }}
                      className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors uppercase font-bold tracking-widest"
                    >
                      Sign Out
                    </button>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsGithubExportOpen(false)}
                        className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4d4d52] text-white text-sm transition-colors rounded-[2px]"
                      >
                        Cancel
                      </button>
                      <button 
                        disabled={isGitHubExporting}
                        onClick={confirmGithubExport}
                        className={`px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-[2px] transition-colors flex items-center gap-2 ${isGitHubExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isGitHubExporting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Pushing...</span>
                          </>
                        ) : (
                          <span>Push Now</span>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GitHub Import Modal */}
      <AnimatePresence>
        {isGithubImportOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-lg p-6 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <Github size={20} className="text-white" />
                <h3 className="text-lg font-normal text-white">Import from GitHub</h3>
              </div>
              <p className="text-[11px] text-zinc-400 mb-4">Import public repository files into your project. Use owner/repo format.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 ml-1">Repository URL or Path</label>
                  <input
                    autoFocus
                    type="text"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmGithubImport();
                      if (e.key === 'Escape') setIsGithubImportOpen(false);
                    }}
                    placeholder="e.g. facebook/react or full URL"
                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 ml-1">Branch / Ref</label>
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setIsGithubImportOpen(false)}
                  className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4d4d52] text-white text-sm transition-colors rounded-[2px]"
                >
                  Cancel
                </button>
                <button 
                  disabled={isGitHubImporting}
                  onClick={confirmGithubImport}
                  className={`px-6 py-2 bg-[#007ACC] hover:bg-[#006BB3] text-white text-sm font-medium rounded-[2px] transition-colors flex items-center gap-2 ${isGitHubImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isGitHubImporting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Import</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Folder Modal */}
      <AnimatePresence>
        {showNewFolderModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-lg p-6 shadow-2xl"
            >
              <h3 className="text-lg font-normal text-white mb-4">New Folder</h3>
              <input
                autoFocus
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmCreateFolder();
                  if (e.key === 'Escape') setShowNewFolderModal(false);
                }}
                placeholder="folder_name"
                className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent mb-6"
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4d4d52] text-white text-sm transition-colors rounded-[2px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmCreateFolder}
                  className="px-6 py-2 bg-[#007ACC] hover:bg-[#006BB3] text-white text-sm font-medium rounded-[2px] transition-colors"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Documentation Modal */}
      <AnimatePresence>
        {showDocModal && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[85vh]"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <BookOpen size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-none">
                      {docLanguage === 'en' ? 'Master Guide' : 'মাস্টার গাইড'}
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Extension Development SDK</p>
                  </div>
                </div>
                <button onClick={() => setShowDocModal(false)} className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                  <Codicon name="close" size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/20">
                <div className="prose prose-invert prose-sm max-w-none space-y-10">
                  <section>
                    <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2 mb-4">
                      <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">1</span>
                      {docLanguage === 'en' ? 'The Foundation' : 'ভিত্তি'}
                    </h2>
                    <p className="text-zinc-300 leading-relaxed">
                      {docLanguage === 'en' 
                        ? 'ReversX Extensions are lightweight JSON manifests that let you inject system-wide themes and custom CSS injections. You can change every single pixel except for the ReversX Chat logic.'
                        : 'ReversX এক্সটেনশনগুলি হলো হালকা ওজনের JSON মেনিফেস্ট যা আপনাকে পুরো সিস্টেমে থিম এবং কাস্টম CSS ইনজেক্ট করতে দেয়। আপনি ReversX চ্যাট লজিক বাদে প্রতিটি পিক্সেল পরিবর্তন করতে পারেন।'}
                    </p>
                  </section>

                  <section className="bg-white/5 border border-white/10 rounded-lg p-5">
                    <h3 className="text-sm font-bold text-orange-400 mb-3 uppercase tracking-wider">UI Architecture Classes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <code className="text-accent text-[11px] font-bold">.extension-controlled</code>
                        <p className="text-[10px] text-zinc-400">Everything except the chat sidebar.</p>
                      </div>
                      <div className="space-y-1">
                        <code className="text-accent text-[11px] font-bold">.extension-sidebar</code>
                        <p className="text-[10px] text-zinc-400">The primary left activity/file area.</p>
                      </div>
                      <div className="space-y-1">
                        <code className="text-accent text-[11px] font-bold">.extension-editor</code>
                        <p className="text-[10px] text-zinc-400">The main code viewing/editing space.</p>
                      </div>
                      <div className="space-y-1 text-red-400">
                        <code className="text-[11px] font-bold line-through">.no-extension</code>
                        <p className="text-[10px]">Protected Area (Chat Tab).</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-green-400 flex items-center gap-2 mb-4">
                      <span className="w-6 h-6 rounded bg-green-500/20 text-green-400 flex items-center justify-center text-xs">2</span>
                      {docLanguage === 'en' ? 'Example JSON' : 'উদাহরণ JSON'}
                    </h2>
                    <pre className="p-4 bg-black/60 border border-white/5 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto text-green-300/80">
{`{
  "id": "neon-custom",
  "name": "Neon Master",
  "theme": {
    "background": "#000000",
    "foreground": "#00ff00",
    "accent": "#ff00ff",
    "sidebarBackground": "#050505",
    "editorBackground": "#020202",
    "fontFamily": "'JetBrains Mono'"
  },
  "styles": ".extension-controlled svg { filter: drop-shadow(0 0 2px #fff); }"
}`}
                    </pre>
                  </section>

                  <section>
                    <h2 className="text-xl font-bold text-orange-400 flex items-center gap-2 mb-4">
                      <span className="w-6 h-6 rounded bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs">3</span>
                      {docLanguage === 'en' ? 'Custom Icons & Fonts' : 'কাস্টম আইকন এবং ফন্ট'}
                    </h2>
                    <p className="text-zinc-300 leading-relaxed">
                      {docLanguage === 'en'
                        ? 'To use custom icons, you can override SVG colors in the "styles" field. For custom fonts, you can import any web font from Google or Adobe within the styles string.'
                        : 'কাস্টম আইকন ব্যবহার করতে, আপনি "styles" ফিল্ডে SVG রঙ ওভাররাইড করতে পারেন। কাস্টম ফন্টের জন্য, আপনি স্টাইল স্ট্রিংয়ের মধ্যে গুগল বা অ্যাডোব থেকে যেকোনো ওয়েব ফন্ট ইম্পোর্ট করতে পারেন।'}
                    </p>
                  </section>
                </div>
              </div>

              <div className="p-6 bg-black/40 border-t border-white/10 flex justify-between items-center">
                <p className="text-[11px] text-zinc-500 font-medium">Build v2.1.0-stable</p>
                <button 
                  onClick={() => setShowDocModal(false)}
                  className="px-8 py-2.5 bg-accent text-white font-bold text-xs rounded uppercase tracking-widest hover:bg-accent/80 transition-all"
                >
                  {docLanguage === 'en' ? 'Got it, let\'s build' : 'বুঝেছি, এবার তৈরি করি'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#1a1a1a] border border-white/10 rounded-lg p-6 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-normal text-white">
                  {docLanguage === 'en' ? 'Upload Extension' : 'এক্সটেনশন আপলোড করুন'}
                </h3>
                <button onClick={() => setShowUploadModal(false)} className="text-zinc-500 hover:text-white">
                  <Codicon name="close" size={20} />
                </button>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] text-zinc-400">
                  {docLanguage === 'en' 
                    ? 'Paste the Extension JSON object here. See the documentation for the schema.' 
                    : 'এখানে এক্সটেনশন JSON অবজেক্ট পেস্ট করুন। স্কিমার জন্য ডকুমেন্টেশন দেখুন।'}
                </p>
                <button 
                  onClick={() => setCustomExtJSON(JSON.stringify({
                    id: "custom-vibe-" + Math.floor(Math.random()*1000),
                    name: "My Custom Vibe",
                    theme: {
                      background: "#1a1a2e",
                      foreground: "#e94560",
                      accent: "#0f3460",
                      sidebarBackground: "#16213e",
                      editorBackground: "#1a1a2e",
                      fontFamily: "'Courier New', monospace"
                    },
                    styles: ".extension-root svg { color: #e94560 !important; }"
                  }, null, 2))}
                  className="text-[10px] text-accent hover:underline font-bold"
                >
                  {docLanguage === 'en' ? 'Load Example Template' : 'উদাহরণ টেমপ্লেট লোড করুন'}
                </button>
              </div>

              <textarea
                autoFocus
                value={customExtJSON}
                onChange={(e) => setCustomExtJSON(e.target.value)}
                placeholder='{ "id": "my-ext", "name": "...", "theme": { ... } }'
                className="flex-1 bg-black/40 border border-white/10 rounded p-3 text-[12px] font-mono text-white focus:outline-none focus:border-accent min-h-[300px] resize-none"
              />

              {uploadError && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-mono">
                  Error: {uploadError}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4d4d52] text-white text-sm transition-colors rounded-[2px]"
                >
                  {docLanguage === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button 
                  onClick={confirmUploadExtension}
                  className="px-6 py-2 bg-accent text-white text-sm font-medium rounded-[2px] transition-colors"
                >
                  {docLanguage === 'en' ? 'Install & Apply' : 'ইনস্টল এবং সেট করুন'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete File Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-lg p-6 shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2 text-center">Delete File?</h3>
              <p className="text-sm text-foreground/50 mb-6 text-center">
                Are you sure you want to permanently delete <span className="text-white font-bold">"{fileToDelete}"</span>? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={confirmDeleteFile}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors"
                >
                  Delete Permanently
                </button>
                <button 
                  onClick={() => { setShowDeleteModal(false); setFileToDelete(''); }}
                  className="w-full py-2.5 bg-[#3e3e42] hover:bg-[#4d4d52] text-white text-sm transition-colors rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help & Documentation Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1e1e1e] border border-white/10 w-full max-w-2xl max-h-[85vh] rounded-xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#1e1e1e] z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-semibold text-white tracking-tight">About This AI IDE</h2>
                    <p className="text-[11px] text-foreground/40 font-medium uppercase tracking-widest mt-0.5">Comprehensive User Guide</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-foreground/30 hover:text-white transition-all"
                >
                  <Codicon name="close" size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-xl mx-auto space-y-10">
                  
                  <section>
                    <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-4">Introduction</h3>
                    <p className="text-[14px] text-foreground/70 leading-relaxed">
                      Welcome to your modern AI-powered development environment. This IDE is designed to turn your ideas into functional web applications through natural conversation and powerful coding tools.
                    </p>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Main Interface Tabs</h3>
                    
                    <div className="grid gap-6">
                      <div className="flex gap-4">
                        <div className="mt-1"><Codicon name="apps" size={18} className="text-foreground/40" /></div>
                        <div>
                          <h4 className="text-[15px] font-semibold text-white mb-1">Apps Tab</h4>
                          <p className="text-[13px] text-foreground/60 leading-normal">
                            This is your project dashboard. Here you can create new apps, rename existing ones, or switch between projects. 
                            <span className="block mt-2 text-red-400 font-medium">Security Tip: To delete a project, you must type its exact name to prevent accidental loss.</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="mt-1"><Codicon name="comment-discussion" size={18} className="text-foreground/40" /></div>
                        <div>
                          <h4 className="text-[15px] font-semibold text-white mb-1">Chat Console</h4>
                          <p className="text-[13px] text-foreground/60 leading-normal">
                            Communicate directly with the AI. You can ask it to "Create a login page", "Add a dark mode toggle", or "Fix the submit button logic". The AI will write the code and update your files in real-time.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="mt-1"><Codicon name="code" size={18} className="text-foreground/40" /></div>
                        <div>
                          <h4 className="text-[15px] font-semibold text-white mb-1">Code Editor</h4>
                          <p className="text-[13px] text-foreground/60 leading-normal">
                            A fully featured editor where you can manually tweak your files. It features syntax highlighting, auto-formatting, and intelligent AI tools.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-sm font-bold text-accent uppercase tracking-widest">Editor Tools & Buttons</h3>
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-5">
                      <div className="flex items-start gap-4">
                        <Sparkles size={16} className="text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[13px] font-bold text-white block">AI Assistants</span>
                          <span className="text-[12px] text-foreground/50">Found in the "More Actions" menu. Use Refactor to clean code or Document to add comments.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Edit size={16} className="text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[13px] font-bold text-white block">Format Code</span>
                          <span className="text-[12px] text-foreground/50">Instantly prettifies your code to keep it standardized and professional.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Palette size={16} className="text-accent shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[13px] font-bold text-white block">Themes</span>
                          <span className="text-[12px] text-foreground/50">Choose between 10+ professional syntax highlighting themes to match your visual preference.</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold text-accent uppercase tracking-widest mb-4">Final Tips</h3>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-[13px] text-foreground/60">
                        <span className="text-accent">•</span>
                        <span>The **Preview Window** updates automatically every time you or the AI saves a file.</span>
                      </li>
                      <li className="flex gap-3 text-[13px] text-foreground/60">
                        <span className="text-accent">•</span>
                        <span>Use the **Global Search** (Magnifying glass) to find variables or functions across your entire project.</span>
                      </li>
                    </ul>
                  </section>

                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-white/5 flex justify-center bg-white/[0.01]">
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="px-10 py-2.5 bg-accent hover:bg-accent/90 text-white text-[13px] font-bold rounded-lg transition-all shadow-lg shadow-accent/20 active:scale-95"
                >
                  Got it, thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rename File Modal */}
      <AnimatePresence>
        {showRenameModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-lg p-6 shadow-2xl"
            >
              <h3 className="text-lg font-normal text-white mb-4">Rename File</h3>
              <input
                autoFocus
                type="text"
                value={renameNewName}
                onChange={(e) => setRenameNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmRenameFile();
                  if (e.key === 'Escape') setShowRenameModal(false);
                }}
                className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:outline-none focus:border-accent mb-6"
              />
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4d4d52] text-white text-sm transition-colors rounded-[2px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRenameFile}
                  className="px-6 py-2 bg-[#007ACC] hover:bg-[#006BB3] text-white text-sm font-medium rounded-[2px] transition-colors"
                >
                  Rename
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showQuickOpen && (
          <QuickOpenModal 
            files={Object.keys(files)} 
            onClose={() => setShowQuickOpen(false)} 
            onSelect={(name) => { setActiveFile(name); setShowQuickOpen(false); }} 
          />
        )}
        {showCommandPalette && (
          <CommandPaletteModal 
            onClose={() => setShowCommandPalette(false)} 
            actions={[
              { label: 'Save File', shortcut: 'Ctrl+S', action: handleSaveToLocal },
              { label: 'New File', shortcut: 'Ctrl+N', action: handleCreateFile },
              { label: 'New Folder', shortcut: '', action: handleCreateFolder },
              { label: 'Settings', shortcut: 'Ctrl+,', action: () => { setMobileView('chat'); setActiveTab('settings'); } },
              { label: 'Search in all files', shortcut: 'Ctrl+Shift+F', action: () => { setActiveTab('search'); setIsExplorerOpen(true); } },
              { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+Shift+K', action: () => setShowShortcutsModal(true) },
              { label: 'Toggle Sidebar', action: () => setIsSidebarMinimized(prev => !prev) },
              { label: 'Toggle Explorer', action: () => setIsExplorerOpen(prev => !prev) },
              { label: 'Open Preview', action: () => { setPreviewFiles(files); setShowPreview(true); setMobileView('preview'); } },
              { label: 'Close All Tabs', action: () => { setOpenFiles([]); setActiveFile(''); } },
            ]}
          />
        )}
        {showShortcutsModal && (
          <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
        )}
      </AnimatePresence>
      </div>
    </IconContext.Provider>
  );
}
