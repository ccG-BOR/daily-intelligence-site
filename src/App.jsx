import React from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  CalendarClock,
  Database,
  Globe2,
  HeartPulse,
  Play,
  MapPin,
  Search,
  Sparkles,
  Zap
} from "lucide-react";
import feed from "./data/daily-feed.json";

const icons = {
  all: Sparkles,
  ai: BrainCircuit,
  literature: BookOpen,
  health: HeartPulse
};

const labels = {
  zh: {
    all: "全部",
    ai: "AI",
    literature: "文学",
    health: "医学健康",
    updated: "更新",
    heroTitle: "每日研究情报站",
    heroCopy: "为学生与研究者筛出今天值得读的 AI 新闻、文学动态和医学健康文献。",
    live: "实时来源已刷新",
    stable: "展示稳定数据",
    search: "搜索主题、来源、关键词",
    dailyPicks: "每日精选",
    liveFeed: "信息流",
    items: "条",
    noMatch: "没有匹配内容",
    noMatchHint: "换个关键词或频道试试。",
    sources: "来源雷达",
    healthNotice: "医学健康提示",
    themes: "今日主题",
    original: "原文",
    sourceChannel: "来源渠道",
    fetchMethod: "抓取方式",
    foundAt: "找到位置",
    sourcePage: "来源页",
    todayItems: "今日条目",
    picks: "精选阅读",
    trustedSources: "可信来源",
    channels: "频道",
    lancetPriority: "柳叶刀优先",
    journal: "期刊",
    collected: "本次检索",
    video: "视频",
    studyGuide: "学生导读",
    readingTime: "约",
    minutes: "分钟",
    levels: { intro: "入门", easy: "易读", guided: "带着问题读", advanced: "进阶" }
  },
  en: {
    all: "All",
    ai: "AI",
    literature: "Literature",
    health: "Medical Health",
    updated: "Updated",
    heroTitle: "Daily Research Intelligence",
    heroCopy: "A daily reading dashboard for AI news, literature signals, and medical health research.",
    live: "Live sources refreshed",
    stable: "Stable data shown",
    search: "Search topics, sources, keywords",
    dailyPicks: "Daily Picks",
    liveFeed: "Feed",
    items: "items",
    noMatch: "No matching content",
    noMatchHint: "Try another keyword or channel.",
    sources: "Source Radar",
    healthNotice: "Medical Health Notice",
    themes: "Research Themes",
    original: "Original",
    sourceChannel: "Source channel",
    fetchMethod: "Fetch method",
    foundAt: "Found at",
    sourcePage: "Source page",
    todayItems: "Today items",
    picks: "Picks",
    trustedSources: "Trusted sources",
    channels: "Channels",
    lancetPriority: "The Lancet priority",
    journal: "Journal",
    collected: "Collected",
    video: "Video",
    studyGuide: "Study guide",
    readingTime: "About",
    minutes: "min",
    levels: { intro: "Intro", easy: "Easy read", guided: "Guided", advanced: "Advanced" }
  }
};

const typeLabels = {
  zh: { paper: "文献", news: "新闻", essay: "文章", guidance: "指南" },
  en: { paper: "Paper", news: "News", essay: "Essay", guidance: "Guidance" }
};

const languageOptions = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "bilingual", label: "双语" }
];

function formatDate(value, language) {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function textFor(item, language, field) {
  if (language === "en") return item[`${field}En`] ?? item[field];
  return item[`${field}Zh`] ?? item[field];
}

export default function App() {
  const [activeChannel, setActiveChannel] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [language, setLanguage] = React.useState("zh");
  const ui = labels[language === "en" ? "en" : "zh"];
  const normalizedQuery = query.trim().toLowerCase();

  const items = React.useMemo(() => {
    return feed.items.filter((item) => {
      const channelMatch = activeChannel === "all" || item.channel === activeChannel;
      const haystack = [
        item.titleZh,
        item.titleEn,
        item.summaryZh,
        item.summaryEn,
        item.reasonZh,
        item.reasonEn,
        item.sourceName,
        item.sourceChannel,
        item.fetchMethod,
        item.foundAt,
        item.credibilityZh,
        item.credibilityEn,
        item.studentLevel,
        item.learningActionZh,
        item.learningActionEn,
        ...(item.tagsZh ?? []),
        ...(item.tagsEn ?? [])
      ].join(" ").toLowerCase();
      return channelMatch && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [activeChannel, normalizedQuery]);

  const highlights = feed.items.filter((item) => item.highlight).slice(0, 6);
  const stats = [
    { label: ui.todayItems, value: feed.items.length },
    { label: ui.picks, value: highlights.length },
    { label: ui.trustedSources, value: feed.sources.length },
    { label: ui.channels, value: 3 }
  ];

  return (
    <main className="app-shell">
      <section className="hero-band">
        <div className="hero-grid" aria-hidden="true" />
        <nav className="topbar">
          <div className="brand-mark">
            <span className="brand-pulse" />
            <span>Daily Intelligence</span>
          </div>
          <div className="topbar-actions">
            <LanguageSwitch language={language} onChange={setLanguage} />
            <div className="updated-chip">
              <CalendarClock size={16} />
              <span>{formatDate(feed.generatedAt, language)} {ui.updated}</span>
            </div>
          </div>
        </nav>

        <div className="hero-content">
          <div>
            <p className="eyebrow">AI / Literature / Medical Health</p>
            <h1>{ui.heroTitle}</h1>
            <p className="hero-copy">{ui.heroCopy}</p>
          </div>
          <div className="signal-panel">
            <Activity size={20} />
            <div>
              <strong>{feed.status === "live" ? ui.live : ui.stable}</strong>
              <span>{feed.notices[1]}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="control-band" aria-label="filters">
        <div className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={ui.search}
            aria-label={ui.search}
          />
        </div>
        <div className="tabs" aria-label="channels">
          {["all", "ai", "literature", "health"].map((key) => {
            const Icon = icons[key];
            return (
              <button
                className={activeChannel === key ? "tab active" : "tab"}
                key={key}
                onClick={() => setActiveChannel(key)}
                type="button"
              >
                <Icon size={17} />
                <span>{ui[key]}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="stats-grid" aria-label="stats">
        {stats.map((stat) => (
          <div className="stat-tile" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </section>

      <section className="content-layout">
        <div className="main-column">
          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Daily Picks</p>
                <h2>{ui.dailyPicks}</h2>
              </div>
              <Zap size={20} />
            </div>
            <div className="highlight-grid">
              {highlights.map((item) => (
                <ArticleCard item={item} key={item.id} language={language} ui={ui} featured />
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Live Feed</p>
                <h2>{activeChannel === "all" ? ui.all : ui[activeChannel]}{ui.liveFeed}</h2>
              </div>
              <span className="result-count">{items.length} {ui.items}</span>
            </div>
            <div className="feed-list">
              {items.length ? (
                items.map((item) => (
                  <ArticleCard item={item} key={item.id} language={language} ui={ui} />
                ))
              ) : (
                <div className="empty-state">
                  <Database size={28} />
                  <strong>{ui.noMatch}</strong>
                  <span>{ui.noMatchHint}</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="side-column">
          <section className="side-panel">
            <p className="eyebrow">Sources</p>
            <h2>{ui.sources}</h2>
            <div className="source-list">
              {feed.sources.map((source) => (
                <div className="source-row" key={`${source.name}-${source.channel}`}>
                  <span>{source.name}</span>
                  <em>{ui[source.channel]} / {source.method}</em>
                </div>
              ))}
            </div>
          </section>

          <section className="side-panel alert-panel">
            <HeartPulse size={21} />
            <h2>{ui.healthNotice}</h2>
            <p>{feed.notices[0]}</p>
            <p className="notice-secondary">{feed.notices[2]}</p>
          </section>

          <section className="side-panel">
            <p className="eyebrow">Research Themes</p>
            <h2>{ui.themes}</h2>
            <div className="topic-cloud">
              {[...new Set(feed.items.flatMap((item) => language === "en" ? item.tagsEn : item.tagsZh))]
                .slice(0, 18)
                .map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function LanguageSwitch({ language, onChange }) {
  return (
    <div className="language-switch" aria-label="language switch">
      <Globe2 size={16} />
      {languageOptions.map((option) => (
        <button
          className={language === option.key ? "language-option active" : "language-option"}
          key={option.key}
          onClick={() => onChange(option.key)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ArticleCard({ item, language, ui, featured = false }) {
  const Icon = icons[item.channel];
  const title = textFor(item, language, "title");
  const summary = textFor(item, language, "summary");
  const reason = textFor(item, language, "reason");
  const tags = language === "en" ? item.tagsEn : item.tagsZh;
  const credibility = language === "en" ? item.credibilityEn : item.credibilityZh;
  const isPremierJournal = item.sourceTier === "premier-journal";
  const visualUrl = `${import.meta.env.BASE_URL}${item.visual.imageUrl.replace(/^\//, "")}`;

  return (
    <article className={featured ? "article-card featured" : "article-card"}>
      <div className="article-visual">
        <img src={visualUrl} alt={language === "en" ? item.visual.altEn : item.visual.altZh} />
      </div>
      <div className="card-topline">
        <span className={`channel-pill ${item.channel}`}>
          <Icon size={15} />
          {ui[item.channel]}
        </span>
        <div className="topline-badges">
          {isPremierJournal && <span className="journal-pill">{ui.lancetPriority}</span>}
          {item.sourceFormat === "video" && <span className="video-pill"><Play size={13} fill="currentColor" />{ui.video}</span>}
          <span className="type-pill">{typeLabels[language === "en" ? "en" : "zh"][item.type] ?? item.type}</span>
        </div>
      </div>
      <h3>{title}</h3>
      {language === "bilingual" ? (
        <div className="bilingual-copy">
          <p className="summary">{item.summaryZh}</p>
          <p className="summary en-copy">{item.summaryEn}</p>
        </div>
      ) : (
        <p className="summary">{summary}</p>
      )}
      <p className="reason">{reason}</p>
      <div className="study-guide">
        <strong>{ui.studyGuide}</strong>
        <span>{ui.levels[item.studentLevel]} / {ui.readingTime} {item.estimatedMinutes} {ui.minutes}</span>
        <p>{language === "en" ? item.learningActionEn : item.learningActionZh}</p>
      </div>
      <div className="source-meta">
        <span><MapPin size={14} />{ui.sourceChannel}: {ui[item.sourceChannel]}</span>
        {item.journal && <span>{ui.journal}: {item.journal}</span>}
        <span>{ui.fetchMethod}: {item.fetchMethod}</span>
        <span>{ui.foundAt}: {item.foundAt}</span>
      </div>
      <div className="tag-row">
        {tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="card-footer">
        <div>
          <strong>{item.sourceName}</strong>
          <span>{item.dateLabel === "collected" ? ui.collected : formatDate(item.publishedAt, language)} / {credibility}</span>
        </div>
        <div className="footer-actions">
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">{ui.sourcePage}</a>
          <a href={item.url} target="_blank" rel="noreferrer" aria-label={`${ui.original}: ${title}`}>
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </article>
  );
}
