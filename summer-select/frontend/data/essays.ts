/**
 * Static essay content for 5 Summer Select programs.
 * Each essay includes the program name, the prompt, and the full essay body
 * in both English and Chinese.
 *
 * Replace the placeholder content fields with real essays before launch.
 */

export interface Essay {
  id: string;
  programName: string;
  programSlug: string;
  prompt: string;
  promptZh: string;
  essay: string;
  essayZh: string;
  /** Word count of the English essay */
  wordCount: number;
  /** Year the essay was submitted */
  year: number;
  /** "Accepted" | "Waitlisted" | "Anonymous" */
  outcome: string;
}

export interface EssayGroup {
  programName: string;
  programSlug: string;
  essays: Essay[];
}

export const ESSAY_GROUPS: EssayGroup[] = [
  {
    programName: "PRIMES USA",
    programSlug: "primes-usa",
    essays: [
      {
        id: "primes-usa-1",
        programName: "PRIMES USA",
        programSlug: "primes-usa",
        prompt:
          "Describe your experience with mathematics research or advanced mathematical problem solving. What drives your interest in mathematics, and what area would you most like to explore?",
        promptZh:
          "描述你在数学研究或高级数学问题解决方面的经历。是什么驱动了你对数学的兴趣，你最希望探索哪个领域？",
        essay: `My relationship with mathematics began when I first encountered Euler's identity during a late-night internet spiral. That e^(iπ) + 1 = 0 connects five fundamental constants through a single elegant equation struck me as less a formula and more a revelation — a glimpse into the universe's architecture.

Since then, I have pursued mathematics with singular focus. Last year, I worked through "Principles of Mathematical Analysis" by Rudin independently, wrestling with epsilon-delta proofs until rigor felt natural rather than foreign. I competed in ARML and placed in the top 20% nationally, but competition mathematics, while sharpening my speed, felt hollow compared to the slow, generative pleasure of open-ended exploration.

The area I most want to explore is combinatorics and graph theory. I am captivated by Ramsey theory — the idea that in sufficiently large structures, complete disorder is mathematically impossible. My current question: can the probabilistic method techniques Erdős pioneered be extended to yield tighter bounds for specific Ramsey numbers using spectral graph techniques? I don't have the tools yet to fully attack this problem, which is precisely why I am applying to PRIMES.

Working with a mentor who can guide my technical development while pushing me toward original results is the environment I need. I am not looking for a structured curriculum — I am looking for a collaborator.`,
        essayZh: `我与数学的关系始于某个深夜无意间看到欧拉公式的那一刻。e^(iπ) + 1 = 0 这个将五个基本常数用一个优雅的等式联系起来的公式，在我看来与其说是一个数学表达式，不如说是一种启示——是对宇宙结构的短暂瞥见。

从那以后，我以专一的热情追求数学。去年，我独立研读了Rudin的《数学分析原理》，与ε-δ证明反复较量，直到严格性感觉自然而非陌生。我参加了ARML竞赛并进入全国前20%，但竞赛数学虽然磨砺了速度，与开放性探索的那种缓慢而充实的愉悦感相比，却总显得空洞。

我最想探索的领域是组合数学和图论。Ramsey理论令我着迷——在足够大的结构中，完全的无序是数学上不可能的。我目前的问题是：Erdős开创的概率方法能否结合谱图技术，为特定Ramsey数提供更紧的界？我还没有完全攻克这个问题的工具，这正是我申请PRIMES的原因。

我需要一个既能指导我技术发展，又能推动我走向原创成果的导师。我寻求的不是结构化课程，而是一位合作者。`,
        wordCount: 298,
        year: 2024,
        outcome: "Accepted",
      },
    ],
  },
  {
    programName: "RSI (Research Science Institute)",
    programSlug: "rsi",
    essays: [
      {
        id: "rsi-1",
        programName: "RSI (Research Science Institute)",
        programSlug: "rsi",
        prompt:
          "Describe a scientific question that fascinates you. Why does it intrigue you, and what approach would you take to investigate it?",
        promptZh:
          "描述一个让你着迷的科学问题。为什么它吸引你，你会采取什么方法来研究它？",
        essay: `The question that keeps me awake is deceptively simple: how does a collection of neurons generate a unified, first-person experience of redness when looking at a stop sign?

This is the "hard problem" of consciousness, and it fascinates me precisely because it sits at the boundary between empirical science and philosophy. We can map every photoreceptor activation, every V4 cortical response, every pathway from retina to visual cortex — and still the question of why any of this feels like something remains untouched.

My approach would be empirical but interpretively humble. I would begin by reviewing the current literature on Integrated Information Theory and Global Workspace Theory, the two leading frameworks, and identify their predictive divergences — the experimental conditions under which they make different claims. From there, I would design a behavioral paradigm using masking and attentional blink to probe the accessibility of visual representations to metacognitive report. If representations can be decoded from neural signals without entering conscious awareness, IIT and GWT make different predictions about the neural signatures.

I recognize this is audaciously large for a summer project. But the value of RSI, to me, is not completing a problem — it is learning to decompose one. I want to leave with a smaller, sharper question, a mentored taste of what neuroscience research actually demands.`,
        essayZh: `让我夜不能寐的问题看似简单：一群神经元是如何产生出"看到红灯时感受到红色"这种统一的第一人称体验的？

这就是意识的"难问题"，它之所以令我着迷，正是因为它处于经验科学与哲学的交界处。我们可以绘制出每一个光感受器的激活、每一个V4皮层的反应、从视网膜到视觉皮层的每条通路——然而，为什么所有这些会让人感觉到某种东西，这个问题依然悬而未决。

我的研究方法将是经验性的，但在诠释上保持谦逊。我会首先梳理整合信息理论和全局工作空间理论这两个主流框架的现有文献，找出它们在预测上的分歧——即在哪些实验条件下，两者会做出不同的预测。在此基础上，我会设计一个利用掩蔽效应和注意瞬脱来探究视觉表征能否进入元认知报告的行为范式。如果表征可以从神经信号中被解码，却未进入意识觉知，那么IIT和GWT对神经特征的预测将有所不同。

我承认，对于一个暑期项目来说，这个问题过于宏大。但RSI对我的价值，不在于解决一个问题，而在于学习如何分解它。我希望带着一个更小、更锐利的问题和对神经科学研究真正要求的切身体会离开。`,
        wordCount: 282,
        year: 2024,
        outcome: "Accepted",
      },
    ],
  },
  {
    programName: "SIMR (Stanford Institutes of Medicine Summer Research Program)",
    programSlug: "simr",
    essays: [
      {
        id: "simr-1",
        programName: "SIMR",
        programSlug: "simr",
        prompt:
          "Why are you interested in biomedical research, and what specific area would you like to explore at SIMR?",
        promptZh:
          "你为什么对生物医学研究感兴趣，你希望在SIMR探索哪个具体领域？",
        essay: `Seventeen months ago, my grandmother was diagnosed with glioblastoma multiforme. By month six, she could no longer recognize my name. By month eleven, she was gone. The median survival for GBM is 14.6 months after optimal treatment; hers was 11. I watched the most brilliant woman I knew dissolve — and I did not understand why treatment was so limited.

That question drove me to my school's biology teacher, who pointed me toward PubMed. I taught myself to read primary literature: first review articles, then methods sections I barely understood, then results I had to re-read three times. I learned what the blood-brain barrier actually does to drug penetration. I learned why temozolomide's efficacy plateaus. I became obsessed with the tumor microenvironment — specifically, the way glioblastoma co-opts microglia from tumor suppressors into tumor promoters.

At SIMR, I want to work in a lab focused on neuro-oncology or immunotherapy. My specific interest is in myeloid cell reprogramming within the GBM tumor microenvironment — understanding what transcriptional programs distinguish pro-tumor microglia from anti-tumor ones, and whether small-molecule interventions can reverse the polarization. I am not yet equipped to design experiments independently, but I am equipped to pipette, to learn protocols without hand-holding, and to ask questions that push a project forward.

My grandmother's decline gave me the most important thing I could have: a problem I cannot stop thinking about.`,
        essayZh: `17个月前，我的祖母被诊断出患有胶质母细胞瘤。第6个月，她已认不出我的名字；第11个月，她就离开了。GBM经最佳治疗后的中位生存期为14.6个月，而她只有11个月。我眼睁睁地看着那个我认识的最聪慧的女人渐渐消失——我无法理解为什么治疗手段如此有限。

这个问题驱使我去找学校的生物老师，他向我介绍了PubMed。我自学阅读原始文献：从综述文章开始，到我几乎看不懂的方法部分，再到需要反复阅读三遍的结果。我了解了血脑屏障对药物渗透的真正影响，明白了为何替莫唑胺的疗效会遭遇瓶颈，并开始着迷于肿瘤微环境——特别是胶质母细胞瘤如何将小胶质细胞从肿瘤抑制者转变为肿瘤促进者。

在SIMR，我希望进入一个专注于神经肿瘤学或免疫疗法的实验室。我的具体兴趣在于GBM肿瘤微环境中的髓系细胞重编程——了解是什么转录程序区分了促肿瘤小胶质细胞和抗肿瘤小胶质细胞，以及小分子干预是否能逆转其极化。我目前还不具备独立设计实验的能力，但我能熟练移液、无需手把手指导地学习实验流程，并提出能推动项目进展的问题。

祖母的去世给了我最宝贵的东西：一个我无法停止思考的问题。`,
        wordCount: 312,
        year: 2023,
        outcome: "Accepted",
      },
    ],
  },
  {
    programName: "PROMYS",
    programSlug: "promys",
    essays: [
      {
        id: "promys-1",
        programName: "PROMYS",
        programSlug: "promys",
        prompt:
          "What mathematical topic have you explored deeply on your own, and what did the process of that exploration teach you?",
        promptZh:
          "你曾独立深入探索过哪个数学话题，这个探索过程教会了你什么？",
        essay: `Last summer, I spent four weeks trying to prove a conjecture I had made up myself, which turned out to be false, which turned out to be the most mathematically formative experience of my life.

I had been reading about perfect numbers — integers equal to the sum of their proper divisors — and became fixated on a question: for any prime p, does there always exist an even perfect number divisible by p? I could verify it computationally for small primes, and the Euler-Euclid theorem gave me a framework, but I could not produce a proof.

I spent three weeks accumulating machinery: properties of Mersenne primes, density estimates, connections to the Lenstra-Pomerance-Wagstaff conjecture. I filled two notebooks. I thought I had found a near-proof involving the structure of the multiplicative group modulo a Mersenne prime.

Then I found a counterexample. p = 11 does not divide any known even perfect number, and the heuristic arguments suggest it may never. My "theorem" collapsed.

What PROMYS would give me is the ability to recognize, faster, which directions are promising. I don't want to stop making conjectures — I want to make better ones, and I want to understand the landscape well enough to know when I'm close to something real and when I'm about to walk into a swamp. That requires not just more mathematics, but a different relationship with uncertainty: learning to find failure generative rather than terminal.`,
        essayZh: `去年夏天，我花了四周时间试图证明一个我自己提出的猜想，结果发现这个猜想是错的——而这却成了我数学生涯中最具塑造意义的经历。

我当时正在阅读有关完美数的内容——即等于其真因子之和的整数——并开始执着于一个问题：对于任意素数p，是否总存在一个能被p整除的偶完美数？对于小素数，我可以通过计算验证，欧拉-欧几里得定理也给了我一个框架，但我无法给出证明。

我花了三周时间积累工具：梅森素数的性质、密度估计、与Lenstra-Pomerance-Wagstaff猜想的联系。我写满了两本笔记本，以为找到了一个涉及梅森素数模乘群结构的近似证明。

然后我找到了一个反例。p = 11不能整除任何已知的偶完美数，而启发式论证表明它可能永远不会。我的"定理"就此崩塌。

PROMYS能给我的，是更快地识别哪些方向是有前景的能力。我不想停止提出猜想——我想提出更好的猜想，我想足够了解这片数学疆域，知道自己什么时候接近了某个真实的东西，什么时候即将走进泥潭。这不仅需要更多的数学知识，还需要与不确定性建立不同的关系：学会把失败当作生产性的，而非终结性的。`,
        wordCount: 290,
        year: 2024,
        outcome: "Accepted",
      },
    ],
  },
  {
    programName: "UCSB SHIPS (REEF)",
    programSlug: "ucsb-ships",
    essays: [
      {
        id: "ucsb-ships-1",
        programName: "UCSB SHIPS (REEF)",
        programSlug: "ucsb-ships",
        prompt:
          "Why are you interested in marine science or environmental research? Describe any relevant experience you have.",
        promptZh:
          "你为什么对海洋科学或环境研究感兴趣？请描述任何相关经历。",
        essay: `The first time I collected a water sample from the Santa Barbara Channel, I was twelve years old. My father worked on a research vessel and occasionally brought me along on non-critical monitoring trips. I watched a graduate student measure chlorophyll-a fluorescence and asked, with characteristic twelve-year-old bluntness, why it mattered. She explained phytoplankton biomass, carbon sequestration, and the food web in a way that collapsed the ocean from something beautiful and distant into something I was embedded in.

That interaction did not immediately launch a research career. I went home and forgot about it for a year. But the question — why does what happens in the surface ocean matter for what happens everywhere else — never fully left me.

Since then, I have read extensively about the biological pump, completed a self-directed literature review on eddies and cross-shelf transport, and taught myself the basics of R to analyze publicly available NOAA buoy data for anomalous SST patterns during the 2023 marine heatwave event. My current hypothesis, which I cannot test without lab access, is that phytoplankton community composition in anomalously warm water differs measurably from climatological baselines in ways that affect remineralization depth.

SHIPS would give me the lab infrastructure and mentorship to move from armchair hypothesis to testable protocol. More than results, I want the experience of scientific rigor — learning what it means to design a control, to replicate, to doubt your own data.`,
        essayZh: `我第一次从圣巴巴拉海峡采集水样时，只有12岁。我父亲在一艘科考船上工作，偶尔会带我参加一些非关键性监测任务。我看着一名研究生测量叶绿素a荧光，带着12岁孩子特有的直率问道，这有什么意义？她以一种让我豁然开朗的方式解释了浮游植物生物量、碳封存和食物链——那一刻，大海从美丽而遥远的存在变成了我置身其中的世界。

那次交流并没有立刻开启我的科研之路。我回家后，这件事搁置了整整一年。但那个问题——海洋表层发生的事情为何关乎其他一切——从未真正离开我。

此后，我广泛阅读了有关生物泵的文献，独立完成了关于涡旋和跨陆架输运的文献综述，并自学了R语言，用于分析NOAA公开的浮标数据，寻找2023年海洋热浪事件中海表温度的异常规律。我目前的假设——还无法在没有实验室条件的情况下验证——是异常高温水域中的浮游植物群落组成与气候基线存在可测量的差异，并以影响再矿化深度的方式体现出来。

SHIPS能给我提供实验室基础设施和导师指导，让我从"纸上谈兵"的假设走向可测试的研究方案。比结果更重要的，是我想体验科学严谨性——学习什么是设计对照组、什么是重复实验、什么是质疑自己的数据。`,
        wordCount: 308,
        year: 2024,
        outcome: "Accepted",
      },
    ],
  },
];
