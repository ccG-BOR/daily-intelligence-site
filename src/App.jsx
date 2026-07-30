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
  X,
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
    lifeCategories: "生活分类",
    categoryAll: "全部生活场景",
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
    readInside: "站内阅读",
    openOriginal: "打开原文",
    close: "关闭",
    whyRelevant: "为什么和我有关",
    threePoints: "三句话看懂",
    suitableFor: "适合用来做什么",
    sourceTrace: "来源追踪",
    publicExcerpt: "公开摘要/题录",
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
    lifeCategories: "Life categories",
    categoryAll: "All life scenes",
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
    readInside: "Read here",
    openOriginal: "Open original",
    close: "Close",
    whyRelevant: "Why it matters",
    threePoints: "Three-point read",
    suitableFor: "Useful for",
    sourceTrace: "Source trace",
    publicExcerpt: "Public abstract / record",
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

const lifeCategoryOrder = ["all", "life-health", "study-career", "expression-reading", "medical-evidence"];

const fallbackLifeLabels = {
  zh: {
    "life-health": "生活健康",
    "study-career": "学习就业",
    "expression-reading": "阅读表达",
    "medical-evidence": "医学证据"
  },
  en: {
    "life-health": "Everyday health",
    "study-career": "Study and jobs",
    "expression-reading": "Reading and expression",
    "medical-evidence": "Medical evidence"
  }
};

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

function lifeLabelFor(key, language, sampleItem) {
  if (key === "all") return labels[language === "en" ? "en" : "zh"].categoryAll;
  if (language === "en") return sampleItem?.lifeCategoryEn ?? fallbackLifeLabels.en[key] ?? key;
  return sampleItem?.lifeCategoryZh ?? fallbackLifeLabels.zh[key] ?? key;
}

function detailTextFor(item, language, field) {
  if (language === "en") return item[`${field}En`] ?? item[`${field}Zh`] ?? "";
  return item[`${field}Zh`] ?? item[`${field}En`] ?? "";
}

export default function App() {
  const [activeChannel, setActiveChannel] = React.useState("all");
  const [activeLifeCategory, setActiveLifeCategory] = React.useState("all");
  const [query, setQuery] = React.useState("");
  const [language, setLanguage] = React.useState("zh");
  const [selectedItem, setSelectedItem] = React.useState(null);
  const ui = labels[language === "en" ? "en" : "zh"];
  const normalizedQuery = query.trim().toLowerCase();

  React.useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") setSelectedItem(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = React.useMemo(() => {
    return feed.items.filter((item) => {
      const channelMatch = activeChannel === "all" || item.channel === activeChannel;
      const lifeMatch = activeLifeCategory === "all" || item.lifeCategory === activeLifeCategory;
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
        item.lifeCategoryZh,
        item.lifeCategoryEn,
        item.lifeCategoryReasonZh,
        item.lifeCategoryReasonEn,
        item.lifeRelevanceZh,
        item.lifeRelevanceEn,
        item.readOnSiteZh,
        item.readOnSiteEn,
        item.studentTakeawayZh,
        item.studentTakeawayEn,
        item.useForZh,
        item.useForEn,
        item.originalExcerptZh,
        item.originalExcerptEn,
        item.searchTextZh,
        item.searchTextEn,
        ...(item.tagsZh ?? []),
        ...(item.tagsEn ?? [])
      ].join(" ").toLowerCase();
      return channelMatch && lifeMatch && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [activeChannel, activeLifeCategory, normalizedQuery]);

  const highlights = feed.items.filter((item) => item.highlight).slice(0, 6);
  const lifeCategorySamples = React.useMemo(() => {
    return new Map(feed.items.map((item) => [item.lifeCategory, item]));
  }, []);
  const activeCategoryLabel = lifeLabelFor(activeLifeCategory, language, lifeCategorySamples.get(activeLifeCategory));
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

      <section className="life-band" aria-label={ui.lifeCategories}>
        <div className="life-band-heading">
          <span>{ui.lifeCategories}</span>
          <strong>{activeCategoryLabel}</strong>
        </div>
        <div className="life-tabs">
          {lifeCategoryOrder.map((key) => (
            <button
              className={activeLifeCategory === key ? "life-tab active" : "life-tab"}
              key={key}
              onClick={() => setActiveLifeCategory(key)}
              type="button"
            >
              {lifeLabelFor(key, language, lifeCategorySamples.get(key))}
            </button>
          ))}
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
                <ArticleCard item={item} key={item.id} language={language} ui={ui} featured onOpen={setSelectedItem} />
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
                  <ArticleCard item={item} key={item.id} language={language} ui={ui} onOpen={setSelectedItem} />
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
      {selectedItem && (
        <ArticleDetail item={selectedItem} language={language} ui={ui} onClose={() => setSelectedItem(null)} />
      )}
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

function ArticleCard({ item, language, ui, featured = false, onOpen }) {
  const Icon = icons[item.channel];
  const title = textFor(item, language, "title");
  const summary = textFor(item, language, "summary");
  const reason = textFor(item, language, "reason");
  const tags = language === "en" ? item.tagsEn : item.tagsZh;
  const credibility = language === "en" ? item.credibilityEn : item.credibilityZh;
  const isPremierJournal = item.sourceTier === "premier-journal";
  const visualUrl = `${import.meta.env.BASE_URL}${item.visual.imageUrl.replace(/^\//, "")}`;
  const lifeCategory = language === "en" ? item.lifeCategoryEn : item.lifeCategoryZh;
  const lifeReason = detailTextFor(item, language, "lifeCategoryReason");

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
      {lifeCategory && (
        <div className="life-context">
          <strong>{lifeCategory}</strong>
          <span>{lifeReason}</span>
        </div>
      )}
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
          <button type="button" className="read-button" onClick={() => onOpen(item)}>
            {ui.readInside}
          </button>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">{ui.sourcePage}</a>
          <a className="original-link" href={item.url} target="_blank" rel="noreferrer" aria-label={`${ui.original}: ${title}`}>
            <span>{ui.original}</span>
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </article>
  );
}

function ArticleDetail({ item, language, ui, onClose }) {
  const title = textFor(item, language, "title");
  const tags = language === "en" ? item.tagsEn : item.tagsZh;
  const points = language === "en" ? item.threePointsEn : item.threePointsZh;
  const excerpt = detailTextFor(item, language, "originalExcerpt");

  return (
    <div className="detail-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="detail-head">
          <div>
            <span className={`channel-pill ${item.channel}`}>{ui[item.channel]}</span>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label={ui.close}>
            <X size={20} />
          </button>
        </div>

        <div className="detail-section emphasis">
          <p className="eyebrow">{ui.whyRelevant}</p>
          <p>{detailTextFor(item, language, "lifeRelevance")}</p>
        </div>

        <div className="detail-section">
          <p className="eyebrow">{ui.threePoints}</p>
          <ol className="point-list">
            {(points ?? []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ol>
        </div>

        <div className="detail-section">
          <p className="eyebrow">{ui.studyGuide}</p>
          <p>{detailTextFor(item, language, "readOnSite")}</p>
          <p className="takeaway">{detailTextFor(item, language, "studentTakeaway")}</p>
        </div>

        <div className="detail-section">
          <p className="eyebrow">{ui.publicExcerpt}</p>
          <p>{excerpt}</p>
        </div>

        <div className="detail-section">
          <p className="eyebrow">{ui.suitableFor}</p>
          <p>{detailTextFor(item, language, "useFor")}</p>
          <div className="tag-row">
            {(tags ?? []).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="detail-source">
          <p className="eyebrow">{ui.sourceTrace}</p>
          <span>{ui.sourceChannel}: {ui[item.sourceChannel]}</span>
          {item.journal && <span>{ui.journal}: {item.journal}</span>}
          <span>{ui.fetchMethod}: {item.fetchMethod}</span>
          <span>{ui.foundAt}: {item.foundAt}</span>
        </div>

        <div className="detail-actions">
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">{ui.sourcePage}</a>
          <a href={item.url} target="_blank" rel="noreferrer">
            {ui.openOriginal}
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
    </div>
  );
}
