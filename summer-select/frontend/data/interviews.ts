/**
 * Static interview preparation content for 2 Summer Select programs.
 * Each entry contains program-specific questions with sample answers
 * in both English and Chinese.
 */

export interface InterviewQA {
  id: string;
  question: string;
  questionZh: string;
  /** Tips on how to approach this question */
  tips: string;
  tipsZh: string;
  /** A sample strong answer */
  sampleAnswer: string;
  sampleAnswerZh: string;
}

export interface InterviewGuide {
  programName: string;
  programSlug: string;
  formatNote: string;
  formatNoteZh: string;
  questions: InterviewQA[];
}

export const INTERVIEW_GUIDES: InterviewGuide[] = [
  {
    programName: "RSI (Research Science Institute)",
    programSlug: "rsi",
    formatNote:
      "RSI interviews are conducted virtually by admissions staff and focus heavily on your intellectual interests and research potential. Expect 20–30 minutes. The interviewer will probe your application essays and push for specificity.",
    formatNoteZh:
      "RSI面试由招生工作人员通过视频进行，重点考察你的学术兴趣和科研潜力。时长约20-30分钟，面试官会深入追问你的申请文书，要求你给出具体细节。",
    questions: [
      {
        id: "rsi-q1",
        question:
          "Walk me through your most significant science or math project. What was your specific contribution?",
        questionZh:
          "请介绍你最重要的科学或数学项目。你具体的贡献是什么？",
        tips:
          "Be extremely specific. Don't say 'I studied machine learning' — say what dataset you used, what model architecture you implemented, what the output was, and what would improve it. RSI interviewers are often practicing scientists who can detect vagueness immediately.",
        tipsZh:
          "要非常具体。不要说「我学习了机器学习」，而应说明你使用了什么数据集、实现了什么模型架构、输出是什么，以及如何改进。RSI面试官通常是在职科学家，能立即察觉模糊之处。",
        sampleAnswer:
          "Last year I built a classifier to distinguish editorial bias in news article headlines using a fine-tuned DistilBERT model trained on the AllSides media bias dataset. My specific contribution was the preprocessing pipeline — I wrote code to scrape and deduplicate ~80,000 articles, then designed a balanced sampling strategy to avoid training on the center-heavy distribution of the raw dataset. Final validation accuracy was 71%, which is modest, but I later traced the ceiling to ambiguities in the ground-truth labels themselves, not model capacity. The most interesting failure was that the model learned to use pronoun frequency as a proxy for bias, which is partially valid but brittle. A cleaner version would need to explicitly de-correlate stylistic from substantive features.",
        sampleAnswerZh:
          "去年，我基于AllSides媒体偏见数据集，使用微调后的DistilBERT模型构建了一个新闻标题编辑倾向分类器。我的具体贡献是数据预处理流程——我编写了爬虫代码，整理并去重了约8万篇文章，然后设计了一种平衡采样策略，以避免在原始数据集中心派别过多的分布上训练。最终验证准确率为71%，比较一般，但我后来发现性能瓶颈在于真实标签本身的模糊性，而非模型容量。最有趣的失败案例是，模型学会了将代词频率作为偏见的代理指标，这有一定道理，但很脆弱。更好的版本需要显式地将风格特征与实质性特征解相关。",
      },
      {
        id: "rsi-q2",
        question:
          "What scientific question do you want to spend your career on, and why that one?",
        questionZh: "你想将职业生涯用于研究哪个科学问题，为什么是这个问题？",
        tips:
          "This tests whether you have a genuine intellectual obsession versus a 'good student' profile. The best answers name a specific open problem, explain what makes it hard, and connect it to a broader research landscape. Vague answers like 'I want to cure cancer' will hurt you.",
        tipsZh:
          "这道题考查你是否有真正的学术热情，而非单纯的「好学生」形象。最好的回答应该点名一个具体的开放性问题，解释为什么它很难解决，并将其置于更广泛的研究背景中。「我想治愈癌症」这类模糊回答会适得其反。",
        sampleAnswer:
          "The problem I keep returning to is protein folding dynamics — not the static structure prediction AlphaFold solved, but the kinetic pathways by which intrinsically disordered proteins transition between functional states. This matters because many transcription factors and signaling proteins are partially disordered, and their function is inseparable from their motion. The hard part is that these pathways are stochastic, fast, and heterogeneous — they don't have a single 'correct' conformation to predict, which is why most structure prediction frameworks don't address them. I want to understand whether single-molecule FRET combined with coarse-grained simulation can map the conformational ensemble of a specific IDP in a way that's both physically interpretable and clinically relevant.",
        sampleAnswerZh:
          "我不断思考的问题是蛋白质折叠动力学——不是AlphaFold已经解决的静态结构预测，而是本质无序蛋白在功能状态之间转变的动力学路径。这很重要，因为许多转录因子和信号蛋白是部分无序的，其功能与其运动状态密不可分。难点在于这些路径是随机的、快速的、高度异质的——它们没有一个「正确」的构象可以预测，这也是为什么大多数结构预测框架都不涉及它们。我想弄清楚，将单分子FRET与粗粒化模拟相结合，是否能以一种既具有物理可解释性又具有临床相关性的方式，绘制特定IDP的构象集合图谱。",
      },
      {
        id: "rsi-q3",
        question:
          "Tell me something you believe that most people in your school would disagree with.",
        questionZh:
          "说一件你相信但学校里大多数人会不同意的事情。",
        tips:
          "RSI is assessing intellectual courage and independent thinking. A safe, consensus answer signals conformity. Choose a position you actually hold, can defend with evidence, and that demonstrates your engagement with real intellectual debates — not social opinions.",
        tipsZh:
          "RSI在评估你的学术勇气和独立思考能力。给出安全的、符合主流共识的答案会显示出你的从众性。选择一个你真实持有、能用证据捍卫，并体现你参与真实学术争论的立场——而非社会观点。",
        sampleAnswer:
          "I think the emphasis on 'reproducibility crisis' in psychology overstates the problem in a way that's actually harmful to the field. Not because the crisis isn't real — many effects don't replicate — but because the push toward large, pre-registered, WEIRD-sample studies has created a preference for average effects over mechanistic understanding. We've gotten better at detecting that an effect exists in a population and worse at understanding why it exists for any individual. The field would benefit from a parallel track that prioritizes intensive single-subject and N-of-1 designs alongside the statistical power movement, rather than treating them as methodologically inferior.",
        sampleAnswerZh:
          "我认为心理学界对「可重复性危机」的强调夸大了问题，并且这种夸大实际上对该领域有害。不是因为危机不真实——许多效应确实无法重现——而是因为对大规模、预注册、WEIRD样本研究的推崇，造成了一种偏好平均效应而非机制理解的倾向。我们在统计层面越来越擅长检测某个效应是否在群体中存在，却越来越不擅长理解它为何对任何特定个体存在。该领域需要在统计力量运动之外，并行发展一条优先考虑密集单被试和N-of-1设计的研究轨道，而非将其视为方法论上的劣选。",
      },
    ],
  },
  {
    programName: "SIMR (Stanford Institutes of Medicine Summer Research Program)",
    programSlug: "simr",
    formatNote:
      "SIMR does not formally interview all applicants, but finalists and alternates may be contacted for a brief informational call. These are low-pressure but should demonstrate genuine scientific curiosity, lab readiness, and familiarity with your stated research interest area.",
    formatNoteZh:
      "SIMR并非对所有申请者进行正式面试，但最终候选人和候补者可能会被联系进行简短的信息沟通电话。这类电话压力不大，但应展现出真正的科学好奇心、实验室准备情况，以及对你所陈述的研究兴趣领域的熟悉程度。",
    questions: [
      {
        id: "simr-q1",
        question:
          "Why do you want to do research specifically in a biomedical or clinical science lab this summer, rather than another science program?",
        questionZh:
          "你为什么要在今年夏天特别选择在生物医学或临床科学实验室做研究，而不是选择其他科学项目？",
        tips:
          "SIMR is looking for applicants who understand the difference between classroom biology and bench research. Demonstrating awareness of what a wet lab actually involves — protocols, failure rates, long timescales — signals lab readiness. Connecting to a personal motivation (illness, family experience, a specific disease) adds authenticity.",
        tipsZh:
          "SIMR寻找的是了解课堂生物学与实验台科研之间区别的申请者。展现出对湿实验室实际工作内容的了解——实验流程、失败率、漫长的时间跨度——能够体现实验室准备程度。结合个人动机（疾病、家庭经历、特定疾病）能增添真实性。",
        sampleAnswer:
          "I want to do bench research because I've hit the ceiling of what I can learn from papers alone. I can read about Western blots, flow cytometry, and primary cell culture — I understand conceptually what they measure and why — but I don't have any intuition for when something has gone wrong, what normal variation looks like, or how to troubleshoot. SIMR specifically appeals because the translational focus means I'd be working near clinically relevant questions rather than purely mechanistic ones. My interest is in tumor immunology, and I specifically want to understand how the protocols in the lab relate to the patient outcomes you'd want to change. That connective tissue between bench and bedside is something I can't build from literature alone.",
        sampleAnswerZh:
          "我想做实验室科研，因为单靠阅读文献，我已经触及了学习的上限。我可以读到关于蛋白质印迹、流式细胞术和原代细胞培养的内容——在概念层面理解它们测量什么、为何这样做——但我对于何时出了问题、正常变异是什么样子、如何排除故障，还没有任何直觉。SIMR特别吸引我，是因为其转化医学的重点意味着我将在接近临床相关问题的环境中工作，而非纯粹的机制性研究。我对肿瘤免疫学感兴趣，特别想了解实验室中的实验方案与你希望改变的患者预后之间的关联。这种连接实验台与临床的纽带，是我无法单靠文献构建的。",
      },
      {
        id: "simr-q2",
        question:
          "Describe the last scientific paper you read outside of school. What did you take away from it?",
        questionZh:
          "描述你最近在学校之外阅读的一篇科学论文。你从中有什么收获？",
        tips:
          "This question filters out applicants who listed their interests on their application but don't actually read primary literature. Be specific: name the paper, the journal, the year, the key finding. Bonus points for describing a limitation you noticed or a follow-up question it raised.",
        tipsZh:
          "这道题是筛查器，用来过滤那些在申请中声称有兴趣，但实际上并不阅读原始文献的申请者。要具体：说出论文的名称、期刊、年份和核心发现。如果你还能指出一个你注意到的局限性，或者它引发了什么后续问题，那就更加分了。",
        sampleAnswer:
          "A few weeks ago I read a 2023 Nature Immunology paper by Mrdjen et al. examining the clonal evolution of tissue-resident macrophages in the brain during glioma progression. The core finding was that microglia-derived macrophages within the tumor undergo selection for specific TCF4-driven transcriptional programs that suppress cytotoxic T cell infiltration. What I took away was methodological: they used single-cell ATAC-seq to map chromatin accessibility changes alongside scRNA-seq, and the integration of those two modalities gave them mechanistic resolution they couldn't have gotten from transcriptomics alone. The limitation I flagged for myself is that the mouse glioma models used (GL261) are much more immunogenic than human GBM, which raises questions about whether the TCF4 pathway operates similarly in patients. That's the follow-up I'd want to see.",
        sampleAnswerZh:
          "几周前，我阅读了2023年发表在《自然免疫学》上的一篇论文，作者是Mrdjen等人，研究了脑胶质瘤进展过程中组织驻留巨噬细胞的克隆进化。核心发现是：肿瘤内源自小胶质细胞的巨噬细胞会经历选择，形成特定的TCF4驱动转录程序，从而抑制细胞毒性T细胞的浸润。我收获最大的是方法论层面：他们结合单细胞ATAC-seq和scRNA-seq，通过整合这两种模态，获得了单独使用转录组学无法达到的机制分辨率。我自己标注的一个局限性是：所用的小鼠胶质瘤模型（GL261）比人类GBM的免疫原性高得多，这使得TCF4通路在患者体内是否同样运作成了一个问题。这正是我希望看到的后续研究方向。",
      },
    ],
  },
];
