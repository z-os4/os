import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  Newspaper,
  Calendar,
  Star,
  Trophy,
  Briefcase,
  Cpu,
  Film,
  Share2,
  Bookmark,
  ExternalLink,
  ChevronLeft,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface NewsWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

interface Article {
  id: string;
  title: string;
  source: string;
  date: string;
  category: string;
  image: string;
  excerpt: string;
  content: string;
  readTime: string;
  isSaved?: boolean;
}

type Category = 'today' | 'following' | 'sports' | 'business' | 'tech' | 'entertainment';

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'AI Breakthrough: New Model Achieves Human-Level Reasoning',
    source: 'Tech Chronicle',
    date: 'Dec 26, 2024',
    category: 'tech',
    image: 'https://picsum.photos/seed/news1/800/400',
    excerpt: 'Researchers announce a major milestone in artificial intelligence development with implications for various industries.',
    content: `A team of researchers has announced a groundbreaking achievement in artificial intelligence: a new model that demonstrates human-level reasoning capabilities across a wide range of tasks.

The model, developed over three years of intensive research, shows remarkable abilities in logical reasoning, mathematical problem-solving, and natural language understanding. Unlike previous AI systems that excelled in specific domains, this new approach demonstrates generalization abilities that approach human cognitive flexibility.

"This represents a fundamental shift in how we think about machine intelligence," said the lead researcher. "We're seeing emergent capabilities that weren't explicitly programmed but arose from the training process."

The implications for industries ranging from healthcare to finance are significant. Early tests show the model can assist with complex medical diagnoses, financial analysis, and scientific research in ways that were previously impossible.

However, researchers are also emphasizing the need for careful consideration of the ethical implications. "With great capability comes great responsibility," the team noted in their published paper. "We're committed to ensuring this technology is deployed safely and beneficially."`,
    readTime: '4 min read',
  },
  {
    id: '2',
    title: 'Markets Rally as Fed Signals Policy Shift',
    source: 'Financial Times',
    date: 'Dec 26, 2024',
    category: 'business',
    image: 'https://picsum.photos/seed/news2/800/400',
    excerpt: 'Stock markets surge following Federal Reserve comments suggesting a change in monetary policy direction.',
    content: `Global stock markets experienced their strongest rally in months after Federal Reserve officials signaled a potential shift in monetary policy direction.

The S&P 500 jumped 2.3% in early trading, while the Nasdaq Composite rose 2.8%. European markets followed suit, with the STOXX 600 gaining 1.9%.

The rally was sparked by comments from Fed Chair suggesting that the central bank may consider easing its aggressive rate-hiking cycle sooner than previously anticipated. "We're seeing encouraging signs in the inflation data," the Chair noted during a press conference.

Investors have been closely watching for any indication that the Fed might pivot from its current stance. The market reaction suggests significant pent-up demand for risk assets.

However, analysts caution that the path forward remains uncertain. "While this is encouraging news, we need to see sustained progress on inflation before declaring victory," said one market strategist.`,
    readTime: '3 min read',
  },
  {
    id: '3',
    title: 'Championship Finals Set After Stunning Semifinal Upsets',
    source: 'Sports Daily',
    date: 'Dec 25, 2024',
    category: 'sports',
    image: 'https://picsum.photos/seed/news3/800/400',
    excerpt: 'Underdog teams advance to the finals in what experts are calling one of the most unpredictable tournaments in history.',
    content: `In a stunning turn of events, two underdog teams have advanced to the championship finals after defeating heavily favored opponents in the semifinals.

The first semifinal saw a remarkable comeback, with the trailing team scoring three goals in the final fifteen minutes to overcome a two-goal deficit. The crowd erupted as the winning goal was scored in extra time.

"We never stopped believing," said the team captain. "Everyone counted us out, but we knew what we were capable of."

The second semifinal was equally dramatic, featuring a penalty shootout that went to sudden death. The winning goalkeeper made two crucial saves to secure the victory.

Sports analysts are calling this one of the most unpredictable tournaments in recent memory. "The traditional powerhouses have all fallen," noted one commentator. "This final promises to be something special."

The championship match is scheduled for next week and is expected to draw a record television audience.`,
    readTime: '3 min read',
  },
  {
    id: '4',
    title: 'Blockbuster Film Breaks Box Office Records',
    source: 'Entertainment Weekly',
    date: 'Dec 25, 2024',
    category: 'entertainment',
    image: 'https://picsum.photos/seed/news4/800/400',
    excerpt: 'The latest superhero epic shatters opening weekend records with unprecedented global earnings.',
    content: `The latest installment in the popular superhero franchise has shattered box office records, earning an unprecedented $500 million globally during its opening weekend.

The film, which brings together characters from multiple previous movies, has been praised for its ambitious storytelling and spectacular visual effects. Critics and audiences alike have responded enthusiastically.

"This is exactly what audiences have been waiting for," said one film industry analyst. "The combination of beloved characters and a compelling story has proven to be irresistible."

The success comes despite concerns about theatrical releases in an era of streaming dominance. "This proves that the theatrical experience still matters," noted the studio head. "When you give audiences something truly special, they will come."

The film is expected to continue its strong performance in the coming weeks, with projections suggesting it could become the highest-grossing film of the year.`,
    readTime: '2 min read',
  },
  {
    id: '5',
    title: 'Revolutionary Battery Technology Promises Week-Long Phone Charges',
    source: 'Tech Insider',
    date: 'Dec 24, 2024',
    category: 'tech',
    image: 'https://picsum.photos/seed/news5/800/400',
    excerpt: 'New solid-state battery technology could revolutionize mobile devices with dramatically extended battery life.',
    content: `A startup has unveiled a revolutionary solid-state battery technology that could allow smartphones to run for a week on a single charge.

The new battery, which uses a proprietary solid electrolyte material, offers five times the energy density of current lithium-ion batteries while being safer and more environmentally friendly.

"This is the breakthrough the industry has been waiting for," said the company's CEO. "We're not just incrementally improving existing technology; we're fundamentally changing what's possible."

The technology has attracted significant investment from major smartphone manufacturers, with several reportedly in talks for licensing agreements.

Early prototype devices using the new battery have demonstrated impressive real-world performance. Testers reported using their phones normally for six to seven days before needing to recharge.

Commercial availability is expected within two years, with initial applications likely in premium smartphone models before broader adoption.`,
    readTime: '3 min read',
  },
  {
    id: '6',
    title: 'Global Climate Summit Reaches Historic Agreement',
    source: 'World News',
    date: 'Dec 24, 2024',
    category: 'today',
    image: 'https://picsum.photos/seed/news6/800/400',
    excerpt: 'World leaders commit to ambitious new targets for carbon emissions reduction in landmark deal.',
    content: `World leaders have reached a historic agreement at the Global Climate Summit, committing to the most ambitious carbon emissions reduction targets ever adopted.

The agreement, signed by 195 nations, includes binding commitments to reduce emissions by 60% by 2035 and achieve net-zero emissions by 2050. It also establishes a substantial fund to help developing nations transition to clean energy.

"This is a turning point for humanity," said the summit's chair. "For the first time, we have a truly global commitment that matches the scale of the challenge we face."

The agreement includes enforcement mechanisms and regular review periods to ensure countries meet their commitments. Financial penalties will apply to nations that fail to meet their targets.

Environmental groups have cautiously welcomed the deal while emphasizing the need for swift implementation. "The hard work begins now," said one activist. "These commitments must translate into real action."`,
    readTime: '4 min read',
  },
  {
    id: '7',
    title: 'Startup Unicorn Valued at $10 Billion in Latest Funding Round',
    source: 'Business Insider',
    date: 'Dec 23, 2024',
    category: 'business',
    image: 'https://picsum.photos/seed/news7/800/400',
    excerpt: 'AI-powered healthcare startup reaches decacorn status after raising $500 million from top investors.',
    content: `An AI-powered healthcare startup has achieved decacorn status, reaching a $10 billion valuation after closing a $500 million funding round led by top-tier venture capital firms.

The company, which uses artificial intelligence to accelerate drug discovery and personalize patient care, has seen explosive growth over the past two years. Its platform is now used by major pharmaceutical companies and hospital networks worldwide.

"We're proving that AI can fundamentally transform healthcare," said the company's founder. "The investments we're making today will save countless lives in the years to come."

The funding will be used to expand the company's research capabilities and enter new markets. Plans include opening research centers in Europe and Asia.

Industry observers note that the valuation reflects broader enthusiasm for AI applications in healthcare. "This is one of the most promising applications of AI technology," said one analyst. "The potential to improve patient outcomes while reducing costs is enormous."`,
    readTime: '3 min read',
  },
  {
    id: '8',
    title: 'Legendary Athlete Announces Retirement After Historic Career',
    source: 'Sports Network',
    date: 'Dec 23, 2024',
    category: 'sports',
    image: 'https://picsum.photos/seed/news8/800/400',
    excerpt: 'One of the greatest athletes of their generation announces retirement after two decades of competition.',
    content: `In an emotional press conference, one of the greatest athletes of their generation announced their retirement after a career spanning more than two decades.

The athlete, who holds numerous records and has won multiple championship titles, cited the desire to spend more time with family as the primary reason for the decision.

"It's been an incredible journey," they said, fighting back tears. "I've been blessed to do what I love for so long. But it's time for a new chapter."

Tributes have poured in from fans, teammates, and competitors alike. "We've witnessed something special," said a longtime rival. "There won't be another like them."

The athlete's impact extended beyond their sport, with significant charitable work and advocacy for various causes. They indicated plans to continue this work in retirement.

A farewell tour is planned for the spring, giving fans around the world one last opportunity to see the legendary competitor in action.`,
    readTime: '3 min read',
  },
];

const categories: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'following', label: 'Following', icon: Star },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'tech', label: 'Tech', icon: Cpu },
  { id: 'entertainment', label: 'Entertainment', icon: Film },
];

const NewsWindow: React.FC<NewsWindowProps> = ({ onClose, onFocus }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('today');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [savedArticles, setSavedArticles] = useState<string[]>(['1', '5']);
  const [followingTopics, setFollowingTopics] = useState<string[]>(['tech', 'business']);

  const filteredArticles = activeCategory === 'today'
    ? mockArticles.slice(0, 6)
    : activeCategory === 'following'
    ? mockArticles.filter((a) => followingTopics.includes(a.category))
    : mockArticles.filter((a) => a.category === activeCategory);

  const toggleSaveArticle = (articleId: string) => {
    if (savedArticles.includes(articleId)) {
      setSavedArticles(savedArticles.filter((id) => id !== articleId));
    } else {
      setSavedArticles([...savedArticles, articleId]);
    }
  };

  const isArticleSaved = (articleId: string) => savedArticles.includes(articleId);

  const renderArticleList = () => (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white/90 text-2xl font-semibold tracking-tight">
            {categories.find((c) => c.id === activeCategory)?.label}
          </h2>
          {activeCategory === 'today' && (
            <p className="text-white/40 text-sm mt-1">Thursday, December 26, 2024</p>
          )}
        </div>
        {activeCategory === 'today' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <TrendingUp className="w-4 h-4 text-white/60" />
            <span className="text-sm font-medium text-white/60">Trending</span>
          </div>
        )}
      </div>

      {activeCategory === 'following' && followingTopics.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 mx-auto mb-4 text-white/20" />
          <p className="text-white/50">You're not following any topics yet.</p>
          <p className="text-white/30 text-sm mt-1">Browse categories to find topics you're interested in.</p>
        </div>
      )}

      {/* Featured Article */}
      {filteredArticles.length > 0 && activeCategory === 'today' && (
        <div
          onClick={() => setSelectedArticle(filteredArticles[0])}
          className="mb-6 cursor-pointer group"
        >
          <div className="relative rounded-2xl overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
            <img
              src={filteredArticles[0].image}
              alt=""
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="text-xs text-white/50 uppercase tracking-wider font-medium">
                {filteredArticles[0].source}
              </span>
              <h3 className="text-white/95 text-xl font-semibold mt-1 group-hover:text-white transition-colors">
                {filteredArticles[0].title}
              </h3>
              <p className="text-white/60 text-sm mt-2 line-clamp-2">
                {filteredArticles[0].excerpt}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Article Grid */}
      <div className="grid grid-cols-2 gap-4">
        {(activeCategory === 'today' ? filteredArticles.slice(1) : filteredArticles).map((article) => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="group cursor-pointer bg-black/30 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 hover:bg-black/40 transition-all duration-300 shadow-lg"
          >
            <div className="relative">
              <img
                src={article.image}
                alt=""
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-white/40">{article.source}</span>
                <span className="text-white/20">-</span>
                <span className="text-xs text-white/40">{article.date}</span>
              </div>
              <h4 className="text-white/90 font-medium line-clamp-2 group-hover:text-white transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-3 text-white/30 text-xs">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* For You Section */}
      {activeCategory === 'today' && (
        <div className="mt-8">
          <h3 className="text-white/80 font-semibold mb-4">For You</h3>
          <div className="space-y-3">
            {mockArticles.slice(4).map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="flex gap-4 p-3 rounded-xl bg-black/30 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-black/40 cursor-pointer transition-all duration-300"
              >
                <img
                  src={article.image}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0 opacity-80"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/40">{article.source}</span>
                  </div>
                  <h4 className="text-white/90 font-medium line-clamp-2">{article.title}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-white/30">{article.readTime}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveArticle(article.id);
                      }}
                      className={`p-1 rounded hover:bg-white/10 transition-colors ${isArticleSaved(article.id) ? 'text-white/70' : 'text-white/30'}`}
                    >
                      <Bookmark className="w-3 h-3" fill={isArticleSaved(article.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderArticleView = () => {
    if (!selectedArticle) return null;

    return (
      <div className="flex-1 overflow-y-auto">
        {/* Hero Image */}
        <div className="relative h-64">
          <img
            src={selectedArticle.image}
            alt=""
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
          <button
            onClick={() => setSelectedArticle(null)}
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/20 hover:bg-black/60 hover:border-white/30 rounded-full text-white/80 text-sm transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Article Content */}
        <div className="px-8 pb-8 -mt-16 relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/60 text-sm font-medium">{selectedArticle.source}</span>
            <span className="text-white/20">-</span>
            <span className="text-white/40 text-sm">{selectedArticle.date}</span>
          </div>

          <h1 className="text-white/95 text-3xl font-semibold leading-tight mb-4">
            {selectedArticle.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-white/40 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {selectedArticle.readTime}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleSaveArticle(selectedArticle.id)}
                className={`p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ${
                  isArticleSaved(selectedArticle.id) ? 'text-white/80' : 'text-white/40'
                }`}
              >
                <Bookmark
                  className="w-4 h-4"
                  fill={isArticleSaved(selectedArticle.id) ? 'currentColor' : 'none'}
                />
              </button>
              <button className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/40 transition-all duration-300">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white/40 transition-all duration-300">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            {selectedArticle.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-white/70 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Related Articles */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-white/80 font-semibold mb-4">Related Stories</h3>
            <div className="grid grid-cols-2 gap-4">
              {mockArticles
                .filter((a) => a.id !== selectedArticle.id && a.category === selectedArticle.category)
                .slice(0, 2)
                .map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="flex gap-3 p-3 rounded-xl bg-black/30 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-black/40 cursor-pointer transition-all duration-300"
                  >
                    <img
                      src={article.image}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0 opacity-80"
                    />
                    <div>
                      <p className="text-white/90 text-sm font-medium line-clamp-2">{article.title}</p>
                      <p className="text-white/30 text-xs mt-1">{article.source}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ZWindow
      title="News"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 120, y: 60 }}
      initialSize={{ width: 950, height: 700 }}
      windowType="system"
    >
      <div className="flex h-full bg-black/80 backdrop-blur-2xl">
        {/* Sidebar */}
        <div className="w-56 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col p-4">
          <h3 className="text-white/30 text-xs uppercase tracking-wider font-medium mb-3 px-3">Categories</h3>
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSelectedArticle(null); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-white/10 text-white/90 border border-white/15'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/70 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}

          <h3 className="text-white/30 text-xs uppercase tracking-wider font-medium mt-6 mb-3 px-3">Saved</h3>
          <div className="space-y-1">
            {savedArticles.length > 0 ? (
              mockArticles
                .filter((a) => savedArticles.includes(a.id))
                .slice(0, 3)
                .map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="w-full text-left px-3 py-2 text-white/50 hover:bg-white/5 hover:text-white/70 rounded-xl text-sm transition-all duration-300 border border-transparent hover:border-white/10"
                  >
                    <p className="truncate">{article.title}</p>
                    <p className="text-white/30 text-xs truncate">{article.source}</p>
                  </button>
                ))
            ) : (
              <p className="px-3 py-2 text-white/30 text-sm">No saved articles</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        {selectedArticle ? renderArticleView() : renderArticleList()}
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * News app manifest
 */
export const NewsManifest = {
  identifier: 'ai.hanzo.news',
  name: 'News',
  version: '1.0.0',
  description: 'News aggregator for zOS',
  category: 'productivity' as const,
  permissions: ['network'] as const,
  window: {
    type: 'system' as const,
    defaultSize: { width: 950, height: 700 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * News menu bar configuration
 */
export const NewsMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'refresh', label: 'Refresh', shortcut: '⌘R' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close', shortcut: '⌘W' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'today', label: 'Today', shortcut: '⌘1' },
        { type: 'item' as const, id: 'following', label: 'Following', shortcut: '⌘2' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'sports', label: 'Sports', shortcut: '⌘3' },
        { type: 'item' as const, id: 'business', label: 'Business', shortcut: '⌘4' },
        { type: 'item' as const, id: 'tech', label: 'Tech', shortcut: '⌘5' },
        { type: 'item' as const, id: 'entertainment', label: 'Entertainment', shortcut: '⌘6' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar' },
      ],
    },
    {
      id: 'article',
      label: 'Article',
      items: [
        { type: 'item' as const, id: 'saveArticle', label: 'Save Article', shortcut: '⌘S' },
        { type: 'item' as const, id: 'shareArticle', label: 'Share Article', shortcut: '⌘⇧S' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'openInBrowser', label: 'Open in Browser' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'newsHelp', label: 'News Help' },
      ],
    },
  ],
};

/**
 * News dock configuration
 */
export const NewsDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'refresh', label: 'Refresh' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'today', label: 'Today' },
    { type: 'item' as const, id: 'saved', label: 'Saved Articles' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * News App definition for registry
 */
export const NewsApp = {
  manifest: NewsManifest,
  component: NewsWindow,
  icon: Newspaper,
  menuBar: NewsMenuBar,
  dockConfig: NewsDockConfig,
};

export default NewsWindow;
