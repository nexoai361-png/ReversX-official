# ReversX Extension Master Guide | ReversX এক্সটেনশন মাস্টার গাইড

## 🇬🇧 English: How to create your own Extension

ReversX allows you to completely transform the app's look (except for the Chat tab).

### 1. The JSON Structure
Your extension must be a valid JSON object. Copy this template:

```json
{
  "id": "cool-theme-001",
  "name": "Emerald City",
  "description": "A green aesthetic for productive coding.",
  "author": "DeveloperName",
  "version": "1.0.0",
  "theme": {
    "background": "#0a1a0a",
    "foreground": "#d0ffd0",
    "accent": "#00ff88",
    "sidebarBackground": "#051005",
    "editorBackground": "#020802",
    "fontFamily": "'JetBrains Mono', monospace"
  },
  "styles": "
    /* Target the whole UI */
    .extension-controlled { border-color: #00ff8844 !important; }
    
    /* Target icons */
    .extension-controlled svg { color: #00ff88 !important; }
    
    /* Target specific buttons */
    .extension-controlled button:hover { background: #00ff8822 !important; }
  "
}
```

### 2. UI Target Classes
To change specific parts, use these CSS classes in your `"styles"` field:
- `.extension-root`: The main wrapper (everything except Chat).
- `.extension-sidebar`: The left file explorer/activity bar area.
- `.extension-editor`: The main code editor area.
- `.no-extension`: **DO NOT TARGET THIS.** This is the protected Chat tab.

### 3. Changing Fonts
You can use `font-family` in the theme or import Google Fonts in styles:
`@import url('https://fonts.googleapis.com/...'); .extension-controlled { font-family: 'Your Font' !important; }`

---

## 🇧🇩 বাংলা: কীভাবে নিজের এক্সটেনশন তৈরি করবেন

ReversX আপনাকে অ্যাপের চেহারা সম্পূর্ণ পরিবর্তন করতে দেয় (চ্যাট ট্যাব বাদে)।

### ১. JSON গঠন
আপনার এক্সটেনশনটি একটি সঠিক JSON অবজেক্ট হতে হবে। এই টেমপ্লেটটি ব্যবহার করুন:

```json
{
  "id": "আপনার-আইডি",
  "name": "থিমের নাম",
  "description": "এটি কী ধরণের থিম তার বর্ণনা",
  "author": "আপনার নাম",
  "version": "1.0.0",
  "theme": {
    "background": "#রঙের_কোড",
    "foreground": "#লেখার_রঙ",
    "accent": "#অ্যাকসেন্ট_রঙ",
    "sidebarBackground": "#সাইডবার_রঙ",
    "editorBackground": "#এডিটর_রঙ",
    "fontFamily": "ফন্টের নাম"
  },
  "styles": "
    /* পুরো UI পরিবর্তন করতে */
    .extension-controlled { border-color: #রঙ !important; }
    
    /* আইকন পরিবর্তন করতে */
    .extension-controlled svg { color: #রঙ !important; }
  "
}
```

### ২. টার্গেট ক্লাস (UI Target Classes)
নির্দিষ্ট জায়গা পরিবর্তন করতে এই ক্লাসগুলি ব্যবহার করুন:
- `.extension-root`: পুরো অ্যাপের মূল অংশ (চ্যাট বাদে)।
- `.extension-sidebar`: বাম পাশের ফাইল এক্সপ্লোরার এলাকা।
- `.extension-editor`: মাঝখানের কোড এডিটর এলাকা।
- `.no-extension`: **এটি পরিবর্তন করবেন না।** এটি সুরক্ষিত চ্যাট ট্যাব।

### ৩. ফন্ট পরিবর্তন
আপনি গুগলের যেকোনো ফন্ট ইম্পোর্ট করে সব কিছুর ফন্ট বদলে দিতে পারেন।
