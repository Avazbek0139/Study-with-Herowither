export interface AIService {
  generateTranslation(word: string): Promise<string>;
  generateExample(word: string, partOfSpeech?: string): Promise<string>;
  generateSynonyms(word: string): Promise<string[]>;
  generateAntonyms(word: string): Promise<string[]>;
  enrichWord(word: string): Promise<{
    translation: string;
    partOfSpeech: string;
    pronunciation: string;
    example: string;
    synonyms: string[];
    antonyms: string[];
    difficulty: string;
  }>;
}

const COMMON_WORDS_DICTIONARY: Record<string, string> = {
  advance: 'ilgarilash', grieve: 'qayg\'urmoq', draining: 'charchatadigan', prove: 'isbotlamoq',
  scandal: 'janjal', abandon: 'tark etmoq', ability: 'qobiliyat', absorb: 'singdirmoq',
  accelerate: 'tezlashtirmoq', accomplish: 'bajarmoq', achieve: 'erishmoq', acquire: 'olmoq',
  adapt: 'moslashmoq', adequate: 'yetarli', adjust: 'to\'g\'rilamoq', admire: 'qoyil qolmoq',
  adopt: 'qabul qilmoq', advocate: 'himoya qilmoq', afford: 'qurbi yetmoq', aggressive: 'tajovuzkor',
  allocate: 'ajratmoq', alter: 'o\'zgartirmoq', amaze: 'hayron qoldirmoq', ambiguous: 'noaniq',
  analyze: 'tahlil qilmoq', anticipate: 'kutmoq', apparent: 'aniq', appeal: 'murojaat qilmoq',
  approach: 'yondashuv', appropriate: 'mos', approve: 'tasdiqlamoq', arise: 'paydo bo\'lmoq',
  assert: 'ta\'kidlamoq', assess: 'baholamoq', assign: 'tayinlamoq', assist: 'yordam bermoq',
  assume: 'taxmin qilmoq', attach: 'biriktirmoq', attain: 'erishmoq', attempt: 'urinish',
  authorize: 'ruxsat bermoq', avoid: 'qochmoq', aware: 'xabardor', barrier: 'to\'siq',
  basis: 'asos', behalf: 'nomidan', benefit: 'foyda', bias: 'xolislik', bond: 'aloqa',
  boost: 'oshirmoq', boundary: 'chegara', brief: 'qisqa', broad: 'keng', capable: 'qodir',
  capture: 'ushlab qolmoq', cease: 'to\'xtatmoq', challenge: 'qiyinchilik', chapter: 'bob',
  circumstance: 'vaziyat', clarify: 'oydinlashtirmoq', collapse: 'qulamoq', commit: 'sodir etmoq',
  communicate: 'aloqa qilmoq', compensate: 'qoplash', compile: 'tuzmoq', complex: 'murakkab',
  component: 'tarkibiy qism', comprehend: 'tushunmoq', comprise: 'tashkil etmoq',
  concentrate: 'diqqatni jamlamoq', conclude: 'xulosa qilmoq', conflict: 'ziddiyat',
  confront: 'duch kelmoq', conscious: 'ongli', consent: 'rozilik', consequence: 'oqibat',
  considerable: 'sezilarli', consist: 'iborat bo\'lmoq', constant: 'doimiy', constitute: 'tashkil qilmoq',
  construct: 'qurmoq', consult: 'maslahatlashmoq', consume: 'iste\'mol qilmoq', contact: 'aloqa',
  contemporary: 'zamonaviy', contrast: 'qarama-qarshilik', contribute: 'hissa qo\'shmoq',
  controversy: 'bahs', convenient: 'qulay', convert: 'aylantirmoq', convince: 'ishontirmoq',
  corporate: 'korporativ', correspond: 'mos kelmoq', crucial: 'hal qiluvchi', debate: 'munozara',
  decade: 'o\'n yillik', decline: 'pasayish', dedicate: 'bag\'ishlamoq', definite: 'aniq',
  demonstrate: 'namoyish etmoq', deny: 'inkor etmoq', derive: 'kelib chiqmoq', detect: 'aniqlamoq',
  device: 'qurilma', devote: 'bag\'ishlamoq', dimension: 'o\'lcham', diminish: 'kamaytirmoq',
  display: 'ko\'rsatmoq', distinct: 'aniq', distribute: 'tarqatmoq', diverse: 'xilma-xil',
  document: 'hujjat', domestic: 'ichki', dominate: 'hukmronlik qilmoq', draft: 'qoralama',
  dramatic: 'dramatik', duration: 'davomiylik', dynamic: 'dinamik', elaborate: 'batafsil ishlab chiqmoq',
  eliminate: 'yo\'q qilmoq', embrace: 'quchoqlamoq', emerge: 'paydo bo\'lmoq', emphasis: 'urg\'u',
  enable: 'imkon bermoq', encounter: 'duch kelmoq', enormous: 'ulkan', ensure: 'ta\'minlamoq',
  entity: 'tashkilot', equip: 'jihozlamoq', equivalent: 'ekvivalent', erode: 'emirilmoq',
  error: 'xato', essential: 'zarur', establish: 'o\'rnatmoq', evaluate: 'baholamoq',
  evident: 'aniq', evolve: 'rivojlanmoq', exceed: 'oshib ketmoq', exclude: 'chiqarib tashlamoq',
  exhibit: 'ko\'rgazma', expand: 'kengaytirmoq', explicit: 'aniq', exploit: 'foydalanmoq',
  expose: 'oshkor qilmoq', external: 'tashqi', extract: 'ajratib olmoq', facilitate: 'osonlashtirmoq',
  factor: 'omil', feature: 'xususiyat', flexible: 'moslashuvchan', focus: 'diqqat markazi',
  format: 'format', formula: 'formula', found: 'topmoq', framework: 'doira', function: 'funksiya',
  fund: 'jamg\'arma', fundamental: 'asosiy', furthermore: 'bundan tashqari', generate: 'yaratmoq',
  globe: 'globus', grant: 'bermoq', guarantee: 'kafolat', guideline: 'ko\'rsatma', hence: 'shuning uchun',
  highlight: 'ta\'kidlamoq', hypothesis: 'gipoteza', identical: 'bir xil', identify: 'aniqlamoq',
  ignore: 'e\'tiborsiz qoldirmoq', illustrate: 'tasvirlamoq', image: 'tasvir', impact: 'ta\'sir',
  implement: 'amalga oshirmoq', implication: 'ma\'no', implicit: 'yashirin', imply: 'nazarda tutmoq',
  impose: 'yuklamoq', incentive: 'rag\'bat', incident: 'voqea', incline: 'moyillik',
  incorporate: 'birlashtirmoq', indicate: 'ko\'rsatmoq', individual: 'shaxs', inevitable: 'muqarrar',
  infrastructure: 'infratuzilma', initial: 'boshlang\'ich', initiate: 'boshlamoq', innovation: 'innovatsiya',
  input: 'kiritish', insight: 'tushuncha', inspect: 'tekshirmoq', instance: 'misol', institute: 'institut',
  instruct: 'ko\'rsatma bermoq', integral: 'ajralmas', integrate: 'birlashtirmoq', integrity: 'yaxlitlik',
  intelligence: 'aql', intense: 'kuchli', interact: 'o\'zaro harakat qilmoq', internal: 'ichki',
  interpret: 'talqin qilmoq', intervene: 'aralashmoq', investigate: 'tergov qilmoq', invest: 'sarmoya kiritmoq',
  involve: 'jalb qilmoq', isolate: 'ajratmoq', issue: 'masala', justify: 'oqlamoq', label: 'yorliq',
  layer: 'qatlam', lecture: 'ma\'ruza', legal: 'qonuniy', legislation: 'qonunchilik', liberal: 'liberal',
  likewise: 'shunga o\'xshash', link: 'havola', locate: 'joylashmoq', logic: 'mantiq', maintain: 'saqlab qolmoq',
  major: 'asosiy', manipulate: 'manipulyatsiya qilmoq', margin: 'marja', mature: 'yetuk',
  maximum: 'maksimal', mechanism: 'mexanizm', medium: 'o\'rta', mental: 'aqliy', method: 'usul',
  migrate: 'ko\'chib o\'tmoq', military: 'harbiy', minimal: 'minimal', minimize: 'minimallashtirmoq',
  minor: 'kichik', modify: 'o\'zgartirmoq', monitor: 'kuzatmoq', motive: 'sabab', mutual: 'o\'zaro',
  negate: 'inkor etmoq', network: 'tarmoq', neutral: 'neytral', nonetheless: 'shunga qaramay',
  norm: 'me\'yor', notion: 'tushuncha', nuclear: 'yadroviy', objective: 'maqsad', obtain: 'olmoq',
  obvious: 'aniq', occupy: 'band qilmoq', occur: 'sodir bo\'lmoq', odd: 'g\'alati', offset: 'qoplash',
  ongoing: 'davom etayotgan', option: 'variant', orient: 'yo\'naltirmoq', outcome: 'natija',
  output: 'chiqish', overall: 'umumiy', overlap: 'ustma-ust tushish', overseas: 'chet elda',
  panel: 'panel', parallel: 'parallel', parameter: 'parametr', participate: 'ishtirok etmoq',
  partner: 'hamkor', passive: 'passiv', perceive: 'qabul qilmoq', percent: 'foiz', period: 'davr',
  permit: 'ruxsat bermoq', persist: 'davom etmoq', perspective: 'nuqtai nazar', phase: 'bosqich',
  phenomenon: 'hodisa', pioneer: 'kashshof', policy: 'siyosat', portion: 'qism', pose: 'tug\'dirmoq',
  positive: 'ijobiy', potential: 'potentsial', practitioner: 'amaliyotchi', precede: 'oldin kelmoq',
  precise: 'aniq', predict: 'bashorat qilmoq', predominant: 'ustunlik qiluvchi', preliminary: 'dastlabki',
  presume: 'taxmin qilmoq', previous: 'oldingi', primary: 'asosiy', principle: 'tamoyil',
  prior: 'oldingi', proceed: 'davom etmoq', process: 'jarayon', professional: 'professional',
  prohibit: 'taqiqlamoq', project: 'loyiha', promote: 'targ\'ib qilmoq', proportion: 'nisbat',
  prospect: 'istiqbol', protocol: 'protokol', pursue: 'ta\'qib qilmoq', qualify: 'malakaga ega bo\'lmoq',
  quote: 'iqtibos keltirmoq', radical: 'radikal', random: 'tasodifiy', range: 'oraliq', ratio: 'nisbat',
  react: 'munosabat bildirmoq', recover: 'tiklanmoq', refine: 'takomillashtirmoq', regime: 'rejim',
  region: 'mintaqa', register: 'ro\'yxatdan o\'tmoq', regulate: 'tartibga solmoq', reinforce: 'kuchaytirmoq',
  reject: 'rad etmoq', release: 'ozod qilmoq', relevant: 'tegishli', reluctant: 'istaksiz',
  rely: 'tayanmoq', remove: 'olib tashlamoq', research: 'tadqiqot', reside: 'yashamoq',
  resolve: 'hal qilmoq', resource: 'resurs', respond: 'javob bermoq', restore: 'tiklamoq',
  restrain: 'tiymoq', retain: 'saqlab qolmoq', reveal: 'oshkor qilmoq', revenue: 'daromad',
  reverse: 'teskari', revise: 'qayta ko\'rib chiqmoq', revolution: 'inqilob', rigid: 'qattiq',
  role: 'rol', route: 'yo\'nalish', scenario: 'stsenariy', schedule: 'jadval', scheme: 'sxema',
  scope: 'ko\'lam', sector: 'sektor', secure: 'xavfsiz', seek: 'qidirmoq', sequence: 'ketma-ketlik',
  series: 'seriya', shift: 'siljish', significant: 'muhim', similar: 'o\'xshash', simulate: 'simulyatsiya qilmoq',
  sole: 'yagona', somewhat: 'biroz', source: 'manba', specific: 'maxsus', sphere: 'soha',
  stable: 'barqaror', status: 'maqom', straightforward: 'oddiy', strategy: 'strategiya',
  stress: 'kuchlanish', structure: 'tuzilish', submit: 'topshirmoq', subordinate: 'bo\'ysunuvchi',
  subsequent: 'keyingi', substitute: 'o\'rinbosar', successor: 'merosxo\'r', sufficient: 'yetarli',
  summary: 'xulosa', supplement: 'qo\'shimcha', survey: 'so\'rovnoma', survive: 'omon qolmoq',
  suspend: 'to\'xtatib turmoq', sustain: 'qo\'llab-quvvatlamoq', symbol: 'ramz', target: 'maqsad',
  task: 'vazifa', team: 'jamoa', technical: 'texnik', technique: 'texnika', technology: 'texnologiya',
  temporary: 'vaqtinchalik', tense: 'keskin', terminal: 'terminal', theme: 'mavzu', theory: 'nazariya',
  thereby: 'shu orqali', thesis: 'dissertatsiya', topic: 'mavzu', trace: 'iz', tradition: 'an\'ana',
  transfer: 'o\'tkazmoq', transform: 'aylantirmoq', transition: 'o\'tish', transmit: 'uzatmoq',
  transport: 'transport', trend: 'tendentsiya', trigger: 'qozg\'atmoq', ultimate: 'yakuniy',
  undergo: 'boshidan kechirmoq', underlie: 'asosida yotmoq', undertake: 'o\'z zimmasiga olmoq',
  uniform: 'bir xil', unique: 'noyob', utilize: 'foydalanmoq', valid: 'haqiqiy', vary: 'farq qilmoq',
  vehicle: 'vosita', version: 'versiya', via: 'orqali', violate: 'buzmoq', virtual: 'virtual',
  visible: 'ko\'rinadigan', vision: 'ko\'rish', visual: 'vizual', vital: 'hayotiy', volume: 'hajm',
  voluntary: 'ixtiyoriy', widespread: 'keng tarqalgan'
};

class FallbackAIService implements AIService {
  async generateTranslation(word: string): Promise<string> {
    const w = word.toLowerCase().trim();
    return COMMON_WORDS_DICTIONARY[w] || 'tarjima mavjud emas';
  }

  async generateExample(word: string, partOfSpeech?: string): Promise<string> {
    return `The word "${word}" is very useful in English.`;
  }

  async generateSynonyms(word: string): Promise<string[]> {
    return ['synonym1', 'synonym2'];
  }

  async generateAntonyms(word: string): Promise<string[]> {
    return ['antonym1', 'antonym2'];
  }

  async enrichWord(word: string): Promise<{
    translation: string;
    partOfSpeech: string;
    pronunciation: string;
    example: string;
    synonyms: string[];
    antonyms: string[];
    difficulty: string;
  }> {
    const w = word.toLowerCase().trim();
    return {
      translation: COMMON_WORDS_DICTIONARY[w] || 'tarjima',
      partOfSpeech: 'noun',
      pronunciation: `/${w}/`,
      example: `This is an example sentence for the word ${word}.`,
      synonyms: [`synonym1_for_${w}`, `synonym2_for_${w}`],
      antonyms: [`antonym1_for_${w}`, `antonym2_for_${w}`],
      difficulty: 'intermediate'
    };
  }
}

export function getAIService(): AIService {
  // In a real app, you would check for an API key here
  // and return a real AI service (e.g., OpenAI/Gemini) if configured.
  // For now, we use the fallback service.
  return new FallbackAIService();
}
