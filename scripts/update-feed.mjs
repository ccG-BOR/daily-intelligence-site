import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputPath = path.join(process.cwd(), "src", "data", "daily-feed.json");

const notices = [
  "医学健康内容仅供学习研究，不替代专业医疗建议。",
  "自动摘要用于快速筛选，请以原文链接为准。",
  "期刊全文受版权保护；本站仅整理公开题录、摘要线索与原始访问入口。"
];

const sources = [
  {
    name: "arXiv AI",
    channel: "ai",
    type: "paper",
    url: "https://export.arxiv.org/rss/cs.AI",
    method: "RSS"
  },
  {
    name: "arXiv Machine Learning",
    channel: "ai",
    type: "paper",
    url: "https://export.arxiv.org/rss/cs.LG",
    method: "RSS"
  },
  {
    name: "MIT AI News",
    channel: "ai",
    type: "news",
    url: "https://news.mit.edu/rss/topic/artificial-intelligence2",
    method: "RSS"
  },
  {
    name: "TED-Ed Technology",
    channel: "ai",
    type: "video",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCsooa4yRKGN_zEE8iknghZA",
    method: "YouTube public feed"
  },
  {
    name: "Literary Hub",
    channel: "literature",
    type: "essay",
    url: "https://lithub.com/feed/",
    method: "RSS"
  },
  {
    name: "Open Culture",
    channel: "literature",
    type: "news",
    url: "https://www.openculture.com/feed",
    method: "RSS"
  },
  {
    name: "CDC",
    channel: "health",
    type: "guidance",
    url: "https://tools.cdc.gov/api/v2/resources/media/403372.rss",
    method: "RSS"
  },
  {
    name: "WHO Health Topics",
    channel: "health",
    type: "guidance",
    url: "https://www.who.int/feeds/entity/csr/don/en/rss.xml",
    method: "RSS"
  },
  {
    name: "TED-Ed Health",
    channel: "health",
    type: "video",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=UCsooa4yRKGN_zEE8iknghZA",
    method: "YouTube public feed"
  }
];

const pubMedQueries = [
  {
    name: "The Lancet Family",
    query: "Lancet [jour] OR Lancet Digital Health [jour] OR Lancet Global Health [jour] OR Lancet Public Health [jour] OR Lancet Healthy Longevity [jour] OR Lancet Regional Health [jour]",
    tagsZh: ["柳叶刀", "临床研究", "最新文献"],
    tagsEn: ["The Lancet", "clinical research", "latest literature"],
    days: 14,
    retmax: 12,
    sourceTier: "premier-journal"
  },
  {
    name: "PubMed Sleep Health",
    query: "sleep metabolic mental health",
    tagsZh: ["睡眠", "代谢", "心理健康"],
    tagsEn: ["sleep", "metabolism", "mental health"],
    days: 14,
    retmax: 5,
    sourceTier: "medical-index"
  },
  {
    name: "PubMed Exercise Cognition",
    query: "exercise cognitive health",
    tagsZh: ["运动", "认知健康", "证据"],
    tagsEn: ["exercise", "cognitive health", "evidence"],
    days: 14,
    retmax: 5,
    sourceTier: "medical-index"
  }
];

const channelMeta = {
  ai: {
    labelZh: "AI",
    labelEn: "AI",
    visual: "/visuals/ai.svg",
    credibilityZh: "公开研究与技术来源",
    credibilityEn: "Open research and technology source"
  },
  literature: {
    labelZh: "文学",
    labelEn: "Literature",
    visual: "/visuals/literature.svg",
    credibilityZh: "文学文化来源",
    credibilityEn: "Literary and cultural source"
  },
  health: {
    labelZh: "医学健康",
    labelEn: "Medical Health",
    visual: "/visuals/health.svg",
    credibilityZh: "医学健康来源",
    credibilityEn: "Medical and health source"
  }
};

function stripTags(value = "") {
  return decodeEntities(value)
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function matchTag(block, tag) {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  return block.match(pattern)?.[1] ?? "";
}

async function fetchText(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "DailyIntelligenceSite/0.2" }
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseRss(xml, source) {
  const itemBlocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const blocks = itemBlocks.length
    ? itemBlocks
    : [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);

  return blocks.slice(0, 8).map((block, index) => {
    const rawLink = matchTag(block, "link");
    const href = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
    const originalTitle = stripTags(matchTag(block, "title"));
    const originalSummary = stripTags(
      matchTag(block, "description") || matchTag(block, "summary") || matchTag(block, "content")
    );
    const published = stripTags(
      matchTag(block, "pubDate") || matchTag(block, "updated") || matchTag(block, "published")
    );
    const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/i)?.[1];
    const url = videoId ? `https://www.youtube.com/watch?v=${videoId}` : stripTags(href || rawLink || source.url);

    return normalizeItem({
      id: `${source.channel}-${source.name}-${index}-${originalTitle}`,
      channel: source.channel,
      type: source.type,
      originalTitle,
      originalSummary,
      source: source.name,
      sourceUrl: source.url,
      sourceChannel: source.channel,
      fetchMethod: source.method,
      foundAt: source.url,
      url,
      publishedAt: dateOrNow(published),
      tagsZh: tagsFor(source.channel, originalTitle + " " + originalSummary, "zh"),
      tagsEn: tagsFor(source.channel, originalTitle + " " + originalSummary, "en"),
      sourceFormat: source.type === "video" ? "video" : "article",
      highlight: index < 2
    });
  }).filter((item) => item.titleEn && item.url);
}

export function buildPubMedSearchUrl({ query, days = 14, retmax = 5 }) {
  const searchUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi");
  const recentQuery = days ? `(${query}) AND (\"last ${days} days\"[PDat])` : query;
  searchUrl.searchParams.set("db", "pubmed");
  searchUrl.searchParams.set("term", recentQuery);
  searchUrl.searchParams.set("retmode", "json");
  searchUrl.searchParams.set("retmax", String(retmax));
  searchUrl.searchParams.set("sort", "pub_date");
  return searchUrl.toString();
}

export function journalPriority(journal = "") {
  const normalized = journal.toLowerCase();
  if (normalized === "the lancet") return 100;
  if (normalized.startsWith("lancet ")) return 95;
  if (/new england journal of medicine|nejm/.test(normalized)) return 90;
  if (/jama/.test(normalized)) return 80;
  if (/nature medicine|bmj/.test(normalized)) return 75;
  return 10;
}

export function studentGuideFor(channel, type) {
  if (type === "video") {
    return {
      level: "intro",
      minutes: 12,
      actionZh: "先看视频了解概念，再打开原始链接延伸阅读。",
      actionEn: "Watch first for the concept, then use the original link to explore further."
    };
  }
  if (channel === "health" && type === "paper") {
    return {
      level: "guided",
      minutes: 15,
      actionZh: "先读中文导读，再重点查看摘要、研究对象和结论边界。",
      actionEn: "Read the guide first, then focus on the abstract, participants, and limits."
    };
  }
  if (type === "paper") {
    return {
      level: "advanced",
      minutes: 18,
      actionZh: "先看摘要和关键词，再决定是否进入方法与数据部分。",
      actionEn: "Start with the abstract and keywords before deciding whether to read methods and data."
    };
  }
  return {
    level: "easy",
    minutes: channel === "literature" ? 8 : 6,
    actionZh: "适合快速阅读，用于建立当天的基础认识。",
    actionEn: "A quick read for building a foundation for today."
  };
}

const lifeCategoryDefinitions = [
  {
    key: "life-health",
    labelZh: "生活健康",
    labelEn: "Everyday health",
    keywords: ["sleep", "diet", "exercise", "mental", "stress", "food", "nutrition", "physical activity", "cognitive", "睡眠", "饮食", "运动", "心理", "压力"],
    reasonZh: "和睡眠、运动、饮食、压力管理等日常生活直接相关。",
    reasonEn: "Connected to sleep, exercise, diet, stress, or everyday health habits."
  },
  {
    key: "study-career",
    labelZh: "学习就业",
    labelEn: "Study and jobs",
    keywords: ["agent", "tool", "workflow", "education", "learning", "copilot", "productivity", "model", "evaluation", "AI", "学习", "就业", "工具", "效率"],
    reasonZh: "适合用来理解 AI 工具、学习效率、职业变化和数字技能。",
    reasonEn: "Useful for AI tools, study efficiency, job changes, and digital skills."
  },
  {
    key: "expression-reading",
    labelZh: "阅读表达",
    labelEn: "Reading and expression",
    keywords: ["book", "novel", "poetry", "writing", "translation", "criticism", "story", "archive", "阅读", "写作", "小说", "诗歌", "表达"],
    reasonZh: "适合提升阅读、写作、表达、文化理解和文案能力。",
    reasonEn: "Useful for reading, writing, communication, culture, and copywriting."
  },
  {
    key: "medical-evidence",
    labelZh: "医学证据",
    labelEn: "Medical evidence",
    keywords: ["lancet", "clinical", "disease", "public health", "trial", "prevalence", "burden", "WHO", "CDC", "临床", "疾病", "公共卫生", "柳叶刀"],
    reasonZh: "适合了解疾病、公共卫生和医学研究证据，但需要谨慎解读。",
    reasonEn: "Useful for disease, public health, and medical evidence, with careful interpretation."
  }
];

function searchableTextFor(item) {
  return [
    item.title,
    item.summary,
    item.originalTitle,
    item.originalSummary,
    item.source,
    ...(item.tagsZh ?? []),
    ...(item.tagsEn ?? [])
  ].join(" ").toLowerCase();
}

export function lifeCategoryFor(item) {
  const text = searchableTextFor(item);

  if (item.channel === "health") {
    const everydayHealth = lifeCategoryDefinitions.find((definition) => definition.key === "life-health");
    if (everydayHealth.keywords.some((keyword) => text.includes(keyword.toLowerCase()))) return everydayHealth;
    return lifeCategoryDefinitions.find((definition) => definition.key === "medical-evidence");
  }

  const category = lifeCategoryDefinitions.find((definition) =>
    definition.keywords.some((keyword) => text.includes(keyword.toLowerCase()))
  );

  if (category) return category;
  if (item.channel === "literature") return lifeCategoryDefinitions.find((definition) => definition.key === "expression-reading");
  return lifeCategoryDefinitions.find((definition) => definition.key === "study-career");
}

function compactText(value = "", maxLength = 420) {
  const text = stripTags(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function pointTemplates(item, category) {
  const title = stripTags(item.originalTitle || item.title || "这条内容");
  const source = item.source || item.sourceName || "公开来源";
  const sourcePoint = `它来自 ${source}，不是随机生成的话题。`;
  const titlePoint = `主题是“${compactText(title, 70)}”，可以先按标题判断是否和自己有关。`;
  const limitPoint = item.channel === "health"
    ? "医学健康内容要看研究对象、样本和结论边界，不能直接当成个人诊断。"
    : "先看摘要和来源，再决定是否打开原文继续读。";

  return {
    zh: [category.reasonZh, sourcePoint, limitPoint],
    en: [category.reasonEn, `It comes from ${source}, not from an empty topic shell.`, item.channel === "health" ? "Check population, evidence type, and limits before applying it personally." : "Read the summary and source before opening the original."]
  };
}

export function readableContentFor(item) {
  const category = lifeCategoryFor(item);
  const originalSummary = compactText(item.originalSummary || item.summary || "", 900);
  const topicZh = keywordHint(`${item.originalTitle ?? ""} ${item.originalSummary ?? ""}`, "zh");
  const topicEn = keywordHint(`${item.originalTitle ?? ""} ${item.originalSummary ?? ""}`, "en");
  const points = pointTemplates(item, category);
  const title = compactText(item.originalTitle || item.title || "今日内容", 90);
  const source = item.source || item.sourceName || "公开来源";
  const summaryForRead = originalSummary || `${source} 提供的公开题录显示，这条内容围绕“${title}”。`;

  return {
    lifeCategory: category.key,
    lifeCategoryZh: category.labelZh,
    lifeCategoryEn: category.labelEn,
    lifeCategoryReasonZh: category.reasonZh,
    lifeCategoryReasonEn: category.reasonEn,
    lifeRelevanceZh: `${category.reasonZh} 对大专生来说，可以把它当作“${topicZh}”相关的生活、学习或职业判断材料。`,
    lifeRelevanceEn: `${category.reasonEn} For vocational college readers, use it as practical context for ${topicEn}.`,
    threePointsZh: points.zh,
    threePointsEn: points.en,
    studentTakeawayZh: item.channel === "health"
      ? "先理解结论说了什么，再看它适不适合自己的年龄、身体情况和生活场景。遇到健康问题仍要咨询专业人员。"
      : "先用这条内容建立基本认识，再挑一个能马上尝试的小行动，例如试一个工具、写一段总结或查一个关键词。",
    studentTakeawayEn: item.channel === "health"
      ? "Understand the claim first, then check whether it applies to your age, health status, and situation. For care decisions, ask a professional."
      : "Use this as a starting point, then try one small action: test a tool, write a summary, or search one keyword.",
    readOnSiteZh: `【站内导读】${summaryForRead} 你可以先记住三件事：${points.zh.join("；")}。`,
    readOnSiteEn: `[On-site guide] ${summaryForRead} First remember: ${points.en.join("; ")}.`,
    originalExcerptZh: summaryForRead,
    originalExcerptEn: summaryForRead,
    useForZh: item.channel === "health"
      ? "适合做健康常识学习、课堂讨论、选题素材，不适合替代诊断。"
      : item.channel === "literature"
        ? "适合做阅读笔记、写作素材、表达训练和文化话题积累。"
        : "适合做 AI 工具观察、课程展示、就业技能和数字素养积累。",
    useForEn: item.channel === "health"
      ? "Good for health literacy, class discussion, and topic selection, not diagnosis."
      : item.channel === "literature"
        ? "Good for reading notes, writing material, communication practice, and culture topics."
        : "Good for AI tool awareness, class presentation, employability skills, and digital literacy."
  };
}

export function parsePubMedAbstracts(xml = "") {
  const articles = [...xml.matchAll(/<PubmedArticle[\s\S]*?<\/PubmedArticle>/gi)].map((match) => match[0]);
  const result = new Map();
  for (const article of articles) {
    const id = stripTags(matchTag(article, "PMID"));
    const abstracts = [...article.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean);
    if (id && abstracts.length) {
      result.set(id, abstracts.join(" "));
    }
  }
  return result;
}

async function fetchPubMed(queryConfig) {
  const searchUrl = buildPubMedSearchUrl(queryConfig);

  const searchJson = JSON.parse(await fetchText(searchUrl));
  const ids = searchJson?.esearchresult?.idlist ?? [];
  if (!ids.length) return [];

  const summaryUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi");
  summaryUrl.searchParams.set("db", "pubmed");
  summaryUrl.searchParams.set("id", ids.join(","));
  summaryUrl.searchParams.set("retmode", "json");

  const summaryJson = JSON.parse(await fetchText(summaryUrl.toString()));
  const abstractUrl = new URL("https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi");
  abstractUrl.searchParams.set("db", "pubmed");
  abstractUrl.searchParams.set("id", ids.join(","));
  abstractUrl.searchParams.set("retmode", "xml");
  let abstractMap = new Map();
  try {
    abstractMap = parsePubMedAbstracts(await fetchText(abstractUrl.toString()));
  } catch {
    abstractMap = new Map();
  }
  const collectedAt = new Date().toISOString();
  return ids.map((id, index) => {
    const record = summaryJson?.result?.[id] ?? {};
    const journal = record.fulljournalname || record.source || queryConfig.name;
    const isLancet = journal.toLowerCase().includes("lancet");
    const abstract = abstractMap.get(id);
    return normalizeItem({
      id: `health-pubmed-${id}`,
      channel: "health",
      type: "paper",
      originalTitle: record.title || `PubMed article ${id}`,
      originalSummary: abstract || `${journal}. PubMed indexed article related to ${queryConfig.name}.`,
      source: isLancet ? journal : queryConfig.name,
      sourceUrl: searchUrl.toString(),
      sourceChannel: "health",
      fetchMethod: "PubMed API",
      foundAt: `PubMed / ${journal}`,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      publishedAt: safePublicationDate(record.pubdate, collectedAt).value,
      dateLabel: safePublicationDate(record.pubdate, collectedAt).label,
      tagsZh: queryConfig.tagsZh,
      tagsEn: queryConfig.tagsEn,
      highlight: isLancet || index === 0,
      journal,
      sourceTier: queryConfig.sourceTier,
      priority: journalPriority(journal)
    });
  });
}

function normalizeItem(item) {
  const titleEn = stripTags(item.originalTitle).slice(0, 190);
  const summaryEn = summarizeEn(stripTags(item.originalSummary), item.channel);
  const titleZh = titleZhFor(item.channel, titleEn);
  const summaryZh = summarizeZh(item.channel, summaryEn, item.source);
  const meta = channelMeta[item.channel];
  const studentGuide = studentGuideFor(item.channel, item.type);
  const readableContent = readableContentFor({
    ...item,
    title: titleZh,
    summary: summaryZh,
    originalTitle: titleEn,
    originalSummary: summaryEn
  });

  return {
    id: slugify(item.id || item.url || titleEn),
    channel: item.channel,
    type: item.type,
    title: titleZh,
    summary: summaryZh,
    titleZh,
    titleEn,
    summaryZh,
    summaryEn,
    reasonZh: reasonFor(item.channel, item.type, "zh"),
    reasonEn: reasonFor(item.channel, item.type, "en"),
    source: item.source,
    sourceName: item.source,
    sourceUrl: item.sourceUrl,
    sourceChannel: item.sourceChannel,
    fetchMethod: item.fetchMethod,
    foundAt: item.foundAt,
    url: item.url,
    publishedAt: item.publishedAt,
    dateLabel: item.dateLabel ?? "published",
    tags: [...new Set(item.tagsZh)].slice(0, 5),
    tagsZh: [...new Set(item.tagsZh)].slice(0, 5),
    tagsEn: [...new Set(item.tagsEn)].slice(0, 5),
    credibility: credibilityFor(item.channel, item.type, "zh"),
    credibilityZh: credibilityFor(item.channel, item.type, "zh", item.sourceTier, item.journal),
    credibilityEn: credibilityFor(item.channel, item.type, "en", item.sourceTier, item.journal),
    journal: item.journal ?? "",
    sourceTier: item.sourceTier ?? "open-source",
    priority: item.priority ?? 0,
    sourceFormat: item.sourceFormat ?? "article",
    studentLevel: studentGuide.level,
    estimatedMinutes: studentGuide.minutes,
    learningActionZh: studentGuide.actionZh,
    learningActionEn: studentGuide.actionEn,
    ...readableContent,
    searchTextZh: [
      titleZh,
      summaryZh,
      readableContent.lifeCategoryZh,
      readableContent.lifeCategoryReasonZh,
      readableContent.lifeRelevanceZh,
      readableContent.readOnSiteZh,
      readableContent.studentTakeawayZh,
      readableContent.useForZh,
      ...(item.tagsZh ?? [])
    ].join(" "),
    searchTextEn: [
      titleEn,
      summaryEn,
      readableContent.lifeCategoryEn,
      readableContent.lifeCategoryReasonEn,
      readableContent.lifeRelevanceEn,
      readableContent.readOnSiteEn,
      readableContent.studentTakeawayEn,
      readableContent.useForEn,
      ...(item.tagsEn ?? [])
    ].join(" "),
    visual: {
      imageUrl: meta.visual,
      altZh: `${meta.labelZh}频道动态视觉图`,
      altEn: `${meta.labelEn} animated visual`
    },
    highlight: Boolean(item.highlight)
  };
}

function summarizeEn(text, channel) {
  if (!text) {
    const fallback = {
      ai: "This item comes from an open AI source. Read the original for methods, data, and limitations.",
      literature: "This item comes from an open literature or culture source and can be used as a reading lead.",
      health: "This item comes from an open medical or health source. Read the original and interpret it cautiously."
    };
    return fallback[channel] ?? "Open the original source for the full context.";
  }
  return compactText(text, 220);
}

function titleZhFor(channel, titleEn) {
  if (/[\u4e00-\u9fff]/.test(titleEn)) return titleEn;
  const prefix = {
    ai: "AI研究",
    literature: "文学观察",
    health: "医学健康文献"
  }[channel] ?? "研究线索";
  return `${prefix}: ${titleEn}`;
}

function summarizeZh(channel, summaryEn, source) {
  const topic = keywordHint(summaryEn);
  const templates = {
    ai: `这条内容来自 ${source}，主题聚焦 ${topic}。建议重点查看原文中的方法、数据来源、评估指标和应用边界。`,
    literature: `这条内容来自 ${source}，可作为文学研究、出版动态或文化讨论的阅读线索。建议结合原文判断材料价值。`,
    health: `这条内容来自 ${source}，与 ${topic} 相关。阅读时请关注研究类型、样本量、适用人群和结论边界。`
  };
  return templates[channel] ?? `这条内容来自 ${source}，建议打开原文继续阅读。`;
}

function keywordHint(text, locale = "zh") {
  const lower = text.toLowerCase();
  const pairs = [
    ["sleep", "睡眠", "sleep"],
    ["exercise", "运动", "exercise"],
    ["diet", "饮食", "diet"],
    ["agent", "AI Agent", "AI agents"],
    ["language model", "语言模型", "language models"],
    ["multimodal", "多模态", "multimodal AI"],
    ["poetry", "诗歌", "poetry"],
    ["novel", "小说", "novels"],
    ["translation", "翻译", "translation"],
    ["public health", "公共卫生", "public health"],
    ["mental", "心理健康", "mental health"],
    ["evaluation", "模型评估", "model evaluation"],
    ["data", "数据与证据", "data and evidence"]
  ];
  const match = pairs.find(([keyword]) => lower.includes(keyword));
  if (!match) return locale === "en" ? "new developments in this field" : "该领域的新进展";
  return locale === "en" ? match[2] : match[1];
}

function tagsFor(channel, text, locale) {
  const lower = text.toLowerCase();
  const dictionaries = {
    zh: {
      ai: [["agent", "Agent"], ["multimodal", "多模态"], ["language model", "语言模型"], ["evaluation", "评估"], ["robot", "机器人"], ["learning", "机器学习"]],
      literature: [["novel", "小说"], ["poetry", "诗歌"], ["translation", "翻译"], ["archive", "档案"], ["criticism", "批评"], ["book", "图书"]],
      health: [["sleep", "睡眠"], ["exercise", "运动"], ["mental", "心理健康"], ["public health", "公共卫生"], ["diet", "饮食"], ["clinical", "临床"]]
    },
    en: {
      ai: [["agent", "agent"], ["multimodal", "multimodal"], ["language model", "language model"], ["evaluation", "evaluation"], ["robot", "robotics"], ["learning", "machine learning"]],
      literature: [["novel", "novel"], ["poetry", "poetry"], ["translation", "translation"], ["archive", "archive"], ["criticism", "criticism"], ["book", "books"]],
      health: [["sleep", "sleep"], ["exercise", "exercise"], ["mental", "mental health"], ["public health", "public health"], ["diet", "diet"], ["clinical", "clinical"]]
    }
  };
  const defaults = {
    zh: { ai: ["AI"], literature: ["文学"], health: ["医学健康"] },
    en: { ai: ["AI"], literature: ["literature"], health: ["medical health"] }
  };
  const tags = (dictionaries[locale][channel] ?? [])
    .filter(([keyword]) => lower.includes(keyword))
    .map(([, tag]) => tag);
  return tags.length ? tags : defaults[locale][channel] ?? ["research"];
}

function credibilityFor(channel, type, locale, sourceTier, journal) {
  const zh = {
    healthPaper: "医学文献索引",
    health: "公共卫生来源",
    paper: "研究预印本",
    literature: "文学文化来源",
    default: "公开资讯来源"
  };
  const en = {
    healthPaper: "Medical literature index",
    health: "Public health source",
    paper: "Research preprint",
    literature: "Literary and cultural source",
    default: "Open information source"
  };
  const map = locale === "en" ? en : zh;
  if (sourceTier === "premier-journal" || journal?.toLowerCase().includes("lancet")) {
    return locale === "en" ? "Premier journal: The Lancet family" : "顶级期刊：柳叶刀系列";
  }
  if (channel === "health" && type === "paper") return map.healthPaper;
  if (channel === "health") return map.health;
  if (type === "paper") return map.paper;
  if (channel === "literature") return map.literature;
  return map.default;
}

function reasonFor(channel, type, locale) {
  const zh = {
    aiPaper: "适合跟踪 AI 研究前沿和方法变化。",
    ai: "适合了解 AI 技术从研究走向产品的趋势。",
    literature: "适合发现文学研究、出版和文化讨论的新线索。",
    health: "适合学习医学健康证据，但需要结合原文谨慎判断。"
  };
  const en = {
    aiPaper: "Useful for tracking AI research methods and frontier changes.",
    ai: "Useful for understanding how AI moves from research into products.",
    literature: "Useful for discovering new leads in literary research, publishing, and cultural debate.",
    health: "Useful for studying medical evidence, but interpret with the original source."
  };
  const map = locale === "en" ? en : zh;
  if (type === "video") {
    return locale === "en"
      ? "A visual starting point for understanding the topic before deeper reading."
      : "适合先通过画面和讲解建立概念，再进入更深的阅读。";
  }
  if (channel === "ai" && type === "paper") return map.aiPaper;
  if (channel === "ai") return map.ai;
  if (channel === "literature") return map.literature;
  return map.health;
}

export function safePublicationDate(value, collectedAt = new Date().toISOString()) {
  const date = new Date(value);
  const collected = new Date(collectedAt);
  const maxAllowed = new Date(collected);
  maxAllowed.setDate(maxAllowed.getDate() + 7);
  if (!Number.isNaN(date.getTime()) && date <= maxAllowed) {
    return { value: date.toISOString(), label: "published" };
  }
  return { value: collected.toISOString(), label: "collected" };
}

function dateOrNow(value) {
  return safePublicationDate(value).value;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function dedupe(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = `${item.titleEn.toLowerCase()}|${item.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function isUsefulStudentItem(item) {
  const text = `${item.titleEn ?? item.title ?? ""} ${item.summaryEn ?? item.summary ?? ""}`.toLowerCase();
  const lowValuePatterns = [
    /^correction\b/,
    /^erratum\b/,
    /^corrigendum\b/,
    /correction to /,
    /author correction/,
    /publisher correction/
  ];
  return !lowValuePatterns.some((pattern) => pattern.test(text));
}

export function fallbackItems() {
  const now = new Date().toISOString();
  const raw = [
    {
      id: "fallback-ai-agent-tools",
      channel: "ai",
      type: "news",
      originalTitle: "AI agents make tool use a central product battleground",
      originalSummary: "AI products are moving from chat interfaces toward task-oriented workflows with tool use, permissions, and verifiable outputs.",
      source: "Fallback Intelligence",
      sourceUrl: "https://news.mit.edu/topic/artificial-intelligence2",
      sourceChannel: "ai",
      fetchMethod: "Fallback seed",
      foundAt: "Local fallback list",
      url: "https://news.mit.edu/topic/artificial-intelligence2",
      publishedAt: now,
      tagsZh: ["Agent", "工具调用", "工作流"],
      tagsEn: ["agent", "tool use", "workflow"],
      highlight: true
    },
    {
      id: "fallback-literature-dh",
      channel: "literature",
      type: "essay",
      originalTitle: "New reading methods for literary criticism in the digital age",
      originalSummary: "Literary research is combining text mining, archival databases, and cross-media narrative analysis.",
      source: "Literary Hub",
      sourceUrl: "https://lithub.com/",
      sourceChannel: "literature",
      fetchMethod: "Fallback seed",
      foundAt: "Local fallback list",
      url: "https://lithub.com/",
      publishedAt: now,
      tagsZh: ["文学批评", "数字人文", "文本分析"],
      tagsEn: ["criticism", "digital humanities", "text analysis"],
      highlight: true
    },
    {
      id: "fallback-health-sleep",
      channel: "health",
      type: "paper",
      originalTitle: "Sleep, metabolism, and mental health evidence update",
      originalSummary: "Medical literature continues to examine links between sleep quality, metabolic indicators, and mental health outcomes.",
      source: "PubMed",
      sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=sleep+metabolic+mental+health",
      sourceChannel: "health",
      fetchMethod: "Fallback seed",
      foundAt: "Local fallback list",
      url: "https://pubmed.ncbi.nlm.nih.gov/?term=sleep+metabolic+mental+health",
      publishedAt: now,
      tagsZh: ["睡眠", "代谢", "心理健康"],
      tagsEn: ["sleep", "metabolism", "mental health"],
      highlight: true
    },
    {
      id: "fallback-video-ai-basics",
      channel: "ai",
      type: "video",
      originalTitle: "TED-Ed learning collection: artificial intelligence and everyday technology",
      originalSummary: "A public video-learning entry point for understanding foundational ideas in artificial intelligence and how they affect daily life.",
      source: "TED-Ed",
      sourceUrl: "https://www.youtube.com/@TEDEd/videos",
      sourceChannel: "ai",
      fetchMethod: "Curated public video fallback",
      foundAt: "TED-Ed public video channel",
      url: "https://www.youtube.com/@TEDEd/videos",
      publishedAt: now,
      tagsZh: ["AI入门", "视频学习", "数字素养"],
      tagsEn: ["AI basics", "video learning", "digital literacy"],
      sourceFormat: "video",
      highlight: true
    },
    {
      id: "fallback-video-health-basics",
      channel: "health",
      type: "video",
      originalTitle: "TED-Ed learning collection: health, body, and science basics",
      originalSummary: "A public video-learning entry point for understanding health and science topics before reading more detailed evidence.",
      source: "TED-Ed",
      sourceUrl: "https://www.youtube.com/@TEDEd/videos",
      sourceChannel: "health",
      fetchMethod: "Curated public video fallback",
      foundAt: "TED-Ed public video channel",
      url: "https://www.youtube.com/@TEDEd/videos",
      publishedAt: now,
      tagsZh: ["健康科普", "视频学习", "科学基础"],
      tagsEn: ["health basics", "video learning", "science"],
      sourceFormat: "video",
      highlight: true
    }
  ];
  return raw.map(normalizeItem);
}

async function main() {
  const fetched = [];
  const errors = [];

  for (const source of sources) {
    try {
      const xml = await fetchText(source.url);
      fetched.push(...parseRss(xml, source));
    } catch (error) {
      errors.push(`${source.name}: ${error.message}`);
    }
  }

  for (const query of pubMedQueries) {
    try {
      fetched.push(...await fetchPubMed(query));
    } catch (error) {
      errors.push(`${query.name}: ${error.message}`);
    }
  }

  const liveItems = dedupe(fetched)
    .filter(isUsefulStudentItem)
    .sort((a, b) => b.priority - a.priority || new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 30);
  const items = dedupe([...liveItems, ...fallbackItems()]).slice(0, 36);
  const highlightedCount = items.filter((item) => item.highlight).length;
  if (highlightedCount < 6) {
    for (const item of items.slice(0, 6 - highlightedCount)) {
      item.highlight = true;
    }
  }

  const feed = {
    generatedAt: new Date().toISOString(),
    status: liveItems.length ? "live" : "fallback",
    notices: errors.length
      ? [...notices, `部分来源暂时不可用，已保留可展示内容。失败来源：${errors.slice(0, 3).join("；")}`]
      : notices,
    languages: ["zh", "en", "bilingual"],
    sources: [
      {
        name: "The Lancet Family via PubMed",
        channel: "health",
        type: "paper",
        url: buildPubMedSearchUrl(pubMedQueries[0]),
        method: "PubMed API / daily query"
      },
      ...sources.map(({ name, channel, type, url, method }) => ({
      name,
      channel,
      type,
      url,
      method
      }))
    ],
    items
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(feed, null, 2)}\n`, "utf8");
  console.log(`Updated ${outputPath}`);
  console.log(`Status: ${feed.status}, items: ${feed.items.length}`);
}

if (process.argv[1]?.endsWith("update-feed.mjs")) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
