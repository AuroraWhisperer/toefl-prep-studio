// Locally authored TOEFL study notes; examples are original, not ETS questions.
window.foundationChapters = [
  {
    id: 'sentence',
    title: '句子重组与长句骨架',
    group: '托福语法',
    description: '组句先找谓语和补语，阅读长句先还原主干；集中处理插入、并列、倒装和省略。',
    topics: [
      {
        id: 'main-clause',
        title: '长修饰语中找真正的谓语',
        pattern: '主语 + 修饰部分 + 谓语',
        read: '例句中 offered 是“提供的”，varies 才是“有所不同”。',
        explain:
          'offered by each department 修饰 courses；全句主语中心词是 range，谓语用 varies，不能把 offered 当主句动作。',
        next: '遇到多个动词形式 → 圈出带时态的谓语 → 核对谁在做主句动作。',
        examples: [
          [
            'The range of courses offered by each department varies considerably.',
            '各系提供的课程种类差异很大。',
          ],
        ],
      },
      {
        id: 'verb-complement',
        title: '宾语后的状态补充',
        pattern: 'find / consider + 宾语 + 形容词',
        read: 'found the instructions confusing 表示“觉得说明令人困惑”。',
        explain: 'confusing 描述 instructions，不是修饰 found 的副词；组句时宾语要放在评价之前。',
        next: '看到 find 或 consider → 找评价对象 → 检查后面是在描述对象的状态。',
        examples: [
          [
            'Several participants found the instructions confusing.',
            '几名参与者觉得说明令人困惑。',
          ],
        ],
      },
      {
        id: 'formal-object-it',
        title: '先用 it 占住宾语位置',
        pattern: 'find / make it + 形容词 + to do',
        read: 'make it easier to compare 表示“让比较更容易”。',
        explain:
          'it 暂代后面的动作，easier 是对 compare 的评价；不能直接写 make easier to compare 而漏掉宾语。',
        next: '遇到 make it → 接评价 → 检查真正的动作是否由 to 引出。',
        examples: [
          [
            'The chart makes it easier to compare the two methods.',
            '这张图表让两种方法更容易比较。',
          ],
        ],
      },
      {
        id: 'there-seem',
        title: '存在句接推测或完成时',
        pattern: 'there seems to be / there have been',
        read: 'there seems to be 表示“似乎有”，不指具体地点。',
        explain: 'seems 随后面的单数名词变化；复数用 seem。存在句不再另加一个 it 作主语。',
        next: '看见 there → 确认是存在句 → 用后接名词核对 be 和 seems 的形式。',
        examples: [
          ['There seems to be a gap between the two estimates.', '两项估算之间似乎存在差距。'],
        ],
      },
      {
        id: 'apposition',
        title: '逗号里的名词解释谁',
        pattern: '名词, 同位语, 谓语',
        read: 'a form of low-cost transport 是对 cycling 的解释。',
        explain: '中间名词短语补充身份，不构成新句；删去它后 Cycling reduces… 仍完整。',
        next: '遇到名词插入语 → 暂时括起 → 连读主语和主句谓语。',
        examples: [
          [
            'Cycling, a form of low-cost transport, reduces demand for parking.',
            '骑自行车是一种低成本交通方式，能减少停车需求。',
          ],
        ],
      },
      {
        id: 'not-only-inversion',
        title: 'not only 放句首时的倒装',
        pattern: 'Not only + 助动词 + 主语 + 动词',
        read: 'Not only did… 表示“不仅……”，强调第一个作用。',
        explain: '句首 not only 引出的分句倒装，did 后用原形；but also 后的分句通常仍按陈述语序。',
        next: '看到句首 not only → 找助动词 → 检查第二分句没有无故倒装。',
        examples: [
          [
            'Not only did the policy reduce waste, but it also lowered costs.',
            '这项政策不仅减少了浪费，还降低了成本。',
          ],
        ],
      },
      {
        id: 'only-inversion',
        title: 'only 加状语放句首',
        pattern: 'Only after / when… + 助动词 + 主语',
        read: 'Only after the second trial 表示“直到第二次试验后才”。',
        explain:
          '限制的是时间状语，主句用 did…notice；only 修饰主语时不套此倒装，如 Only one student noticed。',
        next: '定位 only 限制的成分 → 若是句首状语，检查主句倒装。',
        examples: [
          [
            'Only after the second trial did researchers notice the pattern.',
            '直到第二次试验后，研究人员才注意到这一规律。',
          ],
        ],
      },
      {
        id: 'negative-fronting',
        title: 'rarely 等否定词前置',
        pattern: 'Rarely / Never + 助动词 + 主语',
        read: 'Rarely have… 表示“很少曾经……”。',
        explain:
          'rarely 提到句首触发倒装；完成时提前 have，过去分词的位置不变。普通位置是 have rarely observed。',
        next: '看到句首否定副词 → 还原普通语序 → 检查时态未改变。',
        examples: [
          [
            'Rarely have researchers observed such a rapid recovery.',
            '研究人员很少观察到如此迅速的恢复。',
          ],
        ],
      },
      {
        id: 'emphasis-cleft',
        title: '强调句中找被强调的信息',
        pattern: 'It is / was…that…',
        read: 'It was the cost that… 强调“正是费用”。',
        explain:
          '去掉 It was 和 that 可还原正常句；这里 that 连接强调结构，不是修饰 cost 的普通定语从句。',
        next: '遇到 It is…that → 去掉框架还原 → 判断强调的是谁、时间还是原因。',
        examples: [
          [
            'It was the cost that prevented the project from expanding.',
            '正是费用阻碍了项目扩展。',
          ],
        ],
      },
      {
        id: 'what-cleft',
        title: 'what 引导的重点句',
        pattern: 'What…is…',
        read: 'What we need is… 表示“我们需要的是……”。',
        explain: 'what we need 整体作主语，what 包含“所需的东西”；后半句点出真正重点。',
        next: '看到 what 开头 → 把从句当整体 → 找 is 后的新信息。',
        examples: [
          [
            'What the team needs is a more reliable source of data.',
            '团队需要的是更可靠的数据来源。',
          ],
        ],
      },
      {
        id: 'ellipsis-comparison',
        title: '比较从句中省掉重复成分',
        pattern: 'than expected / than…does',
        read: 'than expected 表示“比预期的……”。',
        explain:
          '省略的是可从语境恢复的内容，相当于 than was expected；不能因未出现完整主谓就误判缺句子。',
        next: '看到 than 后很短 → 补回隐含的比较对象 → 核对比较维度相同。',
        examples: [['The experiment took longer than expected.', '实验所用时间比预期更长。']],
      },
      {
        id: 'substitution-do-so',
        title: 'do so 代替前面的动作',
        pattern: 'do so / do not',
        read: 'do so 指前文已说明的“申请”。',
        explain: 'so 不代表名词，而是替代 apply 这一动作；时间信息仍由后面的 by Friday 决定。',
        next: '遇到 do so → 往前找具体动作 → 连同条件和期限一起还原。',
        examples: [
          [
            'Students who wish to apply must do so by Friday.',
            '想申请的学生必须在周五前提出申请。',
          ],
        ],
      },
      {
        id: 'shared-subject',
        title: '一个主语带多个谓语',
        pattern: '主语 + 动词…, and + 动词…',
        read: 'collected 和 compared 都是团队的动作。',
        explain: 'and 连接两个谓语，第二个不必再写主语；不能误把 compared 看成修饰 data 的分词。',
        next: '遇到 and 后动词 → 找共同主语 → 检查两动作的时态是否协调。',
        examples: [
          [
            'The team collected samples and compared their chemical composition.',
            '团队采集了样本，并比较了它们的化学成分。',
          ],
        ],
      },
      {
        id: 'noun-stack',
        title: '多个名词连续出现',
        pattern: '名词修饰语 + 中心名词',
        read: 'student housing policy 的核心是 policy，即“政策”。',
        explain:
          '前面 student、housing 限定哪种政策；先读末尾中心词，再往前补含义，别把三个名词拆成三个事件。',
        next: '看到名词串 → 先找末尾中心词 → 从右向左补清对象。',
        examples: [
          ['The university revised its student housing policy.', '大学修订了学生住宿政策。'],
        ],
      },
      {
        id: 'correlative-position',
        title: '成对连接词的位置对齐',
        pattern: 'both… and… / not only… but also…',
        read: 'both the cost and the reliability 比较的是两个名词。',
        explain: '两端应连接同层级成分；both 紧贴第一项，不能一端连名词另一端突然连完整句子。',
        next: '定位成对连接词 → 给两端划界 → 检查形式与意义都平行。',
        examples: [
          [
            'The committee considered both the cost and the reliability of the system.',
            '委员会同时考虑了系统的成本和可靠性。',
          ],
        ],
      },
      {
        id: 'parallel',
        title: '并列结构：连接的成分要对齐',
        pattern: 'reading and writing；to plan and organize',
        read: 'collecting（收集）、checking（核对）、writing（撰写）是例句中并列的三个活动。',
        explain:
          'and 连接同层级的内容时，保持语法结构平行。例句的三个活动都用 -ing，不能把中间一项突然换成 to check。',
        next: '看到 and、or 或列表 → 给并列成分划线 → 检查它们是否承担同一作用、形式是否协调。',
        examples: [
          [
            'The job involves collecting data, checking results, and writing reports.',
            '这项工作包括收集数据、核对结果和撰写报告。',
          ],
        ],
      },
    ],
  },
  {
    id: 'clauses',
    title: '名词性从句与间接问句',
    group: '托福语法',
    description: '组句和邮件常用：先辨明“什么／是否／哪里”，再处理从句语序、连接词和否定范围。',
    topics: [
      {
        id: 'that-what',
        title: 'that / what：从句是否缺内容',
        pattern: 'I know that…；I know what…',
        read: 'what she needs 是“她需要的东西”，what 同时补上 needs 的对象。',
        explain:
          'that 引出一个结构完整的陈述内容，本身不充当主宾语；what 常表示“……的事物”，在小句中充当成分。不要在 what 前再重复写 the thing。',
        next: '判断 that 还是 what → 暂时拿掉连接词 → 小句缺“什么”就考虑 what，结构完整则考虑 that。',
        examples: [
          ['I know that she needs help.', '我知道她需要帮助。'],
          ['I know what she needs.', '我知道她需要什么。'],
        ],
      },
      {
        id: 'indirect-questions',
        title: '间接问句：后半句恢复陈述语序',
        pattern: 'Could you tell me where the office is?',
        read: 'where the office is 是“办公室在哪里”，嵌在礼貌请求里面。',
        explain:
          '直接问 Where is the office?；放进 tell me 后，内部用“主语 + 谓语”，不再倒装。主句本身可以仍是问句，所以整句可保留问号。',
        next: '看到 know、wonder、tell me 后的疑问内容 → 找内部主语 → 检查是否误用了 is the office 或 does it… 的直接问句顺序。',
        examples: [
          ['Could you tell me when the workshop starts?', '你能告诉我工作坊什么时候开始吗？'],
        ],
      },
      {
        id: 'if-whether',
        title: 'if / whether 表示“是否”',
        pattern: 'whether or not；whether to do；if + 从句',
        read: 'whether the lab is open 是“实验室是否开放”，不是假设开放以后的结果。',
        explain:
          '引出间接的是非问题时，if、whether 常都可以；介词后以及 to do 前通常用 whether，如 decide whether to go。if 还可以表“如果”，要靠整句判断。',
        next: '遇到 if / whether → 先分“是否”与“如果” → 再看前面是否为介词、后面是否为 to do。',
        examples: [
          ['I am not sure whether the lab is open today.', '我不确定实验室今天是否开放。'],
          ['We need to decide whether to postpone the trip.', '我们需要决定是否推迟这次出行。'],
        ],
      },
      {
        id: 'embedded-modal',
        title: '间接问句里情态动词不提前',
        pattern: 'where + 主语 + can / might + 动词',
        read: 'where I can find 表示“我在哪里能找到”。',
        explain: '外层 Could you tell me 已经承担提问；内层 where 从句按主语在前、can 在后的顺序。',
        next: '看到问句套问句 → 划出内层 → 检查 can 是否仍在主语后。',
        examples: [
          [
            'Could you tell me where I can find the revised schedule?',
            '你能告诉我在哪里能找到修改后的日程吗？',
          ],
        ],
      },
      {
        id: 'embedded-do',
        title: '间接问句去掉提问用的 do',
        pattern: 'when + 主语 + 动词',
        read: 'when the session starts 是“活动什么时候开始”。',
        explain:
          'do/does 若只用于直接提问，改成间接问句时去掉，时态回到 starts；强调用 do 则是另一结构。',
        next: '先还原直接问句 → 去掉提问助动词 → 检查实义动词时态。',
        examples: [['I wonder when the session starts.', '我想知道活动什么时候开始。']],
      },
      {
        id: 'embedded-subject',
        title: 'who 自己作从句主语',
        pattern: 'who + 谓语 / who + 主语 + 谓语',
        read: 'who submitted… 询问“谁提交了”，who 就是主语。',
        explain:
          '不能机械地在 who 后添加一个人称主语；who the tutor recommended 则是推荐了谁，已有 the tutor 作主语。',
        next: '看 who 后是否缺动作执行者 → 决定 who 是主语还是宾语。',
        examples: [['Do you know who submitted the proposal?', '你知道谁提交了这份提案吗？']],
      },
      {
        id: 'wh-infinitive',
        title: '疑问词后接不定式',
        pattern: 'how / where / what / whether + to do',
        read: 'how to interpret 表示“怎样解释”。',
        explain: '省略的是语境明确的执行者；whether to do 表示是否去做，不能替换成 if to do。',
        next: '看见疑问词 + to → 还原谁来做 → 检查疑问词符合所问信息。',
        examples: [
          ['The guide explains how to interpret the results.', '指南说明了如何解读结果。'],
        ],
      },
      {
        id: 'subject-clause',
        title: '整段从句作主语',
        pattern: 'Whether / What… + 谓语',
        read: 'Whether the plan will work 是“计划是否有效”这一问题。',
        explain: '整个从句作单一事项时主句通常用单数谓语；从句内部依旧用陈述语序。',
        next: '句首从句较长 → 先整体括起 → 找主句真正的谓语。',
        examples: [['Whether the plan will work remains uncertain.', '该计划是否有效仍不确定。']],
      },
      {
        id: 'anticipatory-that',
        title: '用 it 引出事实判断',
        pattern: 'It is clear / likely that…',
        read: 'It is likely that… 表示“很可能……”。',
        explain: 'it 是形式主语，that 从句才是被判断的内容；that 后必须有完整的主谓结构。',
        next: '看到 It is + 判断词 → 找 that 从句 → 检查判断的内容是否完整。',
        examples: [['It is likely that demand will increase next year.', '需求很可能在明年增加。']],
      },
      {
        id: 'fact-that',
        title: '名词后的内容从句',
        pattern: 'the fact / possibility / claim that…',
        read: 'the possibility that… 表示“……的可能性”。',
        explain:
          'that 后说明 possibility 的具体内容；从句不缺主语或宾语，区别于补充“哪一个”的定语从句。',
        next: '看到抽象名词 + that → 检查从句是否完整 → 判断它是在解释内容。',
        examples: [
          [
            'We cannot ignore the possibility that the sample is too small.',
            '我们不能忽视样本过小的可能性。',
          ],
        ],
      },
      {
        id: 'report-backshift',
        title: '转述中的时态后移',
        pattern: 'said that…would / had…',
        read: 'said…would 表示过去作出的未来安排。',
        explain:
          '过去的转述常把 will 改成 would；若内容现在仍成立，也可能保留原时态，不能见 said 就一律改过去。',
        next: '先定位说话时间 → 判断内容是否仍成立 → 核对转述的时间关系。',
        examples: [
          [
            'The coordinator said that the room would be available the next day.',
            '协调员说第二天可以使用那个房间。',
          ],
        ],
      },
      {
        id: 'negative-raising',
        title: '否定 think 的理解范围',
        pattern: 'I do not think…',
        read: "I don't think…will 通常表达“我认为不会……”。",
        explain:
          '形式上 not 在 think 前，语义常是否定后面的判断；回答时不要误读为完全没有想过这件事。',
        next: "看到 don't think → 连同后面的判断一起理解 → 检查是否在委婉否定。",
        examples: [
          [
            "I don't think the change will solve the underlying problem.",
            '我认为这项调整解决不了根本问题。',
          ],
        ],
      },
      {
        id: 'whoever-whatever',
        title: '不限定具体人或物',
        pattern: 'whoever / whatever + 从句',
        read: 'whoever needs it 表示“任何需要它的人”。',
        explain: 'whoever 已包含“任何人”，整个从句作介词 to 的宾语；不要再加 anyone 形成重复主语。',
        next: '看到 -ever 连接词 → 确认“不限定”含义 → 检查从句缺的人或物由它承担。',
        examples: [
          ['The service is available to whoever needs it.', '任何有需要的人都可以使用这项服务。'],
        ],
      },
      {
        id: 'suggest-that',
        title: '建议从句的动词形式',
        pattern: 'suggest / recommend that + 主语 + (should) do',
        read: 'suggested that…be extended 表示建议延长，而非已延长。',
        explain:
          '正式建议从句可用原形 be，英式英语也常用 should be；不要根据 suggested 误改成 was 而改变语气。',
        next: '看到建议动词 + that → 判断建议尚未落实 → 检查从句用原形或 should。',
        examples: [
          ['The adviser suggested that the deadline be extended.', '导师建议延长截止期限。'],
        ],
      },
      {
        id: 'reason-why',
        title: '理由与结果不要错接',
        pattern: 'the reason why…is that…',
        read: 'the reason why… 指“……的理由”。',
        explain:
          'why 从句限定所解释的情况，that 从句给出原因；正式写作可用这一结构清楚分开问题与解释。',
        next: '先找要解释的结果 → 再找 that 后原因 → 检查因果方向。',
        examples: [
          [
            'The reason why we revised the survey is that several questions were unclear.',
            '我们修改调查问卷的原因是其中几个问题不清楚。',
          ],
        ],
      },
      {
        id: 'embedded-preposition',
        title: '介词后的疑问从句',
        pattern: 'about / on + what / how / whether…',
        read: 'on how people travel 表示“关于人们如何出行”。',
        explain: 'how 从句整体接在 on 后；它有自己的主语 people，不能按直接问句把 do 提前。',
        next: '看到介词后疑问词 → 将后段看作完整内容 → 检查陈述语序。',
        examples: [
          ['The study focuses on how people travel to work.', '这项研究重点考察人们如何通勤。'],
        ],
      },
    ],
  },
  {
    id: 'relatives',
    title: '定语从句与压缩修饰',
    group: '托福语法',
    description:
      '阅读、听力复述与组句：区分修饰对象，识别关系词、省略和分词短语，避免长句理解串线。',
    topics: [
      {
        id: 'relative-pronouns',
        title: '定语从句：补充“哪一个”',
        pattern: 'the student who…；the book that / which…',
        read: 'who sits next to me 表示“坐在我旁边的”，用来确定是哪位学生。',
        explain:
          'who 常指人，which 常指物，that 可用于限定性从句。关系词已在从句中充当成分，不要重复加 he 或 it；作宾语且无逗号时常可省略，作主语时不能随意省。',
        next: '名词后跟小句 → 找小句缺主语还是宾语 → 选关系词，检查是否多写了一个代词。',
        examples: [
          ['The student who sits next to me studies chemistry.', '坐在我旁边的那位学生学习化学。'],
          ['The book I borrowed is due tomorrow.', '我借的那本书明天到期。'],
        ],
      },
      {
        id: 'relative-place',
        title: 'where / when / whose：不是只看前面的词',
        pattern: 'the room where we meet；the room that we use；whose notes',
        read: 'where we meet 表示“我们见面的地方”；that we use 中缺少“使用什么”。',
        explain:
          'where 在从句中说明地点，when 说明时间；即使前面是地点名词，小句缺宾语时也常用 which / that。whose 表所属，后接名词，既可指人也可指物。',
        next: '遇到地点或时间名词 → 先看从句缺什么 → 缺地点状语选 where，缺对象则查 which / that。',
        examples: [
          ['This is the room where our club meets.', '这是我们社团聚会的房间。'],
          ['This is the room that we use for meetings.', '这是我们用来开会的房间。'],
        ],
      },
      {
        id: 'participles',
        title: '-ing 与过去分词：主动、被动与感受',
        pattern: 'students waiting；a report written…；boring / bored',
        read: 'students waiting 是“正在等待的学生”；a report written by… 是“由……写的报告”。',
        explain:
          '分词可缩短修饰语：waiting 的学生做等待动作，written 的报告承受写作动作。boring 表“令人无聊的”，bored 表“感到无聊的”，按意义判断，不按人或物硬分。',
        next: '名词旁有分词 → 判断名词与动作是主动还是被动 → 情绪词再分“使人产生感受”与“感到”。',
        examples: [
          ['The students waiting outside have an appointment.', '在外面等候的学生有预约。'],
          [
            'I found the lecture interesting, so I was not bored.',
            '我觉得讲座很有趣，所以并不觉得无聊。',
          ],
        ],
      },
      {
        id: 'relative-omission',
        title: '什么时候能省关系词',
        pattern: 'the report (that) we discussed',
        read: 'we discussed 后缺宾语，因此 that 可以省略。',
        explain: '限定性从句中作宾语的关系代词常可省；作主语的 who/that 通常不能直接删去。',
        next: '还原从句 → 找缺口是主语还是宾语 → 再判断能否省关系词。',
        examples: [
          [
            'The report we discussed yesterday is now available online.',
            '我们昨天讨论的报告现在已能在线获取。',
          ],
        ],
      },
      {
        id: 'nonrestrictive',
        title: '逗号里的补充信息',
        pattern: '名词, which / who… , …',
        read: 'which opened last year 补充说明图书馆的情况。',
        explain:
          '非限定性从句用逗号隔开，通常不使用 that，也不省关系词；删掉后仍能知道指哪一个对象。',
        next: '先看逗号和指代 → 判断是否额外补充 → 检查 who/which。',
        examples: [
          [
            'The new library, which opened last year, has extended its hours.',
            '新图书馆去年开放，现在延长了开放时间。',
          ],
        ],
      },
      {
        id: 'which-whole-clause',
        title: 'which 指前面整件事',
        pattern: '主句, which + 谓语',
        read: 'which reduced… 指前面整个改用线上报名的做法。',
        explain: 'which 不一定只指最近名词；用语义判断究竟是某个物体，还是整个事件产生了后果。',
        next: '遇到逗号 + which → 用“这件事”代入 → 检查因果是否合理。',
        examples: [
          [
            'Registration moved online, which reduced waiting times.',
            '报名改到线上，从而缩短了等待时间。',
          ],
        ],
      },
      {
        id: 'prep-relative',
        title: '关系词前的介词',
        pattern: 'in which / for which / to whom',
        read: 'in which 相当于“在其中”，修饰环境。',
        explain:
          '介词要来自从句中的关系，如 organisms live in an environment；介词前置时用 which/whom，不用 that。',
        next: '还原介词短语 → 确认 in/for/to 的含义 → 再连接先行词。',
        examples: [
          [
            'The environment in which an organism lives affects its behavior.',
            '生物所处的环境会影响其行为。',
          ],
        ],
      },
      {
        id: 'relative-quantity',
        title: '一群人或物中的一部分',
        pattern: 'some / most / none of whom / which',
        read: 'most of whom 表示“其中大多数人”。',
        explain:
          'whom 指前面的 volunteers（志愿者），of 表示整体中的部分；most of whom 整体作 had used（用过）的主语。',
        next: '看到数量词 + of → 找回整组对象 → 检查人用 whom、物用 which。',
        examples: [
          [
            'We interviewed thirty volunteers, most of whom had used the service.',
            '我们采访了三十名志愿者，其中大多数用过这项服务。',
          ],
        ],
      },
      {
        id: 'relative-one-of',
        title: 'one of those who 的一致',
        pattern: 'one of the students who have…',
        read: 'who have completed 修饰 students 这一组人。',
        explain:
          '通常按复数 students 配 have；the only one who has… 则把唯一的人作为关系从句的核心。',
        next: '找关系词真正修饰谁 → 区分一组中的一个与唯一一个 → 配谓语数。',
        examples: [
          [
            'She is one of the students who have completed the training.',
            '她是已完成培训的学生之一。',
          ],
        ],
      },
      {
        id: 'reduced-active',
        title: '主动定语从句压缩成 -ing',
        pattern: '名词 + doing…',
        read: 'students seeking funding 表示“正在寻求资助的学生”。',
        explain:
          'seeking 与 students 是主动关系，可理解为 who are seeking；分词短语不另充当主句谓语。',
        next: '确定被修饰名词 → 判断它主动做事 → 再找全句谓语。',
        examples: [
          [
            'Students seeking funding should contact the research office.',
            '寻求资助的学生应联系科研办公室。',
          ],
        ],
      },
      {
        id: 'reduced-passive',
        title: '被动修饰省略 who/which + be',
        pattern: '名词 + done…',
        read: 'data collected online 指“在线收集的数据”。',
        explain: '数据是被收集的，因此用 collected；不能改成 collecting，导致数据自己做收集动作。',
        next: '先问对象做动作还是承受动作 → 选 doing/done → 检查修饰位置。',
        examples: [
          [
            'The data collected online may not represent all residents.',
            '在线收集的数据可能无法代表所有居民。',
          ],
        ],
      },
      {
        id: 'relative-to-do',
        title: '不定式修饰先后与用途',
        pattern: 'the first / next…to do',
        read: 'the first researcher to notice the discrepancy 是“第一个注意到这一差异的研究人员”。',
        explain: '序数词后的不定式标出做动作的人；不是主句将来时，实际发生时间看主句和语境。',
        next: '看到 first/next + 名词 → 连读后面的 to do → 核对动作归属。',
        examples: [
          [
            'He was the first researcher to notice the discrepancy.',
            '他是第一个注意到这一差异的研究人员。',
          ],
        ],
      },
      {
        id: 'adjective-postposition',
        title: '形容词短语放名词后',
        pattern: 'resources available to…',
        read: 'resources available to students 指“学生可用的资源”。',
        explain:
          'available 带 to students 等补充内容时常放在名词后；不能把 available 当作独立谓语而漏掉 be。',
        next: '看到名词 + 形容词短语 → 先还原 which are → 再找主句动作。',
        examples: [
          [
            'The guide lists resources available to new students.',
            '指南列出了新生可以使用的资源。',
          ],
        ],
      },
      {
        id: 'participle-adverbial',
        title: '句首分词的动作是谁做的',
        pattern: 'Doing / Done…, 主语 + 谓语',
        read: 'Using the map 的执行者应是后面的 visitors。',
        explain:
          '句首分词通常与主句共享逻辑主语；若写 Using the map, the route was clear，就把路线写成了用地图者。',
        next: '读句首分词 → 立刻找主句主语 → 检查它能否执行该动作。',
        examples: [
          [
            'Using the map, visitors can locate the nearest entrance.',
            '访客可以用地图找到最近的入口。',
          ],
        ],
      },
      {
        id: 'having-done',
        title: '分词完成式表更早动作',
        pattern: 'Having done…, 主语 + 谓语',
        read: 'Having checked 表示“检查完之后”。',
        explain: '完成式突出检查先于公布；执行者仍需与主句主语相同，不是另一个团队的动作。',
        next: '看到 having done → 按先后排序 → 检查两动作的执行者。',
        examples: [
          [
            'Having checked the figures, the team released the report.',
            '核对数字后，团队发布了报告。',
          ],
        ],
      },
      {
        id: 'with-complex',
        title: 'with 引出伴随状态',
        pattern: 'with + 名词 + doing / done / 形容词',
        read: 'with the doors closed 表示“门关着的情况下”。',
        explain: 'doors 承受关闭动作，因此用 closed；整段交代伴随条件，不是独立完整句。',
        next: '找到 with 后对象 → 判断对象与状态的关系 → 再读主句。',
        examples: [
          ['The test must be conducted with the doors closed.', '测试必须在门关闭的情况下进行。'],
        ],
      },
    ],
  },
  {
    id: 'tense',
    title: '时态、被动与主谓一致',
    group: '托福语法',
    description:
      '补词与组句关注时间线、动作先后和真正主语；阅读研究过程时区分已完成、持续和被动状态。',
    topics: [
      {
        id: 'present-perfect',
        title: '现在完成时：过去与现在相连',
        pattern: 'have / has + 过去分词；since / for',
        read: 'have lost 表示“已经丢了”，例句关心的是现在没有钥匙这个结果。',
        explain:
          '现在完成时可讲经历、现在的结果或延续至今的状态。since 接起点，for 接时长；通常不和 yesterday 等明确结束的过去时间直接搭配。',
        next: '过去的事仍关联现在 → 考虑 have / has + 过去分词 → 检查时间范围，以及是否误配了已结束的具体时间。',
        examples: [
          ['I have lost my key, so I cannot open the door.', '我把钥匙弄丢了，所以现在开不了门。'],
          ['She has lived here for two years.', '她在这里住了两年了。'],
        ],
      },
      {
        id: 'past-perfect',
        title: '过去完成时：过去某时之前',
        pattern: 'had + 过去分词',
        read: 'had left 是“此前已经离开”，比 arrived（到达）更早。',
        explain:
          '有一个过去参照点，且需要强调更早的完成动作时，用 had + 过去分词。不是看到两个过去动作就全部用过去完成时。',
        next: '叙述两个过去时间 → 标出哪件更早 → 需要突出先后时，给较早动作加 had，后一个保持过去时。',
        examples: [
          [
            'When we arrived at the station, the train had already left.',
            '我们到车站时，火车已经开走了。',
          ],
        ],
      },
      {
        id: 'perfect-continuous',
        title: '完成进行时：持续做了多久',
        pattern: 'have / has been + -ing',
        read: 'have been working 表示“一直在做”，强调持续过程。',
        explain:
          '现在完成进行时常说明从过去持续到现在或刚停止的活动。现在完成时更适合突出完成数量，如 have written three pages（已写三页）；状态动词通常用完成时。',
        next: '想强调时长或过程 → 考虑 have been + -ing → 如果重点是已完成多少，改查现在完成时。',
        examples: [
          ['We have been working on this project all morning.', '我们整个上午一直在做这个项目。'],
        ],
      },
      {
        id: 'passive',
        title: '被动语态：强调谁受到动作',
        pattern: 'be + 过去分词；can be used；has been completed',
        read: 'was repaired 表示“被修好了”，主语 printer 是接受维修的对象。',
        explain:
          '被动由 be + 过去分词构成，时间体现在 be 或前面的助动词上。只有适合带对象的动词才能常规改成被动；happen 表“发生”时不说 was happened。',
        next: '主语是动作接受者 → 考虑被动 → 按时间配 be，再核对过去分词及是否需要交代执行者。',
        examples: [
          ['The printer was repaired yesterday.', '打印机昨天修好了。'],
          ['The results will be published next week.', '结果将于下周公布。'],
        ],
      },
      {
        id: 'agreement',
        title: '主谓一致：别被中间的名词带走',
        pattern: 'The list of courses is…；Each student has…',
        read: 'The list of courses 指“一份课程清单”，核心是单数 list，不是复数 courses。',
        explain:
          '动词与主语中心词一致，所以用 is。each、every 后的单数名词也搭配单数谓语；a number of students 用复数谓语，the number of students 用单数谓语。',
        next: '主语很长 → 暂时括起 of 等修饰部分 → 找中心词，再检查动词的单复数。',
        examples: [
          ['The list of required courses is on the website.', '必修课清单在网站上。'],
          ['Each student has a library card.', '每个学生都有一张借书证。'],
        ],
      },
      {
        id: 'perfect-vs-past',
        title: '研究延续至今，还是限定在过去',
        pattern: 'has increased / increased in 2022',
        read: 'since 2022 把起点连到现在，in 2022 只定位那一年。',
        explain:
          '完成时强调截至现在的变化，明确结束的过去时间通常配过去时；不要只看到年份就选过去时。',
        next: '圈出 since/in 等时间线索 → 判断是否延续到现在 → 选择时态。',
        examples: [
          ['Enrollment has increased steadily since 2022.', '自 2022 年以来，招生人数持续增长。'],
        ],
      },
      {
        id: 'by-time-past',
        title: '到过去某时已经完成',
        pattern: 'By the time…过去时, had done',
        read: 'by the time we arrived 是“等我们到达时”。',
        explain: '材料分发早于到达，前一动作使用 had distributed；两个动作不是同时发生。',
        next: '找到过去参照点 → 判断哪个更早完成 → 给更早动作配完成式。',
        examples: [
          [
            'By the time we arrived, the staff had distributed the materials.',
            '等我们到达时，工作人员已经分发了材料。',
          ],
        ],
      },
      {
        id: 'future-perfect',
        title: '到未来某时将已完成',
        pattern: 'will have done + by…',
        read: 'by next Friday 表示不晚于下周五完成。',
        explain:
          'will have analyzed 从未来截止点回看已完成的分析；与届时仍在做的 will be analyzing 不同。',
        next: '看到未来期限 → 判断强调完成还是进行 → 检查 have 后用过去分词。',
        examples: [
          [
            'By next Friday, we will have analyzed all the samples.',
            '到下周五，我们将完成所有样本的分析。',
          ],
        ],
      },
      {
        id: 'scheduled-future',
        title: '日程安排与预定动作',
        pattern: 'be scheduled / due / set to do',
        read: 'is scheduled to begin 表示“按计划开始”。',
        explain:
          'scheduled 后的 to begin 给出安排内容；计划不等于已经发生，读通知时要保留时间信息。',
        next: '听到 scheduled/due → 找具体动作和时间 → 不把安排当完成事实。',
        examples: [['The workshop is scheduled to begin at noon.', '研讨活动计划中午开始。']],
      },
      {
        id: 'stative-dynamic',
        title: '状态动词也要看实际含义',
        pattern: 'have / think / see 的状态与动作',
        read: 'is considering 表示正在考虑；believes 表示持有观点。',
        explain:
          'believe、belong 等状态通常不用进行时；think 表示考虑时可用进行时，表示观点时一般用普通时态。',
        next: '判断动词是在说状态还是过程 → 再选进行式 → 避免只背动词名单。',
        examples: [
          [
            'The team believes the method works but is considering alternatives.',
            '团队认为该方法有效，但正在考虑替代方案。',
          ],
        ],
      },
      {
        id: 'passive-progressive',
        title: '现在正在被处理',
        pattern: 'be being done / have been done',
        read: 'is being repaired 是“正在维修中”。',
        explain:
          'being 保留进行含义，repaired 表示承受动作；has been repaired 则强调已修好，两者影响设施是否能使用。',
        next: '数清 be/being/been → 判断过程还是结果 → 核对通知中的可用状态。',
        examples: [
          [
            'The main entrance is being repaired, so please use the side door.',
            '正门正在维修，请走侧门。',
          ],
        ],
      },
      {
        id: 'passive-reporting',
        title: '把报道或研究观点归于来源',
        pattern: 'be believed / reported to do',
        read: 'is believed to improve sleep quality 是“被认为能改善睡眠质量”。',
        explain: '这是他人的判断，不自动等于已证明的事实；to 后动作与主句报道同时或一般成立。',
        next: '遇到被认为/据报道结构 → 保留来源语气 → 不把观点升级成确定事实。',
        examples: [
          [
            'Regular exercise is believed to improve sleep quality.',
            '规律运动被认为能改善睡眠质量。',
          ],
        ],
      },
      {
        id: 'passive-perfect-infinitive',
        title: '被认为过去已经做过',
        pattern: 'be thought to have done',
        read: 'to have originated 表示起源早于现在的推测。',
        explain: '完成不定式把起源放在更早时间；不能只按 is thought 判断后面的事件发生在现在。',
        next: '分开“现在认为”和“过去发生” → 用 have done 标出先后。',
        examples: [
          [
            'The custom is thought to have originated in coastal communities.',
            '这一习俗被认为起源于沿海社区。',
          ],
        ],
      },
      {
        id: 'number-agreement',
        title: 'a number of 与 the number of',
        pattern: 'a number of…are / the number of…is',
        read: 'a number of 是“若干”，the number of 是“……的数量”。',
        explain: '前者实际指多个对象，配复数；后者中心词是 number，配单数。',
        next: '先翻译整个数量结构 → 找是在说对象还是数量 → 配谓语。',
        examples: [
          [
            'The number of applicants has risen, and a number of interviews have been added.',
            '申请人数增加了，因此新增了若干场面试。',
          ],
        ],
      },
      {
        id: 'proportion-agreement',
        title: '比例作主语看整体中的对象',
        pattern: 'half / most / 60% of + 名词',
        read: 'most of the equipment 表示大多数设备，equipment 不可数。',
        explain: 'of 后不可数名词通常配单数，复数人或物配复数；不能只看 most 就固定使用 are。',
        next: '找 of 后名词 → 判断单复数和可数性 → 再决定谓语。',
        examples: [
          [
            'Most of the equipment is new, but half of the computers are outdated.',
            '大部分设备是新的，但一半电脑已过时。',
          ],
        ],
      },
      {
        id: 'quantity-as-unit',
        title: '一段时间或金额作为整体',
        pattern: 'Three weeks is… / Ten dollars is…',
        read: 'Three weeks is… 把三周视为一段时间。',
        explain: '数量短语作为单一总量时可以用单数谓语；若讨论多个独立单位，语境可能不同。',
        next: '先判断是在说总时长还是逐个单位 → 再检查谓语数。',
        examples: [
          ['Three weeks is enough time to complete the pilot study.', '三周足以完成这项试点研究。'],
        ],
      },
    ],
  },
  {
    id: 'verb-forms',
    title: '非谓语与动词结构',
    group: '托福语法',
    description: '补词、组句和邮件中常见的动词后接法；重点辨清介词 to、动作先后、使役与感官结构。',
    topics: [
      {
        id: 'infinitives',
        title: '计划、决定、希望去做',
        pattern: 'plan / decide / hope / agree / manage + to do',
        read: 'decided to apply 是“决定申请”，to apply 说明决定的内容。',
        explain:
          '这些动词常接 to + 原形：plan to study、hope to return、manage to finish。否定不定式把 not 放在 to 前，如 decide not to go。不要写 decide doing。',
        next: '表达计划或决定 → 把前面的动词与 to do 一起记 → 检查 to 后是否原形，否定位置是否正确。',
        examples: [['She decided to apply for a research grant.', '她决定申请一笔研究资助。']],
      },
      {
        id: 'gerunds',
        title: '享受、避免、完成某活动',
        pattern: 'enjoy / avoid / finish / consider / suggest + doing',
        read: 'avoid making mistakes 是“避免犯错”，making 说明要避免的活动。',
        explain:
          '这些动词直接接活动时常用 -ing。suggest doing 表“建议做”，也可 suggest that…；不说 suggest someone to do。practice doing 表“练习做”。',
        next: '动词后再接动作 → 先回忆该动词的搭配 → 若是 enjoy、avoid 等，检查后面是否用了 -ing。',
        examples: [
          ['We should avoid making the same mistake again.', '我们应该避免再次犯同样的错误。'],
          ['The tutor suggested reviewing the notes first.', '辅导老师建议先复习笔记。'],
        ],
      },
      {
        id: 'preposition-ing',
        title: '介词后接动作：用 -ing',
        pattern: 'by doing；without doing；before / after doing',
        read: 'by checking 是“通过检查”，without checking 是“不检查就……”。',
        explain:
          '介词后通常接名词、代词或 -ing。after class 中是名词，after finishing class 中是活动；after 后也可接完整从句，如 after the class ends。',
        next: '看到介词后有动作 → 改查 -ing → 如果后面另有主语，则检查是否构成完整从句。',
        examples: [
          ['You can save time by planning your work.', '你可以通过规划工作来节省时间。'],
          ['Do not submit the form without checking it.', '不要不检查就提交表格。'],
        ],
      },
      {
        id: 'prepositional-to',
        title: 'to 不一定接原形',
        pattern: 'look forward to / be used to / object to + doing',
        read: 'look forward to hearing 是“期待收到消息”，这里 to 是介词。',
        explain:
          '不定式中的 to 后接原形；搭配里的介词 to 后可接名词或 -ing。可用 a reply（回复）替换 hearing from you，帮助看出这里是在接一个对象。',
        next: '看到 to → 先识别整个搭配 → 属于 look forward to 等介词结构时，检查后面的动作是否用 -ing。',
        examples: [
          ['I look forward to hearing from you.', '我期待收到你的回复。'],
          ['She is used to studying in the evening.', '她习惯在晚上学习。'],
        ],
      },
      {
        id: 'remember-stop',
        title: 'remember / forget / stop：形式改变含义',
        pattern: 'remember to do / doing；stop to do / doing',
        read: 'remember to lock 是“记得去锁”；remember locking 是“记得锁过”。',
        explain:
          'remember、forget 后的 to do 指要做的事，doing 指发生过的事。stop doing 是停止该活动；stop to do 是停下手头的事去做另一件事。',
        next: '遇到这些动词 → 判断动作未做、已做或被中断 → 选形式后把整句译回中文，检查意思是否一致。',
        examples: [
          ['Remember to save your file before closing it.', '关闭文件前记得保存。'],
          ['We stopped working to have lunch.', '我们停下工作去吃午饭。'],
        ],
      },
      {
        id: 'try-regret',
        title: 'try：努力完成，还是试一种办法',
        pattern: 'try to do / try doing；regret doing / regret to say',
        read: 'try restarting 是“试试重启这个办法”；try to restart 是“努力尝试重启”。',
        explain:
          'try doing 强调试验办法，try to do 强调尝试完成动作。regret doing 是后悔做过；regret to inform / say 常用于遗憾地告知当前消息。',
        next: '选择 to do 或 doing → 先判断是目标、办法还是已发生行为 → 按含义检查，不把两种形式当成总能互换。',
        examples: [
          ['If the screen freezes, try restarting the computer.', '如果屏幕卡住，试试重启电脑。'],
          ['I regret missing the workshop.', '我后悔错过了这次工作坊。'],
        ],
      },
      {
        id: 'object-infinitive',
        title: '希望、要求、让某人做某事',
        pattern: 'ask / want / allow 人 to do；let / make 人 do；help 人 (to) do',
        read: 'asked us to keep our voices down 表示“请我们小声说话”；us 是被请求的人，也是小声说话的人。',
        explain:
          'ask、want、allow 常用“人 + to do”；let、make 在主动结构中接原形；help 后有无 to 通常都可以。make 变被动时要恢复 to：be made to do。',
        next: '动词后出现“某人 + 动作” → 查前面动词的结构 → 检查要不要 to，以及动作执行者是否正确。',
        examples: [
          ['The librarian asked us to keep our voices down.', '图书管理员请我们小声说话。'],
          ['The extra practice helped me understand the rule.', '额外练习帮助我理解了这条规则。'],
        ],
      },
      {
        id: 'mean-doing',
        title: 'mean 改变后接形式也改变含义',
        pattern: 'mean doing / mean to do',
        read: 'mean doing 是“意味着”，mean to do 是“打算”。',
        explain: '例句讨论改变安排的后果，因此用 leaving；不是说某个人有离开的打算。',
        next: '先判断后果还是意图 → 选择 doing/to do → 核对主语是否有意图。',
        examples: [
          [
            'Taking the earlier bus means leaving before sunrise.',
            '坐更早的公交车意味着要在日出前出发。',
          ],
        ],
      },
      {
        id: 'need-doing',
        title: '需要被做，可以用 need doing',
        pattern: 'need doing / need to be done',
        read: 'needs updating 表示“需要被更新”。',
        explain:
          'guide 是承受更新的对象，主动形式 updating 表被动意义；needs to update 则把 guide 写成主动更新者。',
        next: '确定谁承受动作 → 用 need doing 或 need to be done → 检查被动含义。',
        examples: [
          [
            'The orientation guide needs updating before the new term.',
            '迎新指南需要在新学期前更新。',
          ],
        ],
      },
      {
        id: 'worth-doing',
        title: '值得做与值得花时间去做',
        pattern: 'be worth doing / be worthwhile to do',
        read: 'worth reviewing 表示“值得复习”。',
        explain:
          'worth 直接接 -ing，不用 worth to review；worthwhile 可接 to do 或 doing，两种结构别拼在一起。',
        next: '认清 worth/worthwhile → 选对应后接形式 → 不混用框架。',
        examples: [
          [
            'The feedback is worth reviewing before you revise the essay.',
            '修改文章前，这些反馈值得再看一遍。',
          ],
        ],
      },
      {
        id: 'deny-admit',
        title: '承认或否认先前的行为',
        pattern: 'admit / deny (having) done',
        read: 'denied having changed 表示否认自己改过。',
        explain:
          'deny 接 -ing 或完成 -ing，不能用 deny to change 表“否认做过”；完成形式把所否认的行为放在否认之前，是否真的发生仍需其他证据。',
        next: '先分清承认还是否认 → 判断所谈行为与说话时间的先后 → 不把否认当作行为已发生的证明。',
        examples: [
          ['The researcher denied having changed the figures.', '该研究人员否认修改过数字。'],
        ],
      },
      {
        id: 'perception-verbs',
        title: '看到全过程还是进行片段',
        pattern: 'see / hear + 人 + do / doing',
        read: 'heard…explaining 表示听到解释正在进行。',
        explain: '原形常侧重完整动作，-ing 侧重当时进行；两种都可能正确，但所表达的观察角度不同。',
        next: '判断叙述强调完整事件还是途中片段 → 选择原形或 -ing。',
        examples: [
          [
            'I heard the instructor explaining the safety rules.',
            '我听到指导老师正在讲解安全规则。',
          ],
        ],
      },
      {
        id: 'causative-service',
        title: '请别人把事情做好',
        pattern: 'have / get + 物 + done',
        read: 'have the equipment checked 表示请人检查设备。',
        explain: '主语安排动作而非亲自检查；设备承受动作，所以使用 checked，不是 checking。',
        next: '看到 have/get + 物 → 判断是不是安排服务 → 检查过去分词。',
        examples: [
          [
            'We should have the equipment checked before the demonstration.',
            '演示前，我们应该请人检查设备。',
          ],
        ],
      },
      {
        id: 'passive-make',
        title: 'make 的被动要恢复 to',
        pattern: 'make 人 do / be made to do',
        read: 'were made to repeat 表示“被要求重新做”。',
        explain: '主动 make 后接不带 to 的原形；变被动时 to 恢复，不能照搬主动词序。',
        next: '判断 make 是否被动 → 被动补回 to → 检查动作原形。',
        examples: [
          [
            'Participants were made to repeat the task under quieter conditions.',
            '参与者被要求在更安静的条件下重做任务。',
          ],
        ],
      },
      {
        id: 'negative-infinitive',
        title: '不定式自身的否定',
        pattern: 'not to do / so as not to do',
        read: 'so as not to disturb 表示“为了不打扰”。',
        explain: 'not 否定的是后面的动作，通常放在 to 前；否定主句可能改变整句意思。',
        next: '先找要否定的动作 → 把 not 放在对应不定式前 → 核对目的。',
        examples: [
          [
            'Please close the door quietly so as not to disturb the session.',
            '请轻轻关门，以免打扰活动。',
          ],
        ],
      },
      {
        id: 'perfect-infinitive',
        title: '似乎已经完成，而非现在才做',
        pattern: 'seem / appear to have done',
        read: 'appears to have changed 表示“看来已经改变”。',
        explain: 'appear 描述现在的判断，to have changed 表示更早发生的变化；两个时间层次要分开。',
        next: '先定判断时间 → 再定动作时间 → 更早动作检查 have + 过去分词。',
        examples: [
          ['The policy appears to have changed since last year.', '该政策自去年以来看来已经改变。'],
        ],
      },
    ],
  },
  {
    id: 'conditions',
    title: '条件、假设与情态',
    group: '托福语法',
    description: '阅读推断、讨论论证与访谈：区分真实条件、反事实假设、许可义务和对过去的推测。',
    topics: [
      {
        id: 'real-conditions',
        title: '真实条件与时间：从句常用现在表将来',
        pattern: 'If / When + 现在时，主句 will + 原形',
        read: 'if it rains tomorrow 是“如果明天下雨”，虽然谈将来，条件部分仍用 rains。',
        explain:
          '普通将来条件句和时间从句常用现在时，主句用 will。when、until、as soon as 也常如此；这不适用于表“是否”的宾语从句，如 I wonder if it will rain。',
        next: '看到 if 或 when → 先确认它表达条件／时间 → 从句检查现在时，主句检查将来的结果。',
        examples: [
          ['If it rains tomorrow, we will meet indoors.', '如果明天下雨，我们就在室内见面。'],
          ['I will call you when the lecture ends.', '讲座结束时我会给你打电话。'],
        ],
      },
      {
        id: 'unreal-conditions',
        title: '假设现在或将来：用过去式拉开距离',
        pattern: 'If + 过去式，would / could + 原形',
        read: 'If I had more time 表示“假如我有更多时间”，暗示现在的时间不够。',
        explain:
          '这里的过去式常表达不现实或可能性较低的假设，不一定指过去。正式表达常说 If I were you。would 通常放结果部分，不机械放进 if 从句。',
        next: '假设与现实有距离 → 条件部分考虑过去式 → 检查结果部分是否用了 would / could + 原形。',
        examples: [
          [
            'If I had more time, I would join the research team.',
            '如果我有更多时间，我就会加入研究团队。',
          ],
        ],
      },
      {
        id: 'past-unreal-wish',
        title: '假设过去与 wish：表达遗憾',
        pattern: 'If + had done，would have done；wish + 过去式 / had done',
        read: 'had left earlier 是“如果当时早点出发”，说的是无法改变的过去。',
        explain:
          '过去相反假设用 had + 过去分词，结果用 would have + 过去分词。wish 后用过去式表达对现在的遗憾，用 had done 表达对过去的遗憾。',
        next: '表达“要是……就好了” → 确定遗憾针对现在还是过去 → 按时间检查过去式或 had done，不只看 wish 本身。',
        examples: [
          [
            'If we had left earlier, we would have caught the bus.',
            '如果我们当时早点出发，就赶上公交车了。',
          ],
          ['I wish I had checked the deadline.', '我真希望自己当时核对过截止日期。'],
        ],
      },
      {
        id: 'obligation',
        title: 'mustn’t / don’t have to：禁止还是不必',
        pattern: 'must / have to；must not；do not have to',
        read: 'must not eat 是“禁止吃东西”；do not have to book 是“不必预约”。',
        explain:
          'must、have to 可表必须。mustn’t 表禁止，don’t have to 表没有必要但可以做。have to 会随主语和时态变化，must 后仍用原形。',
        next: '看到义务的否定 → 先判断“不能做”还是“可以不做” → 选择禁止或无必要的表达，避免混淆。',
        examples: [
          ['You must not eat in the laboratory.', '实验室内禁止吃东西。'],
          ['You do not have to book a seat for this talk.', '这场讲座不必预订座位。'],
        ],
      },
      {
        id: 'advice-possibility',
        title: 'should、may、might：建议与可能性',
        pattern: 'should do；may / might do；may not',
        read: 'should check 是“应该核对”，might change 是“可能变化”。',
        explain:
          'should 常提建议，may / might 表不确定的可能，不等于事实。may not 常表示“可能不”，但在规定语境也可能表不允许；阅读时要结合上下文判断。',
        next: '阅读情态动词 → 标记建议、义务还是推测 → 检查是否把“可能”误读为“必然”。',
        examples: [
          [
            'You should check the schedule because the room might change.',
            '你应该核对日程，因为地点可能会变。',
          ],
        ],
      },
      {
        id: 'past-modals',
        title: '对过去推测或反思',
        pattern: 'must / might / could / should + have done',
        read: 'should have checked 是“本该检查”，常含当时没检查的遗憾。',
        explain:
          '情态动词 + have + 过去分词把判断放到过去。must have done 是有根据的强推测，might have done 是可能，should have done 常表本应做到；不是过去事实的自动证明。',
        next: '看到情态动词后 have → 找过去分词 → 区分“推测发生了”与“本该发生”，再核对材料证据。',
        examples: [
          ['I should have checked the room number before leaving.', '我出发前本该核对一下房间号。'],
          ['She might have missed the announcement.', '她可能没听到那则通知。'],
        ],
      },
      {
        id: 'mixed-condition',
        title: '过去原因影响现在结果',
        pattern: 'If + had done, would + do now',
        read: 'had saved…would have…now 连接过去决定与现在状态。',
        explain: '条件在过去，结果在现在，不能机械地把主句也改成 would have done。',
        next: '分别标出条件和结果的时间 → 给两部分各选正确形式。',
        examples: [
          [
            'If we had saved the raw data, we would have more options now.',
            '如果当时保存了原始数据，我们现在就会有更多选择。',
          ],
        ],
      },
      {
        id: 'unless-limit',
        title: 'unless 表例外条件',
        pattern: 'unless = if…not',
        read: 'unless you register 表示“如果你不登记”。',
        explain:
          'unless 从句给出使主句限制失效的条件；一般不要额外加 not，把“不登记”误改成“登记”。',
        next: '把 unless 换成 if not → 连读主句 → 检查否定方向。',
        examples: [
          [
            'You cannot access the archive unless you register first.',
            '除非先登记，否则你无法访问档案库。',
          ],
        ],
      },
      {
        id: 'provided-condition',
        title: '只要满足明确条件',
        pattern: 'provided / providing / as long as…',
        read: 'provided that 表示“前提是”。',
        explain: '这里不是 provided 的“提供”含义，而是条件连接词；主句允许借用，但条件仍必须满足。',
        next: '看到条件短语 → 分开许可与前提 → 核对是否还有限制。',
        examples: [
          [
            'You may borrow the recorder provided that you return it tomorrow.',
            '你可以借录音机，前提是明天归还。',
          ],
        ],
      },
      {
        id: 'in-case',
        title: '预防情况不等于条件成立后才做',
        pattern: 'in case / if',
        read: 'in case it rains 是“以防下雨”。',
        explain: '带装备的动作先发生，不以实际下雨为前提；if it rains 常表达真的下雨才采取行动。',
        next: '判断是提前防备还是条件触发 → 选择 in case/if → 检查行动时间。',
        examples: [['Take a waterproof cover in case it rains.', '带上防水罩，以防下雨。']],
      },
      {
        id: 'even-if',
        title: '假设让步与已知事实',
        pattern: 'even if / even though',
        read: 'even if 表示“即使可能发生”，不确认事实。',
        explain: 'even though 通常承认事实后让步；不能把假设的经费不足读成已经确定不足。',
        next: '先看条件是否已被确认 → 区分假设与事实 → 再判断结论是否改变。',
        examples: [
          [
            'We will continue the study even if funding is reduced.',
            '即使经费减少，我们也会继续这项研究。',
          ],
        ],
      },
      {
        id: 'otherwise',
        title: 'otherwise 隐含否定条件',
        pattern: '做某事; otherwise, 后果',
        read: 'otherwise 相当于“如果不这样”。',
        explain: '它承接前一建议，描述未按建议行动的后果；不是在补充同向结果。',
        next: '用 if not 还原省略的条件 → 找会发生的后果 → 检查逻辑。',
        examples: [
          [
            'Back up the files; otherwise, you may lose your work.',
            '备份文件，否则可能丢失你的成果。',
          ],
        ],
      },
      {
        id: 'without-but-for',
        title: '没有某条件就会怎样',
        pattern: 'without / but for + 名词, would…',
        read: 'without the grant 指假设没有资助。',
        explain:
          '无该条件的假设可用 would/could；若回看已完成的过去事件，常用 would/could have done。',
        next: '定位 without 的假设条件 → 判断结果时间 → 选择现在或过去反事实。',
        examples: [
          [
            'Without the grant, the team could not have completed the project.',
            '没有那笔资助，团队当时就无法完成项目。',
          ],
        ],
      },
      {
        id: 'neednt-have',
        title: '其实不必做，却已经做了',
        pattern: 'need not have done',
        read: "needn't have printed 表示打印了，但无须这样。",
        explain: "不同于 didn't need to print，后者只说无此必要，单凭这句话不能确认最终是否打印。",
        next: "看到 needn't have → 先确认动作已做 → 再理解“不必要”的评价。",
        examples: [
          [
            "You needn't have printed the report; we have digital copies.",
            '你其实不必打印报告，我们已有电子版。',
          ],
        ],
      },
      {
        id: 'be-supposed-to',
        title: '预期或规定，不保证实际做到',
        pattern: 'be supposed to do',
        read: 'was supposed to arrive 表示原本应当到达。',
        explain: '它表达安排或责任，并不证明动作发生；后面的 but 常引出实际偏差。',
        next: '听到 supposed to → 记为预期 → 继续找实际结果。',
        examples: [
          [
            'The technician was supposed to arrive at nine, but the visit was delayed.',
            '技术人员原定九点到，但上门时间推迟了。',
          ],
        ],
      },
      {
        id: 'would-rather-clause',
        title: '希望别人做某事',
        pattern: 'would rather + 主语 + 过去式',
        read: "I'd rather you sent… 表示我希望你发送。",
        explain: '过去式在这里表达偏好和距离，不一定指过去；自己做用 would rather send，不加 to。',
        next: '先分清动作是谁做 → 自己用原形，别人用从句 → 检查时间含义。',
        examples: [
          [
            "I'd rather you sent the revised version before the meeting.",
            '我更希望你在开会前发来修订版。',
          ],
        ],
      },
    ],
  },
  {
    id: 'comparison',
    title: '比较、数量与限定范围',
    group: '托福语法',
    description: '补词、阅读细节与推断常用：比较对象要一致，数量、程度、否定和范围词不能漏读。',
    topics: [
      {
        id: 'as-as',
        title: '同等比较与倍数',
        pattern: 'as + 原级 + as；not as…as；twice as…as',
        read: 'as clear as 表示“一样清楚”，中间不用比较级 clearer。',
        explain:
          'as…as 中放形容词或副词原级；数量比较用 as many + 复数或 as much + 不可数。倍数可放前面，如 twice as much time。',
        next: '看到两个 as → 检查中间是不是原级 → 如果有名词，按可数性选择 many 或 much。',
        examples: [
          [
            'The online instructions are as clear as the printed ones.',
            '线上说明和纸质说明一样清楚。',
          ],
          [
            'This task takes twice as much time as the previous one.',
            '这项任务花费的时间是上一项的两倍。',
          ],
        ],
      },
      {
        id: 'too-enough',
        title: 'too / enough：过头还是足够',
        pattern: 'too + 形容词 + to do；形容词 + enough + to do',
        read: 'too small to hold… 是“小得容纳不了……”，不是“很小但可以容纳”。',
        explain:
          'too…to 常表示程度导致做不到；enough 放在形容词后、名词前，如 large enough、enough space。very 只表示程度高，不自动包含做不到的结果。',
        next: '表达程度与结果 → 判断能不能做到 → 选 too 或 enough，并检查 enough 的前后位置。',
        examples: [
          ['The room is too small to hold fifty people.', '这个房间太小，容纳不下五十人。'],
          ['We have enough chairs for everyone.', '我们的椅子够所有人坐。'],
        ],
      },
      {
        id: 'scope-negation',
        title: 'not all 与 only：限定范围别漏读',
        pattern: 'not all = 并非全部；only = 仅，仅限于',
        read: 'Not all courses… 表“并非所有课程……”，不等于“所有课程都不……”。',
        explain:
          'not all 只否定“全部”，仍可能有部分满足条件。only 的位置决定限制的是人、动作还是数量；例句中 only 限制 final-year students（毕业年级学生）。',
        next: '阅读结论或规则 → 圈出否定和限制词 → 把范围译成中文，再检查是否被选项扩大成“全部、一定”。',
        examples: [
          ['Not all courses require a final exam.', '并非所有课程都要求期末考试。'],
          [
            'Only final-year students can apply for this placement.',
            '只有毕业年级学生可以申请这项实习。',
          ],
        ],
      },
      {
        id: 'parallel-comparison',
        title: '比较同一种东西',
        pattern: 'that of / those of',
        read: 'that of the old model 指旧型号的能耗。',
        explain:
          '不能把一个型号的 energy consumption 与另一个 model 本身相比；that 代替同类单数或不可数名词。',
        next: '圈出 than 两侧 → 补回被省略名词 → 检查比较对象同类。',
        examples: [
          [
            "The new model's energy consumption is lower than that of the old model.",
            '新型号的能耗低于旧型号。',
          ],
        ],
      },
      {
        id: 'double-comparative',
        title: '越……就越……',
        pattern: 'the + 比较级…, the + 比较级…',
        read: 'The larger…, the more… 表示两项变化相伴。',
        explain: '两个 the 属于比较框架；这表达变化关联，单凭句型不能证明实验中的因果。',
        next: '拆出两个变化量 → 确认方向 → 检查两个比较级齐全。',
        examples: [
          [
            'The larger the sample, the more stable the estimate tends to be.',
            '样本越大，估计值往往越稳定。',
          ],
        ],
      },
      {
        id: 'comparative-modifiers',
        title: '加强比较程度',
        pattern: 'far / much / considerably / slightly + 比较级',
        read: 'considerably more efficient 是“效率高得多”。',
        explain: '比较级可用 much、far、slightly 等修饰；一般不写 very more efficient。',
        next: '找到比较级 → 选程度副词 → 区分大幅变化与小幅变化。',
        examples: [
          ['The revised process is considerably more efficient.', '修订后的流程效率高得多。'],
        ],
      },
      {
        id: 'less-fewer',
        title: '数量更少还是程度更低',
        pattern: 'fewer + 复数 / less + 不可数',
        read: 'fewer errors 是错误更少，less time 是用时更少。',
        explain:
          '正式写作中可数复数通常用 fewer；时间、钱等总量表达中常见 less，不宜机械按数字判断。',
        next: '先问数的是个体还是总量 → 选择 fewer/less → 核对中心名词。',
        examples: [
          [
            'The new system requires less time and produces fewer errors.',
            '新系统需要的时间更少，产生的错误也更少。',
          ],
        ],
      },
      {
        id: 'more-than-number',
        title: 'more than 不总是数量',
        pattern: 'more than + 数字 / 名词',
        read: 'more than a storage space 表示“不只是储藏空间”。',
        explain: '后接身份或作用时强调超出这一类别；不能按“多于一个”理解成数量比较。',
        next: '查看 more than 后的词 → 区分数量与作用 → 连读后续解释。',
        examples: [
          ['The library is more than a place to store books.', '图书馆不只是存放书籍的地方。'],
        ],
      },
      {
        id: 'no-more-than',
        title: '数量上限与“仅仅”',
        pattern: 'no more than / not more than',
        read: 'no more than ten minutes 常带“仅需十分钟”的语气。',
        explain:
          '两者都能表达上限，no more than 常强调少；实际细节题仍要依据上下文，不能擅自改成至少。',
        next: '看到 more/less 前的否定 → 先写出上限或下限 → 再判断语气。',
        examples: [['The procedure takes no more than ten minutes.', '这个流程最多只需十分钟。']],
      },
      {
        id: 'no-less-than',
        title: '大数强调与最低要求',
        pattern: 'no less than / at least',
        read: 'no less than fifty 强调“竟达五十”。',
        explain: '通常暗示数量大，at least 更中性地说明下限；不要与 no more than 混淆方向。',
        next: '先看 less 还是 more → 确定界限方向 → 再读强调含义。',
        examples: [
          [
            'The project involved no less than fifty local organizations.',
            '该项目涉及的当地机构竟不少于五十家。',
          ],
        ],
      },
      {
        id: 'few-vs-a-few',
        title: '少得不够，还是还有一些',
        pattern: 'few / a few; little / a little',
        read: 'few studies 是“很少有研究”，倾向强调不足。',
        explain: 'a few 强调仍有一些；这一个 a 会改变作者态度，补词和推断不能只翻成同一个“少”。',
        next: '圈出 a 是否存在 → 判断缺少还是存在一些 → 核对后文论点。',
        examples: [
          ['Few studies have examined the long-term effects.', '很少有研究考察其长期影响。'],
        ],
      },
      {
        id: 'most-most-of',
        title: '泛指大多数与特定群体',
        pattern: 'most + 名词 / most of the + 名词',
        read: 'most of the participants 指本次已确定的参与者。',
        explain:
          '泛指可说 most students；特定集合常用 most of the students，不能写 most of students。',
        next: '确认是否特指一组人 → 选择有无 of the → 检查范围。',
        examples: [
          [
            'Most of the participants completed the follow-up survey.',
            '大多数参与者完成了后续调查。',
          ],
        ],
      },
      {
        id: 'another-other',
        title: '额外一个与剩余部分',
        pattern: 'another / other / the other / others',
        read: 'another explanation 表示另一个可能解释。',
        explain:
          'another 接单数或数量短语；others 自身作代词；the other 指语境明确的剩余那个，不能随意互换。',
        next: '先确定数量和是否限定 → 再选 another/other → 检查后面是否还有名词。',
        examples: [
          [
            'One explanation involves cost; another concerns convenience.',
            '一种解释涉及费用，另一种涉及便利程度。',
          ],
        ],
      },
      {
        id: 'all-both-each',
        title: '群体整体与逐个分配',
        pattern: 'all / both / each / every',
        read: 'each of the participants 强调每位参与者。',
        explain: 'each 作主语通常配单数；both 仅限两个，all 通常谈整个集合，别丢掉数量范围。',
        next: '先数对象 → 再判整体还是逐个 → 核对谓语与限定词。',
        examples: [
          [
            'Each of the participants receives a separate access code.',
            '每位参与者都会收到一个单独的访问码。',
          ],
        ],
      },
      {
        id: 'not-necessarily',
        title: '不一定，不等于一定不',
        pattern: 'not necessarily / not always',
        read: 'does not necessarily mean 表示“未必意味着”。',
        explain: '作者否定必然联系，并未否定所有可能；不能把弱化判断概括成完全无关。',
        next: '看到 not + 程度词 → 保留部分可能性 → 不把结论绝对化。',
        examples: [
          [
            'A higher price does not necessarily mean better quality.',
            '价格更高不一定意味着质量更好。',
          ],
        ],
      },
      {
        id: 'hardly-scarcely',
        title: '几乎没有的程度',
        pattern: 'hardly / scarcely / barely',
        read: 'barely enough 表示“勉强够”，不是完全不够。',
        explain:
          '这些词本身带接近否定的含义；hardly 不等于 hard 的“努力地”，也通常不再加 not 表同一否定。',
        next: '认清程度词 → 区分零、接近零和勉强达标 → 检查语境。',
        examples: [
          [
            'The grant was barely enough to cover the equipment costs.',
            '这笔资助勉强够支付设备费用。',
          ],
        ],
      },
    ],
  },
  {
    id: 'logic',
    title: '连接词与篇章逻辑',
    group: '托福语法',
    description: '阅读、学术听力与讨论：跟住原因、让步、目的、补充和转折，避免只按中文近义词替换。',
    topics: [
      {
        id: 'because-because-of',
        title: 'because / because of：后面结构不同',
        pattern: 'because + 句子；because of + 名词／-ing',
        read: 'because it rained 是“因为下雨了”；because of the rain 是“因为这场雨”。',
        explain:
          'because 后有自己的主语和谓语；because of 后接名词等对象。两者都讲原因，但不能把 because of 后直接放 it rained。',
        next: '要接原因 → 先看后面是小句还是名词短语 → 对应选择 because 或 because of，再检查是否完整。',
        examples: [
          ['The game was canceled because of the heavy rain.', '比赛因大雨取消了。'],
          ['The game was canceled because it rained heavily.', '比赛取消了，因为雨下得很大。'],
        ],
      },
      {
        id: 'although-despite',
        title: 'although / despite：承认情况再转折',
        pattern: 'although / even though + 句子；despite / in spite of + 名词／-ing',
        read: 'although it was raining 是“虽然当时在下雨”，后面结果却仍然成立。',
        explain:
          'although 接完整小句，despite 接名词或 -ing；despite 后不再加 of。标准英语通常不在同一组连接中同时写 although…but…。',
        next: '遇到“虽然……但是……” → 先选一种连接结构 → 检查后面的成分和是否重复了 although / but。',
        examples: [
          [
            'Although it was raining, the volunteers continued working.',
            '虽然下着雨，志愿者们仍继续工作。',
          ],
          ['Despite the rain, the volunteers continued working.', '尽管有雨，志愿者们仍继续工作。'],
        ],
      },
      {
        id: 'so-such',
        title: 'so / such…that：程度导致结果',
        pattern: 'so + 形容词 + that；such + (a/an) + 形容词 + 名词 + that',
        read: 'so quiet that… 是“安静到……”，that 后说明结果。',
        explain:
          'so 修饰形容词或副词；such 带名词短语。单数可数名词前保留 a/an：such a useful guide；不可数名词不加 a，如 such useful advice。',
        next: '表达“如此……以至于” → 看程度词后是否有名词 → 选 so 或 such，并检查冠词和结果从句。',
        examples: [
          ['The room was so quiet that I could hear the clock.', '房间安静得我能听见钟声。'],
          ['It was such a useful guide that I kept it.', '这份指南非常有用，所以我把它留了下来。'],
        ],
      },
      {
        id: 'purpose',
        title: '目的：to、in order to、so that',
        pattern: 'to / in order to + 原形；so that + 主语 + can / could…',
        read: 'to catch the bus 是“为了赶上公交车”，解释出发的目的。',
        explain:
          '同一主语的目的常用 to do；需要另一个主语时可用 so that + 句子。in order not to do 表“为了不做”，不要把否定放到动作后面。',
        next: '解释为什么做某事 → 确认目的动作由谁执行 → 同主语考虑 to，不同主语考虑 so that，检查是否漏主语。',
        examples: [
          ['I left early to catch the first bus.', '我提早出发以赶上首班公交车。'],
          ['Please speak slowly so that everyone can follow.', '请说慢一点，让每个人都能跟上。'],
        ],
      },
      {
        id: 'contrast',
        title: 'while / whereas：对比，不一定是“当……时”',
        pattern: 'Some…while others…；whereas + 句子',
        read: 'Some prefer…while others… 表示“一些人喜欢……，另一些人却……”。',
        explain:
          'while 可表同时发生，也可对照不同情况；whereas 常表示对比。判断时看两边是否在比较人、特点或观点，不能遇到 while 就只找时间。',
        next: '看到 while → 比较前后主语和内容 → 若是差异对照就按“而”理解，再检查选项有没有颠倒双方。',
        examples: [
          [
            'Some students prefer lectures, while others learn better through discussion.',
            '一些学生喜欢听讲，另一些则通过讨论学得更好。',
          ],
        ],
      },
      {
        id: 'paired-connectors',
        title: '成对连接：both、either、neither',
        pattern: 'both…and；either…or；neither…nor；not only…but also',
        read: 'either online or in person 是“线上或到场，两者任选其一”。',
        explain:
          '连接词两边要结构平行。neither…nor 已表示两者都不；both A and B 作主语通常用复数。either / neither 连接单复数不同的主语时，谓语常与较近者一致，写作可改写避免别扭。',
        next: '发现一半成对连接词 → 找到另一半 → 核对并列结构、否定含义和主谓一致。',
        examples: [
          ['You can attend either online or in person.', '你可以选择线上参加或到场参加。'],
          ['Both the library and the café are open.', '图书馆和咖啡馆都开着。'],
        ],
      },
      {
        id: 'however-therefore',
        title: 'however / therefore：标点也参与连接',
        pattern: '句子. However, 句子.；句子; therefore, 句子.',
        read: 'however 表“然而”，therefore 表“因此”，它们提示两句的关系。',
        explain:
          '它们通常不能仅靠一个逗号连接两个独立句子。可用句号或分号，或用 and、but 等连词改写。词义选对后，还要检查是否出现逗号拼接。',
        next: '用 however / therefore 连接两句 → 分别检查两边能否独立成句 → 能独立就核对句号、分号或连词。',
        examples: [
          [
            'The plan is useful. However, it may be expensive.',
            '这个计划有用。不过，它可能成本很高。',
          ],
        ],
      },
      {
        id: 'since-as-cause',
        title: 'since 和 as 不只有时间含义',
        pattern: 'since / as + 原因从句',
        read: 'Since space is limited 的 since 表“既然”。',
        explain: '从句给出已知原因，不是说空间从某个时刻开始有限；用语义判断时间与原因。',
        next: '把 since/as 分别译为时间和原因 → 选择能解释主句行动的一种。',
        examples: [
          ['Since space is limited, advance booking is required.', '由于空间有限，需要提前预订。'],
        ],
      },
      {
        id: 'now-that',
        title: '情况已经变化，所以采取行动',
        pattern: 'now that + 从句',
        read: 'now that funding is secure 表示“既然资金已有保障”。',
        explain: '突出新情况成为下一步行动的理由，不能只当作表示当前时间的 now。',
        next: '识别新情况 → 找因此采取的行动 → 核对时间和原因两层关系。',
        examples: [
          [
            'Now that funding is secure, the team can recruit assistants.',
            '既然资金已有保障，团队就可以招募助理了。',
          ],
        ],
      },
      {
        id: 'given-that',
        title: '把已知情况作为判断前提',
        pattern: 'given that / given + 名词',
        read: 'given that… 表示“考虑到……”。',
        explain: 'that 后接完整句；given 后也可直接接名词，表达基于前提的评价，而非过去“给了”。',
        next: '找出判断前提 → 检查后面是句子还是名词 → 再读结论。',
        examples: [
          [
            'Given that the sample was small, the results should be interpreted cautiously.',
            '考虑到样本较小，应谨慎解读结果。',
          ],
        ],
      },
      {
        id: 'thereby',
        title: '由前面行为直接带来结果',
        pattern: '…, thereby doing…',
        read: 'thereby reducing 表示“从而减少”。',
        explain: 'doing 的结果承接前面的行动；它不是另一项独立目的，也不是额外的主句谓语。',
        next: '先找前一行动 → 再读 thereby 后结果 → 检查因果链。',
        examples: [
          [
            'The system stores files automatically, thereby reducing the risk of data loss.',
            '系统自动保存文件，从而降低数据丢失的风险。',
          ],
        ],
      },
      {
        id: 'nevertheless',
        title: '前面成立，结论仍转折',
        pattern: 'nevertheless / nonetheless',
        read: 'nevertheless 表示“尽管如此，仍然”。',
        explain: '它保留前句事实后给出出乎预期的后续；不是否认前句，也不是直接表达原因。',
        next: '标记前句事实 → 找后句反预期信息 → 概括两者并存。',
        examples: [
          [
            'The method is expensive. Nevertheless, it remains widely used.',
            '该方法成本很高。尽管如此，它仍被广泛使用。',
          ],
        ],
      },
      {
        id: 'instead-rather-than',
        title: '替代选择及平行结构',
        pattern: 'instead of + 名词/-ing; rather than…',
        read: 'instead of replacing 表示“选择修理来替代更换”。',
        explain:
          'instead of 后不能直接接完整陈述句；rather than 可连接平行成分，形式取决于句子结构。',
        next: '找被采用与被放弃的方案 → 检查连接两端 → 核对后接形式。',
        examples: [
          [
            'The team repaired the device instead of replacing it.',
            '团队修好了设备，没有选择更换。',
          ],
        ],
      },
      {
        id: 'on-contrary',
        title: '纠正前一句判断',
        pattern: 'on the contrary / in contrast',
        read: 'on the contrary 表示“恰恰相反”。',
        explain: '用于反驳或纠正前面说法；in contrast 比较两个不同对象时并不要求否认其中一个。',
        next: '先问是否在纠正一个判断 → 是则用 on the contrary → 核对相反结论。',
        examples: [
          [
            'The change did not increase costs. On the contrary, it saved money.',
            '这项改变没有增加成本，反而节省了资金。',
          ],
        ],
      },
      {
        id: 'moreover',
        title: '增加同方向的论据',
        pattern: 'moreover / furthermore / in addition',
        read: 'moreover 表示“而且”，补充同方向理由。',
        explain: '后句应与前句支持同一论点；如果是限制或相反结果，应改用转折连接。',
        next: '辨认后句支持还是削弱前句 → 再选补充或转折词。',
        examples: [
          [
            'The program is affordable. Moreover, it offers flexible hours.',
            '这个项目费用合理，而且时间安排灵活。',
          ],
        ],
      },
      {
        id: 'namely',
        title: '具体列出所指内容',
        pattern: 'namely / that is',
        read: 'namely 表示“即”，把前面范围具体说清。',
        explain: '不是再加随意例子；这里列出提到的两个因素。such as 则可只举部分例子。',
        next: '看到 namely → 回找待解释的范围 → 检查后面是否具体对应。',
        examples: [
          [
            'Two factors matter most, namely cost and reliability.',
            '两个因素最重要，即成本和可靠性。',
          ],
        ],
      },
      {
        id: 'whether-or',
        title: '无论选哪种情况',
        pattern: 'whether…or…',
        read: 'whether online or in person 表示“不论线上还是现场”。',
        explain: '这种结构列出不影响结论的两种情况；不是要求回答“是否”的宾语从句。',
        next: '先找两种备选情况 → 看主句是否对两者都成立 → 避免误读成提问。',
        examples: [
          [
            'Whether online or in person, all participants receive the same instructions.',
            '不论在线上还是现场，所有参与者都会收到相同说明。',
          ],
        ],
      },
      {
        id: 'as-if',
        title: '看起来像，不等于证实',
        pattern: 'as if / as though',
        read: 'as if they are certain 表示“好像他们很确定”。',
        explain: '说话人描述表象，未确认事实；若明确与事实相反，可用过去式表达距离。',
        next: '分开表象与真实证据 → 检查时态是否表达反事实 → 不直接当事实。',
        examples: [
          [
            'The speakers sound as if they are certain about the outcome.',
            '这些发言者听起来像是对结果很确定。',
          ],
        ],
      },
      {
        id: 'once-as-soon',
        title: '一旦达到条件就发生',
        pattern: 'once / as soon as + 现在时',
        read: 'once your application is approved 表示“一旦申请获批”。',
        explain: '谈将来时，时间或条件从句通常用现在时，主句可用 will；is approved 保留被动。',
        next: '定位将来的触发点 → 从句用现在形式 → 检查谁批准谁。',
        examples: [
          [
            'Once your application is approved, you will receive a confirmation email.',
            '申请一经批准，你就会收到确认邮件。',
          ],
        ],
      },
      {
        id: 'not-until',
        title: '直到某时才发生',
        pattern: 'not…until / Not until…did…',
        read: 'did not reopen until Monday 表示“周一才重新开放”。',
        explain:
          'until 前的否定把发生时间推到终点；不同于 remained open until Monday，后者是持续开放到周一。',
        next: '圈出 not → 区分“才开始”与“持续到” → 核对时间。',
        examples: [['The laboratory did not reopen until Monday.', '实验室直到周一才重新开放。']],
      },
    ],
  },
  {
    id: 'verb-prepositions',
    title: '动词搭配：关系与论证',
    group: '核心搭配',
    description: '学术阅读、听力与讨论中用来解释、比较、关联和处理问题的动词；连同介词一起识别。',
    topics: [
      {
        id: 'depend-focus',
        title: '依靠、专注与以……为基础',
        pattern: 'depend / rely on；focus / concentrate on；be based on',
        read: 'depend on 是“取决于、依靠”，focus on 是“集中于”。',
        explain:
          '这些常见结构都用 on 接对象。on 后的动作用 -ing，如 concentrate on reading；be based on 表“以……为基础”，注意保留 be。',
        next: '遇到依赖或专注的表达 → 连同 on 一起记 → 检查对象及动作的 -ing 形式，不单独背中文动词。',
        examples: [
          ['The final decision depends on the available budget.', '最终决定取决于可用预算。'],
          ['Try to concentrate on understanding the main idea.', '尽量专注于理解主旨。'],
        ],
      },
      {
        id: 'listen-respond',
        title: '听、回复、提及：后面接 to',
        pattern: 'listen to；respond / reply to；refer to；belong to',
        read: 'reply to the email 是“回复那封邮件”；refer to the chart 是“参看图表”。',
        explain:
          '这些结构用 to 连接对象。answer a question 则直接接对象，不加 to；listen 强调主动听，hear 常指听见，不总能互换。',
        next: '表达回复或听取 → 确认用的是哪个动词 → 检查它要直接接对象还是借助 to。',
        examples: [
          ['Please refer to the chart before answering the question.', '回答问题前请参看图表。'],
          ['I will reply to your email this afternoon.', '我今天下午会回复你的邮件。'],
        ],
      },
      {
        id: 'participate-succeed',
        title: '参加、专攻与成功做到',
        pattern: 'participate in；specialize in；succeed in doing',
        read: 'participate in 是“参加”，specialize in 是“专攻、专门从事”，succeed in doing 是“成功做到”。',
        explain:
          '这些常用结构接 in；动作随后用 -ing。join a club 直接接社团，take part in an activity 接活动，不把 join in 与 join 的所有用法混成一条。',
        next: '表达参与或成功 → 选准整个词组 → 检查 in 是否存在，后面动作是否用 -ing。',
        examples: [
          ['Many students participated in the survey.', '许多学生参与了调查。'],
          ['The team succeeded in reducing waste.', '团队成功减少了浪费。'],
        ],
      },
      {
        id: 'agree-deal',
        title: '同意谁、同意什么，以及处理问题',
        pattern: 'agree with 人／观点；agree to 提议；agree on 事项；deal with',
        read: 'agree with you 是“赞同你”，agree on a date 是“就日期达成一致”。',
        explain:
          'with 常接人或观点，to 可接提议、条件，也可形成 agree to do；on 表共同确定的事项。deal with 表“处理、应对”，后接问题或情况。',
        next: '写 agree → 先判断后面是人、提议还是共同决定的事项 → 选介词，再核对是否其实要用 to do。',
        examples: [
          ['We agreed on a date for the meeting.', '我们商定了会议日期。'],
          ['The office deals with housing problems.', '这个办公室处理住宿问题。'],
        ],
      },
      {
        id: 'account-for',
        title: '解释原因，或占一定比例',
        pattern: 'account for + 现象 / 比例',
        read: 'account for the difference 是“解释差异”。',
        explain:
          '后接现象时表示解释原因；接比例时表示占比，如 account for 30% of sales，不能统一翻成解释。',
        next: '先看 for 后是现象还是数量 → 选择解释或占比 → 核对主语。',
        examples: [
          [
            'Differences in income may account for the gap in participation.',
            '收入差异可能解释参与度上的差距。',
          ],
        ],
      },
      {
        id: 'attribute-to',
        title: '把结果归因于某原因',
        pattern: 'attribute 结果 to 原因',
        read: 'attribute the decline to… 表示把下降归因于某事。',
        explain: '宾语是待解释的结果，to 后是提出的原因；这是归因判断，不自动等于已证明因果。',
        next: '先圈结果 → 再找 to 后原因 → 保留作者判断的语气。',
        examples: [
          [
            'Researchers attribute the decline to changes in land use.',
            '研究人员将这一下降归因于土地使用方式的变化。',
          ],
        ],
      },
      {
        id: 'associate-with',
        title: '把两件事联系起来',
        pattern: 'associate A with B / be associated with',
        read: 'is associated with 表示“与……有关联”。',
        explain: '表示联系，未说明哪方导致哪方；阅读推断不能把相关改成直接因果。',
        next: '识别关联双方 → 检查有无因果证据 → 保持原文的结论强度。',
        examples: [
          [
            'Regular participation is associated with higher satisfaction.',
            '经常参与与更高的满意度有关联。',
          ],
        ],
      },
      {
        id: 'correlate-with',
        title: '两个指标一起变化',
        pattern: 'correlate with / correlation between',
        read: 'correlates with 表示指标存在相关关系。',
        explain: '相关性说明变化相伴，不排除其他因素；不等于 prove that A causes B。',
        next: '找到两个指标 → 判断相关方向 → 不补出原文没有的因果。',
        examples: [
          [
            'Study time tends to correlate with performance, though other factors also matter.',
            '学习时间往往与表现相关，不过其他因素也有影响。',
          ],
        ],
      },
      {
        id: 'differ-in-from',
        title: '与谁不同，在哪方面不同',
        pattern: 'differ from 对象 in 方面',
        read: 'differ in size 表示“在大小方面不同”。',
        explain: 'from 指比较对象，in 指差异维度；不能把不同对象和不同方面放反。',
        next: '先问“与谁比” → 再问“哪方面” → 匹配 from 和 in。',
        examples: [
          [
            'The two samples differ in size but not in composition.',
            '两个样本大小不同，但成分相同。',
          ],
        ],
      },
      {
        id: 'compare-with',
        title: '比较对象与共同尺度',
        pattern: 'compare A with / to B',
        read: 'compared costs with… 是将两地费用相比较。',
        explain:
          'with 与 to 都可用于比较；compare A to B 也可表示类比。看语境，不把介词差异当绝对错误。',
        next: '找两个比较对象 → 核对所比指标一致 → 判断是分析还是类比。',
        examples: [
          [
            'The study compares housing costs in the city with those in nearby towns.',
            '研究将市内住房费用与附近城镇的费用作了比较。',
          ],
        ],
      },
      {
        id: 'devote-to',
        title: '投入时间或精力',
        pattern: 'devote 时间/精力 to 名词/-ing',
        read: 'devoted two weeks to testing 表示花两周专门测试。',
        explain: 'to 是介词，后接 testing；宾语是投入的资源，不是被测试的设备。',
        next: '找投入资源 → 找 to 后用途 → 检查动作使用 -ing。',
        examples: [
          [
            'The team devoted two weeks to testing the new procedure.',
            '团队用两周时间专门测试新流程。',
          ],
        ],
      },
      {
        id: 'benefit-from',
        title: '谁从什么中获益',
        pattern: 'benefit from / benefit + 受益者',
        read: 'students benefit from feedback 表示学生从反馈中获益。',
        explain: 'benefit from 的主语是受益者；feedback benefits students 则直接把受益者作宾语。',
        next: '先确定谁受益 → 再选择主动搭配 → 检查方向没反。',
        examples: [
          [
            'Students benefit from receiving feedback while the task is still fresh.',
            '学生能从任务印象尚清晰时收到反馈中受益。',
          ],
        ],
      },
      {
        id: 'cope-with',
        title: '应对压力或困难',
        pattern: 'cope with + 困难',
        read: 'cope with the workload 表示“应对工作量”。',
        explain: 'cope 通常接 with，不直接写 cope the workload；它强调应付，不保证问题完全解决。',
        next: '看到压力或困难 → 用 cope with 连对象 → 不把应对误读成消除。',
        examples: [
          [
            'Additional training helps staff cope with the increased workload.',
            '额外培训有助于员工应对增加的工作量。',
          ],
        ],
      },
      {
        id: 'insist-on',
        title: '坚持要求或坚持做',
        pattern: 'insist on + 名词/-ing',
        read: 'insisted on checking 表示坚持要核查。',
        explain: 'on 是介词，后接 -ing；insist that 还可引出坚持的要求或事实主张，需看语气。',
        next: '先辨是坚持行动还是声称事实 → 行动接 on doing → 核对动词形式。',
        examples: [
          ['The supervisor insisted on checking the records personally.', '主管坚持亲自核查记录。'],
        ],
      },
      {
        id: 'appeal-to',
        title: '对某群体有吸引力',
        pattern: 'appeal to + 人群',
        read: 'appeal to people who work during the day 表示“吸引白天工作的人”。',
        explain: '此处不表示上诉或请求；to 后是感到吸引的群体，不能理解成项目主动向其求助。',
        next: '结合主语和对象 → 区分吸引与呼吁 → 检查文章主题。',
        examples: [
          [
            'Flexible evening classes appeal to people who work during the day.',
            '灵活的晚间课程吸引白天工作的人。',
          ],
        ],
      },
      {
        id: 'interfere-with',
        title: '干扰某个过程',
        pattern: 'interfere with + 活动/功能',
        read: 'interfere with concentration 是“干扰专注”。',
        explain: '表示妨碍正常过程，程度可大可小；不能凭这一搭配就推断完全无法完成任务。',
        next: '找到被干扰的功能 → 保留程度线索 → 不夸大影响。',
        examples: [
          ['Background noise can interfere with concentration.', '背景噪声可能干扰专注。'],
        ],
      },
    ],
  },
  {
    id: 'verb-objects',
    title: '动词搭配：对象与动作',
    group: '核心搭配',
    description: '组句、邮件和学术表达：谁向谁提供、说明、要求或改变什么；避免宾语和介词位置串线。',
    topics: [
      {
        id: 'apply-ask',
        title: '申请、请求、等待与准备',
        pattern: 'apply to 机构 for 项目；ask for；wait for；prepare for',
        read: 'apply for a scholarship 是“申请奖学金”，apply to a university 是“向大学申请”。',
        explain:
          'for 常接申请、请求或等待的对象；to 接申请所面向的机构。ask someone for help 表“向某人求助”，ask someone to help 则接对方要做的动作。',
        next: '看到申请或请求 → 区分面向谁、要什么、要做什么 → 分别核对 to、for 和 to do。',
        examples: [
          ['She applied to the university for a scholarship.', '她向这所大学申请了奖学金。'],
          ['I asked the librarian for help.', '我向图书管理员求助。'],
        ],
      },
      {
        id: 'prevent-protect',
        title: '阻止、保护与区分',
        pattern: 'prevent / stop 人 from doing；protect…from / against；distinguish A from B',
        read: 'prevent…from entering 是“阻止……进入”，from 后说明被阻止的动作。',
        explain:
          'prevent someone from doing 是常用结构；英式用法中 from 有时可省略。protect 的 from / against 随威胁和语境选择；distinguish A from B 表区分两者。',
        next: '描述阻止或保护 → 先找对象和不希望发生的事 → 检查介词及动作的 -ing，不写 prevent 人 to do。',
        examples: [
          [
            'The locked door prevented visitors from entering the lab.',
            '锁着的门阻止访客进入实验室。',
          ],
        ],
      },
      {
        id: 'provide-explain',
        title: '提供、解释与提醒：谁收到什么',
        pattern: 'provide 人 with 物 / 物 for 人；explain 事 to 人；remind 人 of 事 / to do',
        read: 'provide students with materials 是“向学生提供材料”；explain…to… 是“向……解释”。',
        explain:
          'provide 的两种次序对应 with 与 for。explain 不用 explain me the rule，而说 explain the rule to me。remind of 唤起记忆，remind to do 提醒去做。',
        next: '表达传递信息或物品 → 标出人和内容 → 核对动词专属次序、介词，以及提醒的是记忆还是行动。',
        examples: [
          ['The course provides students with practical skills.', '这门课让学生获得实用技能。'],
          ['Please remind me to bring my ID.', '请提醒我带身份证件。'],
        ],
      },
      {
        id: 'inform-of',
        title: '告知某人某事',
        pattern: 'inform 人 of / about 事',
        read: 'inform students of changes 是“告知学生变动”。',
        explain: '人是 inform 的直接宾语，内容用 of/about 引出；不能写 inform to students。',
        next: '先放接收消息的人 → 再接内容 → 检查没有多余的 to。',
        examples: [
          [
            'Please inform all participants of the change in location.',
            '请通知所有参与者地点变更一事。',
          ],
        ],
      },
      {
        id: 'accuse-of',
        title: '被指控做过某事',
        pattern: 'accuse 人 of doing',
        read: 'accused of copying 是“被指控抄袭”。',
        explain: 'of 后接 -ing；指控本身不证明行为已被证实，概括报道时应保留 accused。',
        next: '圈出指控与行为 → 区分指控和事实 → 检查 of doing。',
        examples: [
          [
            'The author was accused of copying material without permission.',
            '该作者被指控未经许可复制材料。',
          ],
        ],
      },
      {
        id: 'convince-of',
        title: '使人相信某判断',
        pattern: 'convince 人 of 事 / that…',
        read: 'convinced…of the need 表示让人相信有此必要。',
        explain:
          'of 后接名词，that 后接完整判断；convince 人 to do 也可用于促成行动，需按实际含义选择。',
        next: '先问相信什么还是去做什么 → 对应 of/that/to → 核对结构。',
        examples: [
          [
            'The results convinced the team of the need for a larger study.',
            '结果让团队确信有必要开展更大规模的研究。',
          ],
        ],
      },
      {
        id: 'persuade-to',
        title: '说服某人采取行动',
        pattern: 'persuade 人 to do / into doing',
        read: 'persuaded…to participate 表示成功说服参与。',
        explain: 'persuade 通常暗示说服取得效果；tried to persuade 只说明努力过，不保证成功。',
        next: '看到 persuade → 检查有无 tried → 区分行动成功与尝试。',
        examples: [
          [
            'The organizer persuaded several local firms to participate.',
            '组织者说服了几家当地企业参与。',
          ],
        ],
      },
      {
        id: 'enable-to',
        title: '使某人有条件做到',
        pattern: 'enable 人/物 to do',
        read: 'enable students to access 是“使学生能访问”。',
        explain:
          '宾语放在 enable 和 to 之间；不是 enable students accessing，也不是省掉学生直接接 to。',
        next: '找被赋予能力或条件的对象 → 放在 enable 后 → 再接 to do。',
        examples: [
          [
            'The grant enables students to access specialized equipment.',
            '这笔资助让学生能使用专门设备。',
          ],
        ],
      },
      {
        id: 'encourage-to',
        title: '鼓励某人做，而非保证完成',
        pattern: 'encourage 人 to do',
        read: 'encourages residents to reduce food waste 表示“鼓励居民减少食物浪费”。',
        explain: '鼓励措施不等于居民已经照做；encourage participation 则可直接接活动名词。',
        next: '分清鼓励对象与行动 → 检查 to do → 不把措施当实际结果。',
        examples: [
          [
            'The campaign encourages residents to reduce food waste.',
            '这项宣传活动鼓励居民减少食物浪费。',
          ],
        ],
      },
      {
        id: 'require-to',
        title: '要求某人做，物品则需提供',
        pattern: 'require 人 to do / require + 物',
        read: 'are required to attend 表示必须参加。',
        explain:
          '被动句主语是接受要求的人；require attendance 直接说要求出席，不能写 require students attending 表此义。',
        next: '先找被要求者 → 选择主动或被动 → 保留 to do。',
        examples: [
          [
            'All new assistants are required to attend safety training.',
            '所有新助理都必须参加安全培训。',
          ],
        ],
      },
      {
        id: 'congratulate-on',
        title: '因某项成就祝贺',
        pattern: 'congratulate 人 on 事/doing',
        read: 'congratulated the team on receiving the award 表示“祝贺团队获奖”。',
        explain: 'congratulate 后直接接人，on 接成就；不要按 thank…for 的结构机械替换。',
        next: '找被祝贺者和成就 → 按 人 + on + 成就 组合 → 检查动名词。',
        examples: [
          ['The director congratulated the team on receiving the award.', '主任祝贺团队获奖。'],
        ],
      },
      {
        id: 'expose-to',
        title: '使接触或暴露于某环境',
        pattern: 'expose 人/物 to 事',
        read: 'expose samples to heat 是“使样本受热”。',
        explain: 'to 后是接触的条件；be exposed to 可指机会也可指风险，不能一律翻成遭受伤害。',
        next: '找接触对象 → 判断环境是机会还是风险 → 核对主动被动。',
        examples: [
          [
            'The experiment exposed the samples to different temperatures.',
            '实验让样本处于不同温度条件下。',
          ],
        ],
      },
      {
        id: 'adapt-to',
        title: '适应环境，或改造以便使用',
        pattern: 'adapt to / adapt 物 for 用途',
        read: 'adapt to new conditions 表示适应新条件。',
        explain:
          '不带宾语的 adapt to 是主体适应；adapt the tool for children 则是改造工具供儿童使用。',
        next: '先分“自己适应”与“改造对象” → 选择 to/for → 核对宾语。',
        examples: [
          [
            'Students often need time to adapt to a new learning environment.',
            '学生通常需要时间适应新的学习环境。',
          ],
        ],
      },
      {
        id: 'substitute-for',
        title: '谁替代谁，顺序别反',
        pattern: 'substitute A for B',
        read: 'substitute recycled paper for… 是用再生纸替代原材料。',
        explain: 'A 是用上的替代品，B 是被换掉的；与 replace B with A 的词序不同。',
        next: '先标“新材料 A、旧材料 B” → 再套 substitute A for B → 复查方向。',
        examples: [
          [
            'The office substituted recycled paper for standard paper.',
            '办公室用再生纸替代了普通纸。',
          ],
        ],
      },
      {
        id: 'replace-with',
        title: '替换对象与替代物',
        pattern: 'replace A with B',
        read: 'replaced disposable containers with reusable ones 是“用可重复使用的容器替换一次性容器”。',
        explain: 'A 是原物，B 是替代物；be replaced by 则以被替换对象作主语。',
        next: '圈出旧物与新物 → 用 with 引出新物 → 核对主动被动。',
        examples: [
          [
            'The lab replaced disposable containers with reusable ones.',
            '实验室用可重复使用的容器替换了一次性容器。',
          ],
        ],
      },
      {
        id: 'transform-into',
        title: '改变成另一状态或用途',
        pattern: 'transform A into B',
        read: 'transform…into a study area 表示改造成学习区。',
        explain: 'into 指变化后的结果，不是受益对象；强调明显改变，语义强于一般调整。',
        next: '找原状态与结果 → 用 into 连接结果 → 检查变化程度。',
        examples: [
          [
            'The university transformed an unused hall into a study area.',
            '大学把一座闲置大厅改造成了学习区。',
          ],
        ],
      },
      {
        id: 'translate-into',
        title: '从抽象变化转为实际结果',
        pattern: 'translate into + 结果',
        read: 'translate into savings 表示转化为实际节省。',
        explain: '这里不是语言翻译；主语常是投入、效率或增长，后面接能否实现的效果。',
        next: '判断是否在谈语言 → 若不是，找投入与结果 → 保留可能性词。',
        examples: [
          [
            'Higher efficiency does not always translate into lower costs.',
            '效率提高并不总能转化为成本降低。',
          ],
        ],
      },
      {
        id: 'equip-with',
        title: '给对象配备工具或能力',
        pattern: 'equip 人/物 with 物',
        read: 'equipped with sensors 表示配有传感器。',
        explain:
          'with 后是配备内容，主语是得到设备的一方；equip students with skills 也可表培养能力。',
        next: '先找获得配备的对象 → 再列 with 后内容 → 检查被动形式。',
        examples: [
          [
            'Each room is equipped with sensors that monitor air quality.',
            '每个房间都配有监测空气质量的传感器。',
          ],
        ],
      },
      {
        id: 'regard-as',
        title: '把某事视作某种角色',
        pattern: 'regard / view / see A as B',
        read: 'regard feedback as… 表示把反馈视为某种工具。',
        explain: 'as 引出身份、角色或评价；不是 regard A to B，也不表示 A 已被改造成 B。',
        next: '确定评价对象与角色 → 用 as 连接 → 区分观点与事实变化。',
        examples: [
          [
            'Many students regard feedback as an opportunity to improve.',
            '许多学生把反馈视为改进的机会。',
          ],
        ],
      },
      {
        id: 'discuss-address',
        title: '有些动词直接接问题',
        pattern: 'discuss / address / mention + 内容',
        read: 'discuss the findings 表示讨论发现。',
        explain: '这几个动词通常直接接对象，不额外加 about；have a discussion about 则是名词结构。',
        next: '看核心是动词还是名词 → 动词直接接内容 → 检查多余介词。',
        examples: [
          [
            'The seminar will discuss the findings and address several concerns.',
            '研讨会将讨论研究发现，并回应几个关切。',
          ],
        ],
      },
    ],
  },
  {
    id: 'adjective-prepositions',
    title: '形容词的固定搭配',
    group: '核心搭配',
    description: '补词与学术理解常见的关系、条件、资格和倾向；注意同一形容词换介词后含义改变。',
    topics: [
      {
        id: 'interested-experienced',
        title: '兴趣、经验与参与状态',
        pattern: 'interested in；experienced in；involved in',
        read: 'interested in 是“对……感兴趣”，interesting 是“有趣的”，含义不同。',
        explain:
          '描述人的兴趣常说 be interested in + 名词／-ing。experienced in 指在某领域有经验，involved in 指参与其中；它们通常都需要 be 等系动词。',
        next: '表达兴趣或经验 → 用完整的 be + 形容词 + in → 检查 interested / interesting 及后面的动作形式。',
        examples: [
          [
            'I am interested in learning how public transport is planned.',
            '我对了解公共交通如何规划感兴趣。',
          ],
        ],
      },
      {
        id: 'responsible-suitable',
        title: '负责、适合与出名的原因',
        pattern: 'responsible for；suitable for；famous for / as',
        read: 'responsible for booking 是“负责预订”，suitable for beginners 是“适合初学者”。',
        explain:
          'for 接责任、适用对象或出名的原因。famous as 后接身份，如 famous as a writer；famous for 后接特色或成就，不能只把两者都译成“著名”。',
        next: '说明职责或特点 → 明确后面是任务、对象、原因还是身份 → 再检查 for / as 和名词结构。',
        examples: [
          ['I am responsible for booking the meeting room.', '我负责预订会议室。'],
          ['This course is suitable for beginners.', '这门课适合初学者。'],
        ],
      },
      {
        id: 'aware-capable',
        title: '意识到、有能力与感到自豪',
        pattern: 'aware of；capable of doing；proud of；afraid of',
        read: 'aware of the change 是“知道这一变化”，capable of doing 是“有能力做”。',
        explain:
          '这些常用结构接 of。capable 后不用 to do，而 able 用 to do；afraid of doing 常指担忧发生某事，afraid to do 常指因害怕而不敢采取行动，部分语境含义接近。',
        next: '使用能力或感受形容词 → 连同介词一起记 → 对照 capable of 与 able to，检查后面的动作形式。',
        examples: [
          [
            'The students are capable of solving the problem independently.',
            '这些学生有能力独立解决这个问题。',
          ],
        ],
      },
      {
        id: 'similar-different',
        title: '相似、不同与相关',
        pattern: 'similar to；different from；related / relevant to',
        read: 'similar to 表“与……相似”，relevant to 表“与……有关、切题”。',
        explain:
          'similar 常接 to，different from 是通用的安全表达。different to 常见于英式英语，different than 在美式英语也常见，不能把所有变体判为错误。',
        next: '表达相似或差异 → 找到比较对象 → 核对搭配，同时保留合理的地区用法，不凭单一口诀排除。',
        examples: [
          ['The second method is similar to the first one.', '第二种方法与第一种相似。'],
          ['Please include only information relevant to the topic.', '请只包括与主题相关的信息。'],
        ],
      },
      {
        id: 'worried-excited',
        title: '担心、兴奋与紧张的原因',
        pattern: 'worried / excited / nervous / concerned about',
        read: 'nervous about the interview 是“对这场面试感到紧张”。',
        explain:
          'about 常接引起情绪的事情，可用名词或 -ing。excited about 是人的感受，exciting 则说明某事令人兴奋；concerned about 侧重担忧，concerned with 可表涉及某主题。',
        next: '表达情绪 → 先说明谁有感受，再加 about 和原因 → 检查是否误用了表示“令人……”的 -ing 形容词。',
        examples: [
          ['I am nervous about giving my first presentation.', '我对第一次作展示感到紧张。'],
        ],
      },
      {
        id: 'satisfied-familiar',
        title: '满意、熟悉与受欢迎',
        pattern: 'satisfied / pleased with；familiar with / to；popular with / among',
        read: 'I am familiar with the system 是“我熟悉这个系统”。',
        explain:
          '人 familiar with 事物；事物 familiar to 人，方向不同。satisfied with 表对结果满意；popular with / among 指受某群体欢迎，不表达“对……很熟悉”。',
        next: '描述人与事物关系 → 确定谁熟悉谁、谁评价谁 → 再选 with 或 to，读回整句检查方向。',
        examples: [
          ['The system is familiar to most students.', '大多数学生都熟悉这个系统。'],
          ['We are satisfied with the final result.', '我们对最终结果感到满意。'],
        ],
      },
      {
        id: 'ready-likely',
        title: '准备好、愿意、可能做',
        pattern: 'ready / willing / likely / able + to do；ready for + 名词',
        read: 'likely to change 是“很可能变化”，ready to start 是“准备好开始”。',
        explain:
          '这些形容词常接 to + 原形。ready for 后接名词；likely 表可能性，不是意愿；willing 表愿意，也不等于已有能力。',
        next: '形容词后接动作 → 区分准备、意愿、能力或可能性 → 检查 to do，并避免把“愿意”写成“很可能”。',
        examples: [
          ['The schedule is likely to change next month.', '日程很可能下个月会变。'],
          ['I am willing to help with the survey.', '我愿意帮忙做调查。'],
        ],
      },
      {
        id: 'consistent-with',
        title: '证据与说法相符',
        pattern: 'be consistent with',
        read: 'consistent with the prediction 表示与预测一致。',
        explain: '一致说明不矛盾，并不等于单独证明预测；with 后是比较的标准或已有结果。',
        next: '找相符的双方 → 检查只是支持还是已证明 → 保留原文强度。',
        examples: [
          ['The results are consistent with the earlier prediction.', '这些结果与早先的预测一致。'],
        ],
      },
      {
        id: 'compatible-with',
        title: '两套东西可以共同使用',
        pattern: 'be compatible with',
        read: 'compatible with the software 表示与软件兼容。',
        explain: '强调能配合运作，不仅是外观相似；incompatible 表示不兼容。',
        next: '先问是否能一起运行 → 选择 compatible with → 检查否定前缀。',
        examples: [
          [
            'The new device is compatible with the software used in the lab.',
            '新设备与实验室使用的软件兼容。',
          ],
        ],
      },
      {
        id: 'conducive-to',
        title: '有利于形成某种结果',
        pattern: 'be conducive to + 名词/-ing',
        read: 'conducive to sustained concentration 表示“有利于持续专注”。',
        explain:
          'to 是介词，例句接 sustained concentration（持续专注）这个名词短语；若改接动作，可用 learning（学习），不写 to learn。',
        next: '确认有利条件和目标 → 用 to doing/名词 → 不写 to learn。',
        examples: [
          [
            'A quiet setting is conducive to sustained concentration.',
            '安静的环境有利于持续专注。',
          ],
        ],
      },
      {
        id: 'essential-to-for',
        title: '对过程重要，或为用途所必需',
        pattern: 'essential to / for',
        read: 'essential to the process 表示对该过程不可缺少。',
        explain: 'to 和 for 在很多语境都可用；for 常引出用途或活动，不能硬定为只有一种介词正确。',
        next: '先明确“对谁／为做什么必要” → 选择自然搭配 → 检查后接名词。',
        examples: [
          [
            'Accurate records are essential to the evaluation process.',
            '准确的记录对评估过程必不可少。',
          ],
        ],
      },
      {
        id: 'dependent-on',
        title: '结果依赖于某条件',
        pattern: 'be dependent on',
        read: 'dependent on rainfall 表示依赖降雨。',
        explain: '形容词后用 on；dependence on 是名词结构，两者词性不同但关系一致。',
        next: '找依赖者与条件 → 检查 be 后用形容词 → 保留 on。',
        examples: [['Crop yields are highly dependent on rainfall.', '作物产量高度依赖降雨。']],
      },
      {
        id: 'independent-of',
        title: '不受某因素影响或控制',
        pattern: 'be independent of',
        read: 'independent of age 表示不取决于年龄。',
        explain: '此处说某关系不依赖年龄，不等于所有结果在所有群体完全一致；范围仍由主句决定。',
        next: '定位“不依赖”的对象 → 检查限定范围 → 避免扩展到所有因素。',
        examples: [
          [
            "Access to the program is independent of a student's age.",
            '能否参加这个项目不取决于学生年龄。',
          ],
        ],
      },
      {
        id: 'indifferent-to',
        title: '对某事不在意',
        pattern: 'be indifferent to',
        read: 'indifferent to the proposal 表示对提议无所谓。',
        explain: '不是 opposed to 的反对，也不是 unaware of 的不知道；态度题要区分冷淡与否定。',
        next: '先区分不在意、不知道和反对 → 再选择对应态度词。',
        examples: [
          [
            'Few residents were indifferent to the proposed changes.',
            '很少有居民对拟议中的变化无动于衷。',
          ],
        ],
      },
      {
        id: 'opposed-to',
        title: '持反对立场',
        pattern: 'be opposed to + 名词/-ing',
        read: 'opposed to closing 表示反对关闭。',
        explain: 'to 是介词，动作接 -ing；oppose 是动词，可直接接 closing，不加 to。',
        next: '判断使用 oppose 还是 be opposed → 后者保留 to → 检查 -ing。',
        examples: [
          [
            'Several students are opposed to closing the library early.',
            '几名学生反对图书馆提早关门。',
          ],
        ],
      },
      {
        id: 'committed-to',
        title: '承诺持续投入',
        pattern: 'be committed to + 名词/-ing',
        read: 'committed to improving 表示致力于改善。',
        explain: 'to 不是不定式标记，后接 improving；这是承诺或投入，不证明目标已完成。',
        next: '看到 committed to → 用名词或 -ing → 区分承诺与完成。',
        examples: [
          [
            'The department is committed to improving access to research materials.',
            '该系致力于改善研究资料的获取条件。',
          ],
        ],
      },
      {
        id: 'susceptible-to',
        title: '容易受到某种影响',
        pattern: 'be susceptible to',
        read: 'susceptible to damage 表示易受损。',
        explain: 'to 后是容易受到的影响；常用于风险或不利条件，但不能只译成“敏感”。',
        next: '找对象易受什么影响 → 保留风险含义 → 检查上下文条件。',
        examples: [
          [
            'Young plants are particularly susceptible to frost damage.',
            '幼苗尤其容易遭受霜冻损伤。',
          ],
        ],
      },
      {
        id: 'resistant-to',
        title: '能抵抗某种作用',
        pattern: 'be resistant to',
        read: 'resistant to heat 表示耐热。',
        explain: 'resistant 不一定等于完全免疫；更高耐受程度仍可能存在极限。',
        next: '确定抵抗的因素 → 查程度修饰词 → 不把耐受写成绝不受影响。',
        examples: [
          [
            'The material is resistant to heat but can be damaged by sunlight.',
            '这种材料耐热，但可能被日光损坏。',
          ],
        ],
      },
      {
        id: 'eligible-for',
        title: '符合申请或参与资格',
        pattern: 'be eligible for / to do',
        read: 'eligible for funding 表示有资格获得资助。',
        explain: '符合资格不等于已获选；for 后接项目名词，to 后接申请或参与动作。',
        next: '分开资格与实际结果 → 检查 for + 名词或 to do → 核对限制条件。',
        examples: [
          [
            'Only full-time students are eligible for this grant.',
            '只有全日制学生有资格申请这项资助。',
          ],
        ],
      },
      {
        id: 'concerned-with',
        title: '主题涉及，不是感到担心',
        pattern: 'be concerned with / about',
        read: 'concerned with access 表示“讨论获取条件这一主题”。',
        explain: 'concerned about 通常是担忧；with 常表示内容涉及，阅读主题句中两者不能混同。',
        next: '看介词 with/about → 判断讨论主题还是情绪 → 核对后接内容。',
        examples: [
          [
            'The report is mainly concerned with access to public transport.',
            '该报告主要讨论公共交通的可及性。',
          ],
        ],
      },
    ],
  },
  {
    id: 'noun-patterns',
    title: '名词后的固定结构',
    group: '核心搭配',
    description: '补词、阅读和学术讨论中常见的抽象名词搭配；分别识别对象、原因、用途与比较范围。',
    topics: [
      {
        id: 'reason-cause',
        title: '原因、起因与解释',
        pattern: 'the reason for；the cause of；an explanation for',
        read: 'reason for the delay 是“延误的原因”，cause of the problem 是“问题的起因”。',
        explain:
          'reason 常配 for，cause 作名词常配 of。reason why 后接小句；explanation for 可解释某种现象，不把相近中文词全部接同一个介词。',
        next: '写“……的原因” → 确认用了哪个名词 → 核对 for / of，若后面是句子则查 why 等从句结构。',
        examples: [['The notice explains the reason for the delay.', '通知说明了延误的原因。']],
      },
      {
        id: 'solution-key',
        title: '答案、解决办法与途径',
        pattern: 'a solution to；the answer to；the key to；access to',
        read: 'a solution to the problem 是“这个问题的解决办法”。',
        explain:
          '这些名词结构常用介词 to；key to improving 表“改善……的关键”，to 后动作用 -ing。access 作名词用 access to，作动词常直接接对象：access the database。',
        next: '遇到答案、关键或使用权限 → 把名词与 to 作为一组 → 检查它是不是介词，而不是一律接原形。',
        examples: [
          ['Students have access to the online database.', '学生可以使用这个在线数据库。'],
          ['Regular practice is the key to improving accuracy.', '规律练习是提高准确性的关键。'],
        ],
      },
      {
        id: 'effect-influence',
        title: '对什么产生影响',
        pattern: 'an effect / impact / influence on；affect + 对象',
        read: 'an effect on sleep 是“对睡眠的影响”。',
        explain:
          '这些名词常用 on 标记受影响对象。affect 常作动词，直接接对象；effect 常作名词。要说 affect sleep 或 have an effect on sleep，不写 affect on sleep。',
        next: '写“影响” → 先选动词还是名词结构 → 动词查直接宾语，名词查 on，不混用词性。',
        examples: [['Noise can have a negative effect on sleep.', '噪声可能对睡眠产生负面影响。']],
      },
      {
        id: 'need-demand',
        title: '需求、偏好与兴趣',
        pattern: 'a need / demand / preference for；an interest in',
        read: 'a demand for quiet spaces 是“对安静空间的需求”。',
        explain:
          'need、demand、preference 常配 for；interest 配 in。prefer A to B 是动词结构，而 a preference for A 是名词结构，同根词不保证搭配一致。',
        next: '把动词改成名词表达 → 重新核对介词 → 检查是不是照搬了动词后面的结构。',
        examples: [
          [
            'The survey showed a strong demand for quiet study spaces.',
            '调查显示，大家对安静学习空间有很大需求。',
          ],
        ],
      },
      {
        id: 'attitude-approach',
        title: '态度、方法与替代方案',
        pattern: 'an attitude toward / towards；an approach to；an alternative to',
        read: 'an approach to learning 是“一种学习方法”，to 在这里是介词。',
        explain:
          'approach to 和 alternative to 后接名词或 -ing。toward、towards 都可用；approach 作动词时常直接接对象，如 approach the problem。',
        next: '表达方法或替代方案 → 确认 approach 是名词还是动词 → 名词核对 to，动作对象使用 -ing。',
        examples: [
          [
            'The tutor suggested a new approach to learning vocabulary.',
            '辅导老师提出了一种学习词汇的新方法。',
          ],
        ],
      },
      {
        id: 'advantage-relationship',
        title: '优点、关系与区别',
        pattern: 'an advantage of；an advantage over；a relationship / difference between A and B',
        read: 'advantage of 表“某事本身的优点”，advantage over 表“比另一方有优势”。',
        explain:
          'of 接被评价的事物，over 接比较对象。between A and B 需要明确两方；不要写 between A with B。比较时尽量让两边是同类对象。',
        next: '说明优劣或关系 → 找被评价对象与比较对象 → 核对 of / over，并检查 between…and 是否完整。',
        examples: [
          ['One advantage of online courses is flexibility.', '线上课程的一个优点是灵活。'],
          [
            'The article explores the relationship between sleep and memory.',
            '文章探讨睡眠与记忆之间的关系。',
          ],
        ],
      },
      {
        id: 'opportunity-ability',
        title: '机会、能力与做某事的困难',
        pattern: 'an opportunity to do；the ability to do；difficulty (in) doing；a lack of',
        read: 'an opportunity to practice 是“练习的机会”，difficulty understanding 是“理解起来有困难”。',
        explain:
          'opportunity、ability 常接 to do；have difficulty doing 中的 in 常可省，但不能换成 to do。lack 作名词常用 a lack of，作动词常直接接对象。',
        next: '表达机会或困难 → 辨认中心名词 → 分别检查 to do、doing 或 of，不把所有动作统一接 to。',
        examples: [
          [
            'The club gives students an opportunity to practice speaking.',
            '社团给学生提供练习口语的机会。',
          ],
          ['I had difficulty understanding the instructions.', '我理解这些说明有困难。'],
        ],
      },
      {
        id: 'likelihood-of',
        title: '某事发生的可能性',
        pattern: 'the likelihood of doing / that…',
        read: 'the likelihood of failure 表示失败的可能性。',
        explain: 'of 后接名词或 -ing；that 后接完整句，不能把两种后接方式混成 of that… 表此义。',
        next: '先看后面是事件名词还是完整判断 → 选择 of/that → 检查结构。',
        examples: [
          ['Better planning reduces the likelihood of delays.', '更周全的规划降低了延误的可能性。'],
        ],
      },
      {
        id: 'evidence-of-for',
        title: '观察到的迹象与支持观点的证据',
        pattern: 'evidence of / for / that…',
        read: 'evidence of damage 是受损迹象，evidence for a theory 是支持理论的证据。',
        explain: 'evidence 一般不可数；不能仅凭看到迹象就断言某个解释已被证明。',
        next: '确定证据显示现象还是支持主张 → 匹配 of/for → 核对结论强度。',
        examples: [
          [
            'The survey provides evidence of growing interest in local food.',
            '这项调查显示，人们对本地食品的兴趣正在增长。',
          ],
        ],
      },
      {
        id: 'implications-for',
        title: '对某领域意味着什么',
        pattern: 'implications for',
        read: 'implications for policy 表示对政策的潜在影响或启示。',
        explain: '不只是已经测量到的直接效果；常引出研究发现对决策意味着什么。',
        next: '先读研究发现 → 再找 for 后受影响领域 → 区分启示与已发生结果。',
        examples: [
          [
            'The findings have important implications for urban planning.',
            '这些发现对城市规划有重要启示。',
          ],
        ],
      },
      {
        id: 'contribution-to',
        title: '对某项成果的贡献',
        pattern: 'a contribution to + 名词/-ing',
        read: 'a contribution to understanding 表示有助于理解。',
        explain:
          'to 是介词；make a contribution to 是动词与名词的常见搭配，接动作时用 understanding，不写 a contribution for understand。',
        next: '找贡献对象 → 用 to 连接 → 若接动作则用 -ing。',
        examples: [
          [
            'The study makes a useful contribution to understanding migration.',
            '这项研究为理解迁徙作出了有益贡献。',
          ],
        ],
      },
      {
        id: 'exposure-to',
        title: '接触某种环境的程度',
        pattern: 'exposure to',
        read: 'exposure to noise 是接触噪声的情况。',
        explain:
          'exposure 是名词，后面仍接 to；increase exposure 表增加接触，不必然意味着增加认同。',
        next: '分清接触与影响 → 看程度或时长 → 核对 to 后对象。',
        examples: [
          [
            'Prolonged exposure to noise may affect concentration.',
            '长时间接触噪声可能影响专注力。',
          ],
        ],
      },
      {
        id: 'reliance-on',
        title: '对某资源的依赖',
        pattern: 'reliance on / dependence on',
        read: 'reliance on cars 表示对汽车的依赖。',
        explain: 'on 引出所依赖的资源；reduce reliance 讨论降低依赖程度，不等于完全停止使用。',
        next: '找依赖来源 → 读增减程度 → 避免把减少理解成取消。',
        examples: [
          [
            'Improved bus services can reduce reliance on private cars.',
            '改善公交服务可以减少对私家车的依赖。',
          ],
        ],
      },
      {
        id: 'emphasis-on',
        title: '把重点放在某处',
        pattern: 'emphasis on / place emphasis on',
        read: 'emphasis on practical skills 是强调实用技能。',
        explain: '名词 emphasis 后用 on；动词 emphasize 直接接对象，不额外加 on。',
        next: '看是名词还是动词 → 分别用 emphasis on / emphasize → 检查介词。',
        examples: [
          ['The course places greater emphasis on practical skills.', '这门课程更重视实用技能。'],
        ],
      },
      {
        id: 'objection-to',
        title: '对提议的反对意见',
        pattern: 'an objection to + 名词/-ing',
        read: 'objections to expanding 表示反对扩建的意见。',
        explain: 'to 是介词，后接 -ing；反对意见可能针对具体条件，不能自动扩大为反对整个项目。',
        next: '明确反对的具体事项 → 检查 to doing → 保留范围。',
        examples: [
          [
            'Several residents raised objections to expanding the parking lot.',
            '几名居民对扩建停车场提出了反对意见。',
          ],
        ],
      },
      {
        id: 'variation-in',
        title: '某个指标的差异或波动',
        pattern: 'variation in / variation between',
        read: 'variation in temperature 是温度的变化。',
        explain: 'in 接变化指标，between 接互相比较的对象；同一个 variation 可以同时交代两者。',
        next: '先找变化指标 → 再找比较对象 → 分别检查 in 和 between。',
        examples: [
          [
            'There is considerable variation in temperature between the sites.',
            '各地点之间的温度差异很大。',
          ],
        ],
      },
      {
        id: 'transition-to',
        title: '从一种状态过渡到另一种',
        pattern: 'the transition from A to B',
        read: 'transition from school to work 表示从学校走向工作。',
        explain: 'from 标出起点，to 标出目标；transition 通常强调过渡过程，不是瞬间完全替代。',
        next: '标出起点与终点 → 再读过渡难点 → 检查方向。',
        examples: [
          [
            'Internships can ease the transition from university to work.',
            '实习可以帮助学生更顺利地从大学过渡到职场。',
          ],
        ],
      },
      {
        id: 'balance-between',
        title: '兼顾两项需求',
        pattern: 'a balance between A and B',
        read: 'balance between study and rest 是学习与休息之间的平衡。',
        explain: 'between 两端需是可比较的需求；balance 不一定指时间各占一半。',
        next: '找要兼顾的两方 → 检查 and 两端平行 → 不擅自换算成各一半。',
        examples: [
          [
            'Students need to strike a balance between study and rest.',
            '学生需要在学习与休息之间取得平衡。',
          ],
        ],
      },
      {
        id: 'trade-off',
        title: '得到好处同时付出代价',
        pattern: 'a trade-off between A and B',
        read: 'trade-off between speed and accuracy 表示速度与准确度之间的取舍。',
        explain: '提高一方可能牺牲另一方，不能简单翻成两个优点兼得；是否必然冲突看语境。',
        next: '列出收益和代价 → 判断哪项被牺牲 → 核对限制条件。',
        examples: [
          [
            'The design involves a trade-off between speed and accuracy.',
            '这个设计涉及速度与准确度之间的取舍。',
          ],
        ],
      },
      {
        id: 'cost-of',
        title: '代价既可能是钱也可能是损失',
        pattern: 'the cost of / at the cost of',
        read: 'at the cost of privacy 表示以隐私为代价。',
        explain: 'of 后说明花费的对象或牺牲的东西；不要把所有 cost 都理解成需要支付的金额。',
        next: '判断在谈金钱还是损失 → 找 of 后对象 → 核对得失方向。',
        examples: [
          [
            'Greater convenience should not come at the cost of privacy.',
            '更高的便利性不应以隐私为代价。',
          ],
        ],
      },
    ],
  },
  {
    id: 'research',
    title: '研究、证据与方法',
    group: '核心搭配',
    description: '学术阅读、讲座和讨论：理解研究设计、样本、证据和结论的边界，积累自然的学术搭配。',
    topics: [
      {
        id: 'evidence',
        title: '证据、研究与结论',
        pattern: 'conduct research；collect data；provide evidence；draw a conclusion',
        read: 'provide evidence 是“提供证据”，draw a conclusion 是“得出结论”。',
        explain:
          'research、evidence 在这些常见含义中通常不可数；可说 a study 或 a piece of evidence。conclusion 常用 draw / reach，不逐字翻成 make a conclusion。结论强度不能超过证据范围。',
        next: '概括研究 → 分开方法、发现与结论 → 检查可数性和搭配，以及例子是否被误写成普遍证明。',
        examples: [
          [
            'The researchers collected data before drawing a conclusion.',
            '研究者先收集数据，再得出结论。',
          ],
        ],
      },
      {
        id: 'formulate-hypothesis',
        title: '提出可以检验的解释',
        pattern: 'formulate / test a hypothesis',
        read: 'test a hypothesis 是“检验假设”。',
        explain: 'hypothesis 是待验证的解释；test 只说明进行检验，不能直接译成证实。',
        next: '看到假设 → 找检验方式和结果 → 区分提出、检验与支持。',
        examples: [
          [
            'The researchers tested the hypothesis that light affects growth.',
            '研究人员检验了光照影响生长这一假设。',
          ],
        ],
      },
      {
        id: 'control-variables',
        title: '保持其他条件相同',
        pattern: 'control for / hold…constant',
        read: 'held temperature constant 表示保持温度不变。',
        explain:
          '这样便于考察另一因素；control for 是在设计或分析中处理其他变量影响，不等于控制组本身。',
        next: '找被改变的因素 → 再找被保持或控制的条件 → 核对比较是否公平。',
        examples: [
          [
            'The team varied the light level while holding temperature constant.',
            '团队改变光照水平，同时保持温度不变。',
          ],
        ],
      },
      {
        id: 'representative-sample',
        title: '样本能否代表总体',
        pattern: 'a representative sample of',
        read: 'representative sample 指能较好反映总体特点的样本。',
        explain: '人数多不自动保证代表性；要看选择方式及覆盖的人群，不只看 sample size。',
        next: '找目标总体 → 检查样本来自哪里 → 再评估结论适用范围。',
        examples: [
          [
            'The survey used a representative sample of local households.',
            '调查采用了当地家庭的一个代表性样本。',
          ],
        ],
      },
      {
        id: 'sampling-bias',
        title: '抽样方式造成系统偏差',
        pattern: 'sampling bias / selection bias',
        read: 'selection bias 指入选者与目标群体存在系统差异。',
        explain: '只调查自愿回应者可能偏向更积极的人；偏差不等于所有个别回答都是假的。',
        next: '看谁有机会被选中 → 找缺失群体 → 限定结论。',
        examples: [
          [
            'Relying only on online volunteers may introduce selection bias.',
            '只依赖线上志愿者可能引入选择偏差。',
          ],
        ],
      },
      {
        id: 'replicate-findings',
        title: '换次研究能否再现发现',
        pattern: 'replicate findings / reproduce results',
        read: 'replicate the findings 是“重复研究得到类似发现”。',
        explain: '不是复制原报告文字；能否再现关系到结果是否稳健，也要核对条件是否可比。',
        next: '看到 replicate → 找新的研究条件 → 比较是否得到相似结果。',
        examples: [
          [
            'A second team replicated the findings using a larger sample.',
            '第二个团队使用更大样本重复得到了这些发现。',
          ],
        ],
      },
      {
        id: 'statistical-practical',
        title: '统计上的显著不等于影响很大',
        pattern: 'statistically significant / practically important',
        read: 'statistically significant difference 指符合所用统计检验的显著性标准。',
        explain: '它不自动说明差异很大或实际价值很高；还要看差异大小、研究设计及适用范围。',
        next: '看到 significant → 判断是否统计语境 → 再找效果大小与实际意义。',
        examples: [
          [
            'The difference was statistically significant but too small to matter in practice.',
            '差异在统计上显著，但太小，实际意义有限。',
          ],
        ],
      },
      {
        id: 'rule-out',
        title: '排除一种解释或可能性',
        pattern: 'rule out + 解释/可能性',
        read: 'cannot rule out 表示“不能排除”。',
        explain: '有 cannot 就仍保留该可能性；不是“已经排除”，也不是证明该解释一定正确。',
        next: '先圈否定词 → 判断可能性是否仍存在 → 再概括结论。',
        examples: [
          ['The results cannot rule out an effect of temperature.', '这些结果不能排除温度的影响。'],
        ],
      },
      {
        id: 'shed-light',
        title: '帮助解释尚不清楚的现象',
        pattern: 'shed light on',
        read: 'shed light on the process 是“有助于理解这一过程”。',
        explain: '强调带来新认识，不必然表示已彻底解决问题；on 后接要解释的现象。',
        next: '找到被解释的现象 → 判断只是增进理解还是已定论 → 保留程度。',
        examples: [
          [
            'The discovery sheds light on how early communities stored food.',
            '这一发现有助于理解早期社区如何储存食物。',
          ],
        ],
      },
      {
        id: 'call-into-question',
        title: '使已有说法值得怀疑',
        pattern: 'call…into question',
        read: 'calls the assumption into question 表示使这一假设受到质疑。',
        explain: '提出反面证据不一定完全推翻理论；与 confirm 的证据方向相反。',
        next: '圈出被质疑的说法 → 找新证据 → 不把质疑直接写成已推翻。',
        examples: [
          [
            'The new evidence calls the original assumption into question.',
            '新证据使最初的假设受到质疑。',
          ],
        ],
      },
      {
        id: 'subject-to',
        title: '受条件限制或可能受影响',
        pattern: 'be subject to + 限制/变动',
        read: 'subject to change 表示“可能变动”。',
        explain: '不是“以改变为主题”；用于结果时可表示受某种误差影响，用于规则时可表示必须服从。',
        next: '看 to 后是限制、误差还是变动 → 选对应含义 → 不漏掉不确定性。',
        examples: [['The preliminary results are subject to revision.', '初步结果可能会修订。']],
      },
      {
        id: 'support-undermine',
        title: '证据支持还是削弱主张',
        pattern: 'support / undermine a claim',
        read: 'supports the claim but does not prove it 表示“支持主张，但没有证明它”。',
        explain: 'support 不一定是 prove，undermine 也不必然等于完全否定；关注证据方向和强度。',
        next: '找证据指向 → 标支持或削弱 → 检查是否达到证明程度。',
        examples: [
          [
            'The smaller study supports the claim but does not prove it.',
            '这项较小规模的研究支持该主张，但并未证明它。',
          ],
        ],
      },
      {
        id: 'quantify-assess',
        title: '测量数量与综合评估',
        pattern: 'quantify an effect / assess an impact',
        read: 'quantify 表示用数值描述，assess 表示评估。',
        explain: '评估可包含定性判断，量化则需要可度量结果；二者不是无条件替换。',
        next: '看目标是给出数字还是综合判断 → 选择 quantify/assess → 检查依据。',
        examples: [
          [
            'The study aims to quantify the effect of noise on task performance.',
            '这项研究旨在量化噪声对任务表现的影响。',
          ],
        ],
      },
      {
        id: 'interpret-caution',
        title: '谨慎解读受限的数据',
        pattern: 'interpret…with caution',
        read: 'interpret with caution 是“谨慎解读”。',
        explain: '提醒限制结论的强度，不是让人忽略全部结果；常与样本小、方法有限等理由搭配。',
        next: '找谨慎的具体原因 → 限定结论范围 → 保留仍可支持的发现。',
        examples: [
          [
            'The results should be interpreted with caution because participation was voluntary.',
            '由于参与出于自愿，这些结果应谨慎解读。',
          ],
        ],
      },
      {
        id: 'underlying-assumption',
        title: '没有明说的基础前提',
        pattern: 'an underlying assumption',
        read: 'underlying assumption 指推理依赖的基本前提。',
        explain: '它未必已验证；如果前提不成立，结论也可能改变。阅读时要区分前提与数据。',
        next: '找结论依赖什么 → 检查前提有无证据 → 再评价论证。',
        examples: [
          [
            'An underlying assumption is that demand will remain stable.',
            '一个基本前提是需求将保持稳定。',
          ],
        ],
      },
      {
        id: 'follow-up-study',
        title: '第一次研究之后的追踪',
        pattern: 'a follow-up study / longitudinal study',
        read: 'follow-up study 表示后续研究。',
        explain:
          '后续研究不一定长期追踪同一批人；longitudinal study 才强调随时间追踪，范围有区别。',
        next: '找是否反复观察同一对象 → 区分后续验证与纵向追踪 → 核对时间。',
        examples: [
          [
            'A follow-up study will examine whether the benefits persist.',
            '后续研究将考察这些益处是否持续。',
          ],
        ],
      },
    ],
  },
  {
    id: 'cause-change',
    title: '因果、影响与变化',
    group: '核心搭配',
    description: '阅读与学术听力中的过程关系：谁导致谁、哪些只是促成因素、指标究竟增加到多少。',
    topics: [
      {
        id: 'cause-direction',
        title: '原因与结果：from 和 in 方向不同',
        pattern: 'result from 原因；result in 结果；lead / contribute to',
        read: 'result from 表“由……造成”，result in 表“导致……”，方向正好不同。',
        explain:
          'result from 以结果作主语，result in 以原因作主语。lead to、contribute to 后可接名词或 -ing；contribute to 表促成，不一定是唯一原因。',
        next: '遇到因果搭配 → 用箭头标出原因到结果 → 检查介词方向，避免把结果当原因。',
        examples: [
          ['The delay resulted from a technical problem.', '这次延误源于技术问题。'],
          ['Regular feedback can contribute to improving performance.', '定期反馈有助于提升表现。'],
        ],
      },
      {
        id: 'increase-decrease',
        title: '增加什么，增加多少',
        pattern: 'an increase / decrease in 指标；of 数量；by 变化量；to 最终值',
        read: 'an increase in attendance 是“出席人数增加”；from 20 to 30 是“从20到30”。',
        explain:
          '名词 increase in 后接变化的指标，of 可接增量。动词后 by 标变化量，to 标最终数值。百分比和百分点不同：20%到30%是加10个百分点，相对增长50%。',
        next: '看到变化数据 → 先标起点、终点、差值 → 再核对 in、by、to 以及百分比的基准。',
        examples: [
          [
            'Attendance increased by ten, from twenty to thirty.',
            '出席人数增加了十人，从二十人增至三十人。',
          ],
        ],
      },
      {
        id: 'bring-about',
        title: '促成某种改变',
        pattern: 'bring about + 变化',
        read: 'bring about change 是“带来改变”。',
        explain: 'about 是短语动词的一部分，不表示关于；宾语通常是改变、改善等结果。',
        next: '把 bring about 作为整体 → 找产生的结果 → 核对原因主体。',
        examples: [
          [
            'The new policy brought about a gradual change in travel habits.',
            '新政策使出行习惯逐渐改变。',
          ],
        ],
      },
      {
        id: 'stem-from',
        title: '从根源解释问题',
        pattern: 'stem from + 原因',
        read: 'stem from poor planning 表示源于规划不足。',
        explain: '主语是待解释的结果，from 后是根源；方向与 lead to 正好相反。',
        next: '先圈结果 → 沿 from 回找原因 → 检查顺序。',
        examples: [['Many of the delays stem from poor coordination.', '许多延误源于协调不善。']],
      },
      {
        id: 'trigger-response',
        title: '触发一个反应或过程',
        pattern: 'trigger a response / set…in motion',
        read: 'trigger a response 表示引发反应。',
        explain: '常指启动某过程的因素，不一定是维持整个过程的唯一原因。',
        next: '区分触发与持续因素 → 找后续过程 → 避免把触发者当唯一原因。',
        examples: [
          [
            'A sudden drop in temperature can trigger a protective response.',
            '温度骤降可能触发保护性反应。',
          ],
        ],
      },
      {
        id: 'give-rise-to',
        title: '产生问题或新现象',
        pattern: 'give rise to',
        read: 'give rise to concerns 表示引起担忧。',
        explain: 'to 后接名词，不能写 give rise concerns；主语是引发因素，宾语是产生的现象。',
        next: '认出整个搭配 → 找 to 后结果 → 再回看原因。',
        examples: [
          [
            'The rapid expansion gave rise to concerns about quality.',
            '迅速扩张引发了对质量的担忧。',
          ],
        ],
      },
      {
        id: 'be-due-to',
        title: '归因于某个原因',
        pattern: 'be due to + 原因',
        read: 'was due to a fault 表示是由故障引起。',
        explain: '这里 due to 接名词说明原因；be due to arrive 中 to arrive 是预定动作，含义不同。',
        next: '先看 due to 后是名词还是动作 → 区分原因与预定安排。',
        examples: [
          ['The interruption was due to a fault in the power supply.', '中断是由供电故障造成的。'],
        ],
      },
      {
        id: 'offset-effect',
        title: '抵消一部分影响',
        pattern: 'offset a cost / effect',
        read: 'offset the increase 表示抵消增长带来的影响。',
        explain: '可以部分抵消，不必然使净变化为零；看 partly、fully 等程度词。',
        next: '找到两股相反作用 → 检查抵消程度 → 再判断净结果。',
        examples: [
          [
            'Lower transport costs partly offset the rise in material prices.',
            '运输成本下降部分抵消了材料涨价的影响。',
          ],
        ],
      },
      {
        id: 'mitigate-impact',
        title: '减轻影响或损害',
        pattern: 'mitigate the impact / risk',
        read: 'mitigate the impact 表示减轻影响。',
        explain: 'mitigate 强调缓和，不等于 eliminate 的彻底消除；讨论解决方案时别夸大效果。',
        next: '辨认减轻还是消除 → 保留程度 → 找具体措施。',
        examples: [
          [
            'Planting trees can help mitigate the impact of urban heat.',
            '种树有助于减轻城市热的影响。',
          ],
        ],
      },
      {
        id: 'pose-threat',
        title: '构成风险或挑战',
        pattern: 'pose a threat to / pose a challenge',
        read: 'pose a threat to 表示对某对象构成威胁。',
        explain: 'pose 此处不是摆姿势；威胁尚不等于伤害一定已发生。',
        next: '圈出受威胁对象 → 判断风险还是已发生后果 → 保留语气。',
        examples: [
          ['Water shortages pose a threat to local agriculture.', '缺水对当地农业构成威胁。'],
        ],
      },
      {
        id: 'have-bearing',
        title: '与结果有关并产生影响',
        pattern: 'have a bearing on',
        read: 'have a bearing on the outcome 表示关系到结果。',
        explain: 'bearing 在此不是方位或承重；指相关因素对判断或结果的影响。',
        next: '把整个词组译成“影响到” → 找结果 → 核对上下文因素。',
        examples: [
          [
            'Prior experience may have a bearing on how quickly students adapt.',
            '既往经历可能影响学生适应的速度。',
          ],
        ],
      },
      {
        id: 'in-turn',
        title: '前一结果进一步引发下一步',
        pattern: 'in turn',
        read: 'in turn 表示“继而、反过来又”。',
        explain: '它连接连续的影响链，也可表示轮流；例句谈连锁效果，不是按人次轮流。',
        next: '列出前因、直接结果、后续结果 → 检查 in turn 在哪一环。',
        examples: [
          [
            'Better lighting improves visibility, which in turn can reduce accidents.',
            '更好的照明提高了可见度，进而可能减少事故。',
          ],
        ],
      },
      {
        id: 'level-off',
        title: '上升或下降之后趋于稳定',
        pattern: 'level off / stabilize',
        read: 'leveled off 表示此前变化后趋于平稳。',
        explain: '不等于下降为零；要看平台所处数值，不能只凭“稳定”猜高低。',
        next: '先读此前趋势 → 找稳定水平 → 不把平台误读成零。',
        examples: [['Demand rose sharply and then leveled off.', '需求急剧上升，随后趋于平稳。']],
      },
      {
        id: 'fluctuate-range',
        title: '在一定区间波动',
        pattern: 'fluctuate between A and B',
        read: 'fluctuate 表示上下变动。',
        explain: '不能概括成持续上升或持续下降；between 后给出的两个数是波动范围。',
        next: '标出上下界 → 检查有无长期方向 → 区分波动与单向趋势。',
        examples: [
          [
            'Attendance fluctuated between forty and sixty people.',
            '出席人数在四十至六十人之间波动。',
          ],
        ],
      },
      {
        id: 'percentage-points',
        title: '百分比与百分点不是一回事',
        pattern: 'percent / percentage points',
        read: '从 20% 到 30% 是增加 10 个百分点。',
        explain:
          '相对原值的增幅是 50%；percentage points 直接相减，percent increase 还要除以原值。',
        next: '先认清单位 → 百分点相减，增幅除原值 → 再核算。',
        examples: [
          [
            'The rate rose from 20% to 30%, an increase of ten percentage points.',
            '该比例从 20% 升至 30%，增加了十个百分点。',
          ],
        ],
      },
      {
        id: 'gradual-abrupt',
        title: '变化的速度和幅度分开看',
        pattern: 'gradual / abrupt / substantial / marginal',
        read: 'a gradual decline 是逐步下降。',
        explain: 'gradual 说变化速度，substantial 说幅度大；缓慢变化也可能累积成很大幅度。',
        next: '先标方向 → 再分速度与幅度 → 不把缓慢等同于微小。',
        examples: [
          [
            'There was a gradual but substantial decline in energy use.',
            '能耗逐渐下降，但降幅很大。',
          ],
        ],
      },
    ],
  },
  {
    id: 'argument',
    title: '观点、评价与论证',
    group: '核心搭配',
    description:
      '学术讨论、访谈及阅读观点题：表达立场、比较得失、限定结论，避免空泛或过度绝对的表述。',
    topics: [
      {
        id: 'compare-contrast',
        title: '比较方案：共同点、差异与代价',
        pattern: 'compared with / to；in contrast；on the other hand；at the expense of',
        read: 'at the expense of 是“以牺牲……为代价”，不是免费获得两种好处。',
        explain:
          'compared with / to 都可用于比较；in contrast 引出反差，on the other hand 补另一面。比较时保持对象和指标一致，不把一个方案的成本与另一方案的速度直接当同一指标。',
        next: '评价两个方案 → 先确定共同指标 → 再写差异与代价，检查连接词是否真有对比内容可接。',
        examples: [
          [
            'The faster method saves time, but it may do so at the expense of accuracy.',
            '更快的方法节省时间，但可能以准确性为代价。',
          ],
        ],
      },
      {
        id: 'hedging',
        title: '表达谨慎程度：tend to、may、to some extent',
        pattern: 'tend to；be likely to；may suggest that；to some extent',
        read: 'tend to 是“往往、倾向于”，to some extent 是“在一定程度上”。',
        explain:
          '这些表达限制结论强度：tend to 不等于 always，may suggest 不等于 prove。保留材料原有的可能性和范围，不能为语气有力就删掉所有限制。',
        next: '概括一个发现 → 找频率和可能性线索 → 检查自己的句子是否比原材料更绝对。',
        examples: [
          [
            'Students tend to remember information better when they explain it to others.',
            '学生把信息解释给别人时，往往记得更好。',
          ],
        ],
      },
      {
        id: 'problems-academic',
        title: '解决问题、满足需求与发挥作用',
        pattern: 'address an issue；meet a need；play a role in；make a difference to',
        read: 'address an issue 是“着手处理问题”，play a role in 是“在……中起作用”。',
        explain:
          'address 直接接问题，不说 address to a problem。play a role in 后接名词或 -ing；make a difference to 表对某对象产生影响，不必然表示彻底解决。',
        next: '提出改进办法 → 指明它处理哪一问题 → 检查搭配，并说明具体怎样起作用，避免空泛的好处句。',
        examples: [
          [
            'Peer feedback can play a role in improving writing.',
            '同伴反馈可以在改善写作方面发挥作用。',
          ],
        ],
      },
      {
        id: 'summary-source',
        title: '概括材料：归属、范围与重点',
        pattern: 'according to；in terms of；with regard to；in summary',
        read: 'according to the report 是“根据该报告”，明确观点来自哪里。',
        explain:
          'according to 用于信息来源；自己的观点通常用 in my opinion，不说 according to me。in terms of 限定比较角度，with regard to 引出话题，in summary 引出概括。',
        next: '总结材料 → 保留来源与讨论范围 → 检查有没有混入个人判断，或把局部发现扩大为整体结论。',
        examples: [
          [
            'According to the report, the new system performs better in terms of speed.',
            '根据该报告，新系统在速度方面表现更好。',
          ],
        ],
      },
      {
        id: 'qualified-agreement',
        title: '先认可，再补充限制',
        pattern: 'agree to some extent / while I agree…',
        read: 'to some extent 表示一定程度上，不是全盘赞同。',
        explain: '后文需要说清认可哪一点、补充什么条件；不能只堆转折词而不给理由。',
        next: '先点明认可内容 → 用条件限定 → 检查自己的立场清楚。',
        examples: [
          [
            'I agree to some extent, but the proposal may not suit smaller communities.',
            '我在一定程度上赞同，但这项提议可能不适合较小的社区。',
          ],
        ],
      },
      {
        id: 'weigh-options',
        title: '比较方案的利弊',
        pattern: 'weigh the benefits against the costs',
        read: 'weigh…against… 表示权衡收益与代价。',
        explain: 'against 在这里是比较基准，不是反对收益；两边应是相互需要取舍的因素。',
        next: '列出收益和成本 → 用 against 对照 → 再给选择理由。',
        examples: [
          [
            'We should weigh the benefits of expansion against its costs.',
            '我们应权衡扩张的收益与成本。',
          ],
        ],
      },
      {
        id: 'outweigh',
        title: '一方重要性超过另一方',
        pattern: 'A outweighs B',
        read: 'benefits outweigh drawbacks 表示利大于弊。',
        explain: 'outweigh 已含比较，不加 than；这是权衡结论，需要后续具体依据。',
        next: '确定哪方占优 → 直接接被超过的一方 → 检查有无理由。',
        examples: [
          ['The long-term benefits outweigh the initial costs.', '长期收益超过了初期成本。'],
        ],
      },
      {
        id: 'make-case',
        title: '给某项主张建立理由',
        pattern: 'make a case for / against',
        read: 'make a case for… 是提出支持某事的理由。',
        explain: 'for 与 against 决定立场方向；不是简单声称“这是个案例”。',
        next: '先定支持或反对 → 给出具体证据 → 检查 for/against。',
        examples: [
          [
            'The report makes a strong case for improving public transport.',
            '报告为改善公共交通提出了有力理由。',
          ],
        ],
      },
      {
        id: 'take-account',
        title: '把相关因素纳入判断',
        pattern: 'take…into account / consideration',
        read: 'take cost into account 是把费用考虑进去。',
        explain: '宾语可放 take 与 into account 之间；不是把这一因素当作唯一标准。',
        next: '找决策受哪些因素影响 → 纳入相关项 → 检查没有遗漏关键限制。',
        examples: [
          [
            'Any evaluation should take differences in income into account.',
            '任何评估都应考虑收入差异。',
          ],
        ],
      },
      {
        id: 'fall-short',
        title: '没有达到标准或预期',
        pattern: 'fall short of',
        read: 'fall short of expectations 表示未达预期。',
        explain: 'short 在此不指物理长度；of 后是未能达到的标准，未达标不一定毫无成效。',
        next: '找实际结果与目标 → 判断差距 → 避免把未达标写成完全失败。',
        examples: [
          [
            "The initial results fell short of the team's expectations.",
            '初步结果没有达到团队预期。',
          ],
        ],
      },
      {
        id: 'in-line-with',
        title: '与规则或趋势相符',
        pattern: 'in line with',
        read: 'in line with the policy 表示符合政策。',
        explain: '此处不是排队；可描述一致性，不自动说明该政策最优或合理。',
        next: '找对照标准 → 检查一致关系 → 不添加价值判断。',
        examples: [
          [
            "The revised procedure is in line with the university's policy.",
            '修订后的流程符合大学政策。',
          ],
        ],
      },
      {
        id: 'reach-consensus',
        title: '形成共同意见',
        pattern: 'reach a consensus on',
        read: 'reach a consensus on priorities 是对优先事项形成共识。',
        explain: 'on 后是达成一致的具体事项；共识范围可能有限，不等于所有问题都同意。',
        next: '圈出共识议题 → 找是否有限定 → 不扩大一致范围。',
        examples: [
          [
            'The committee reached a consensus on the main priorities.',
            '委员会就主要优先事项达成了共识。',
          ],
        ],
      },
      {
        id: 'give-priority',
        title: '把某项事情放在前面',
        pattern: 'give priority to / prioritize',
        read: 'give priority to urgent repairs 表示优先处理紧急维修。',
        explain: 'to 是介词；prioritize 则可直接接对象。优先不等于永远不做其他事。',
        next: '找资源或时间的先后分配 → 用 priority to 或 prioritize → 检查对象。',
        examples: [['The budget gives priority to essential repairs.', '预算优先保障必要维修。']],
      },
      {
        id: 'justify-cost',
        title: '说明投入为何合理',
        pattern: 'justify the cost / justify doing',
        read: 'justify the expense 表示证明这笔开支有合理依据。',
        explain: 'justify 接名词或 -ing，不写 justify to spend；理由要联系实际收益。',
        next: '找到需要论证的成本或行为 → 提供对应收益 → 检查后接形式。',
        examples: [
          [
            'The expected benefits may not justify the additional expense.',
            '预期收益可能不足以证明额外开支合理。',
          ],
        ],
      },
      {
        id: 'feasible-viable',
        title: '可实施与可持续运作',
        pattern: 'a feasible plan / a viable option',
        read: 'feasible 强调做得到，viable 强调能运作或存续。',
        explain: '可执行计划不一定长期经济可行；讨论方案时分别看条件和持续成本。',
        next: '先查能否落实 → 再查能否持续 → 选符合判断的形容词。',
        examples: [
          [
            'The plan is technically feasible but may not be financially viable.',
            '该计划技术上可行，但财务上可能难以持续。',
          ],
        ],
      },
      {
        id: 'generalize-from',
        title: '从有限样本推向更大范围',
        pattern: 'generalize from A to B',
        read: 'generalize from one study 表示从一项研究推广结论。',
        explain: '能否推广取决于样本和情境是否相似；不能因一个案例成功就声称任何地方都有效。',
        next: '圈出原样本和目标群体 → 比较条件 → 限定可推广范围。',
        examples: [
          [
            'We should be cautious about generalizing from one school to an entire region.',
            '将一所学校的结果推广到整个地区时应谨慎。',
          ],
        ],
      },
    ],
  },
  {
    id: 'time-place',
    title: '时间、期限与进度',
    group: '核心搭配',
    description: '校园通知、邮件和听力安排题：听清生效日、截止日、持续时间及改期幅度。',
    topics: [
      {
        id: 'since-for-during',
        title: 'since / for / during：起点、时长、期间',
        pattern: 'since Monday；for two hours；during the lecture',
        read: 'since Monday 是“从周一以来”，for two hours 是“持续两小时”。',
        explain:
          'during 后说在哪段活动或时期内，不直接表示持续多久；during the class 不等于整节课一直如此。since 常与完成时搭配，for 也可用于过去或将来的时长。',
        next: '表达时间跨度 → 先分起点、长度或发生期间 → 选择介词，并检查时态是否符合实际时间。',
        examples: [
          ['I have worked here since June.', '我从六月起就在这里工作。'],
          ['Please keep your phone silent during the lecture.', '讲座期间请把手机调成静音。'],
        ],
      },
      {
        id: 'by-until',
        title: 'by / until：完成期限与持续终点',
        pattern: 'submit by Friday；stay until Friday',
        read: 'submit by Friday 是“最迟周五提交”，stay until Friday 是“一直待到周五”。',
        explain:
          'by 强调不晚于某时完成；until 强调状态或活动持续到某时。not…until 表“直到……才”，不是“到那时之前已经完成”。',
        next: '遇到截止时间 → 判断动作要完成还是持续 → 分别选 by / until，检查是否还有 not 改变意思。',
        examples: [
          ['Please submit the report by Friday.', '请最迟在周五提交报告。'],
          ['The office will remain open until six.', '办公室将一直开放到六点。'],
        ],
      },
      {
        id: 'on-in-time',
        title: 'on time / in time：准时与来得及',
        pattern: 'on time；in time for 名词 / to do；ahead of schedule',
        read: 'on time 是“按规定时间”，in time 是“赶得及、还不晚”。',
        explain:
          'on time 对照时刻表；in time 对照某件事是否还来得及。in time for the lecture 接活动，in time to hear the introduction 接目的动作。',
        next: '翻译“及时” → 问是在说守时还是没错过机会 → 选 on / in，再核对 for 或 to do。',
        examples: [
          [
            'The bus arrived on time, so we reached the hall in time for the talk.',
            '公交车准时到站，所以我们及时赶到大厅听讲座。',
          ],
        ],
      },
      {
        id: 'range-phrases',
        title: '范围与频率：至少、最多、偶尔',
        pattern: 'at least / at most；up to；from…to；once in a while；in advance',
        read: 'at least five 是“至少五个”，up to five 是“最多可达五个”。',
        explain:
          'at most、up to 常标上限，不保证一定达到；from…to 标范围。once in a while 表偶尔，in advance 表提前，不能从单个单词直译出整体意思。',
        next: '读数量或频率要求 → 标记上下限与频次 → 用一个具体数代入检查，确认有没有把上限读成最低要求。',
        examples: [
          [
            'Groups may include up to five students. Please register in advance.',
            '每组最多可有五名学生。请提前登记。',
          ],
        ],
      },
      {
        id: 'within-period',
        title: '从参照点起不超过某时长',
        pattern: 'within + 时间段',
        read: 'within five working days 表示五个工作日内。',
        explain: '是完成的最迟时间范围，不是一定要等五天；working days 还排除了通常的非工作日。',
        next: '找到起算点 → 读清工作日/自然日 → 不把上限当固定等待时间。',
        examples: [
          [
            'You should receive a response within five working days.',
            '你应在五个工作日内收到回复。',
          ],
        ],
      },
      {
        id: 'over-period',
        title: '一段时期内发生的变化',
        pattern: 'over the past / next…',
        read: 'over the past decade 表示过去十年这一期间。',
        explain: 'over 强调跨越一段时间的过程或累积，不表示超过十年；时态由参照时间决定。',
        next: '圈定时间区间 → 找期间变化 → 检查 past/next。',
        examples: [
          ['The city has expanded rapidly over the past decade.', '过去十年间，这座城市迅速扩张。'],
        ],
      },
      {
        id: 'for-time-being',
        title: '目前暂时如此',
        pattern: 'for the time being',
        read: 'for the time being 表示暂时、眼下。',
        explain: '措施不一定永久；阅读通知时不能把临时安排概括为正式长期政策。',
        next: '看到暂时标记 → 记录当前安排 → 留意后续变更条件。',
        examples: [
          [
            'For the time being, all appointments will take place online.',
            '目前所有预约暂时都在线上进行。',
          ],
        ],
      },
      {
        id: 'in-meantime',
        title: '等待期间先做什么',
        pattern: 'in the meantime / meanwhile',
        read: 'in the meantime 表示在等待另一件事期间。',
        explain: '不是等维修结束后才做；明确两个事件的并行或过渡关系。',
        next: '找尚未完成的事件 → 识别等待期间的安排 → 区分先后。',
        examples: [
          [
            'The room is being repaired. In the meantime, use the study area upstairs.',
            '房间正在维修，在此期间请使用楼上的学习区。',
          ],
        ],
      },
      {
        id: 'as-of',
        title: '从某日生效或截至某时状态',
        pattern: 'as of + 日期',
        read: 'as of October 1 表示从十月一日起生效。',
        explain: '在统计报告中也可表示截至某日的状态；要看主句说的是新规则还是累计记录。',
        next: '先看规则还是统计 → 判断起点或截点 → 核对日期。',
        examples: [
          ['As of October 1, visitors must book in advance.', '自十月一日起，访客须提前预约。'],
        ],
      },
      {
        id: 'no-later-than',
        title: '最迟期限',
        pattern: 'no later than + 时间',
        read: 'no later than noon 表示最迟中午。',
        explain: '比简单 at noon 更明确地允许提前完成；不要误听成中午之后。',
        next: '圈出 no later than → 标为最迟点 → 检查任务需提前多久。',
        examples: [
          [
            'Please submit the revised form no later than noon on Friday.',
            '请最迟在周五中午提交修订后的表格。',
          ],
        ],
      },
      {
        id: 'postpone-by-to',
        title: '推迟多久与推迟到何时',
        pattern: 'postpone by 时长 / postpone until 时间',
        read: 'postponed by a week 是推迟一周。',
        explain: 'by 给出移动幅度，until/to 指新时间点；只听到 by a week 不能直接得出具体日期。',
        next: '区分时间段和日期 → 确定推迟幅度或新安排 → 再计算。',
        examples: [
          [
            'The deadline has been postponed by one week, until October 15.',
            '截止日期推迟了一周，延至十月十五日。',
          ],
        ],
      },
      {
        id: 'prior-following',
        title: '某事之前与之后',
        pattern: 'prior to / following + 名词',
        read: 'prior to registration 表示注册之前。',
        explain: 'prior to 的 to 是介词；following 在这里相当于 after，不是正在跟随某人。',
        next: '把短语换成 before/after → 排列事件 → 检查后接名词。',
        examples: [['All fees must be paid prior to registration.', '所有费用必须在注册前付清。']],
      },
      {
        id: 'from-on',
        title: '从某时开始持续如此',
        pattern: 'from then on / from now on',
        read: 'from then on 是从那个过去时点起。',
        explain: 'then 指前文时间，now 指现在；都强调从起点往后，不能只理解为那一刻。',
        next: '找 then 的具体参照 → 标出持续起点 → 读后续变化。',
        examples: [
          [
            'From then on, the team recorded every change to the procedure.',
            '从那以后，团队记录了流程的每一次变更。',
          ],
        ],
      },
      {
        id: 'once-every',
        title: '规律间隔与持续时长',
        pattern: 'once every two weeks / twice a term',
        read: 'once every two weeks 表示每两周一次。',
        explain: '不是每周两次，也不是一次持续两周；频率和持续时间需分别记录。',
        next: '分开次数与间隔 → 换成中文周期 → 检查有没有倒置。',
        examples: [['The group meets once every two weeks.', '小组每两周开会一次。']],
      },
      {
        id: 'consecutive-alternate',
        title: '连续几天与隔天安排',
        pattern: 'consecutive / alternate days',
        read: 'three consecutive days 是连续三天。',
        explain: 'alternate days 通常指隔天；连续与交替会改变出席日期，不能都译成“几天”。',
        next: '识别 consecutive/alternate → 画出日期间隔 → 核对安排。',
        examples: [
          [
            'The equipment must be monitored on three consecutive days.',
            '必须连续三天监测这套设备。',
          ],
        ],
      },
      {
        id: 'in-course',
        title: '在某个过程进行中',
        pattern: 'in the course of / throughout',
        read: 'in the course of the study 是研究过程中。',
        explain: 'throughout 更强调贯穿整个期间；in the course of 不保证每个时刻都发生同一事。',
        next: '判断是期间发生还是全程持续 → 区分两个表达 → 保留时间范围。',
        examples: [
          [
            'Several unexpected problems arose in the course of the study.',
            '研究过程中出现了几个意外问题。',
          ],
        ],
      },
    ],
  },
  {
    id: 'campus',
    title: '课程、作业与学术事务',
    group: '托福场景',
    description: '校园阅读、对话与邮件：选退课、学分、作业安排、学术要求和与教师沟通。',
    topics: [
      {
        id: 'courses',
        title: '选课、退课与满足要求',
        pattern: 'register for / enroll in a course；drop a course；meet the requirements',
        read: 'register for a course 是“注册课程”，meet the requirements 是“满足要求”。',
        explain:
          'register for 与 enroll in 都常用于选课；meet 在这里不是“见面”，而是达到条件。enroll 也可写作英式 enrol；不把拼写变体当作不同含义。',
        next: '表达选课或资格 → 选择整个动作词组 → 检查 for / in，并说明具体课程或要求。',
        examples: [
          [
            'Before enrolling in the course, check whether you meet the requirements.',
            '选这门课前，检查自己是否满足要求。',
          ],
        ],
      },
      {
        id: 'deadlines',
        title: '申请延期与交作业',
        pattern: 'meet / miss a deadline；ask for an extension；submit / hand in',
        read: 'ask for an extension 是“申请延期”，meet the deadline 是“按截止时间完成”。',
        explain:
          '延期请求需要具体任务、原因和希望的新日期，不只写 I need more time。submit 与 hand in 都可表提交；hand it in 中代词放中间。',
        next: '预计无法按时完成 → 写清任务与新日期并提出请求 → 检查是否仍由对方批准，不把请求写成已获许可。',
        examples: [
          ['Could I have a two-day extension on the report?', '我的报告可以延期两天提交吗？'],
          ['I will submit the report by Monday afternoon.', '我会在周一下午之前提交报告。'],
        ],
      },
      {
        id: 'prerequisite',
        title: '修某课之前要满足的条件',
        pattern: 'meet a prerequisite / prerequisite for',
        read: 'prerequisite for the course 是修这门课的前置条件。',
        explain: '满足前置要求不等于已成功选课，仍可能受名额限制；requirement 的范围更广。',
        next: '找到前置条件 → 再查名额和流程 → 区分资格与录取。',
        examples: [
          [
            'Statistics is a prerequisite for the research methods course.',
            '统计学是研究方法课程的先修课。',
          ],
        ],
      },
      {
        id: 'earn-credit',
        title: '课程或活动能否计学分',
        pattern: 'earn credit / count toward a degree',
        read: 'count toward the degree 是计入学位要求。',
        explain: '参加活动不一定有学分；credit 可表示学分额度，具体数量要看课程规定。',
        next: '先查是否计学分 → 再查计入哪项要求 → 不把出席当完成。',
        examples: [
          [
            "The internship counts toward the degree's practical training requirement.",
            '这项实习可计入学位的实践训练要求。',
          ],
        ],
      },
      {
        id: 'major-minor',
        title: '主修与辅修领域',
        pattern: 'major in / minor in',
        read: 'major in biology 表示主修生物学。',
        explain: 'major 作动词时接 in，作名词可说 a biology major；不要把专业名直接当动词宾语。',
        next: '先判断 major 是动词还是身份名词 → 选择对应结构。',
        examples: [
          ['She majors in biology and minors in statistics.', '她主修生物学，辅修统计学。'],
        ],
      },
      {
        id: 'office-hours',
        title: '教师答疑时段',
        pattern: 'attend office hours / during office hours',
        read: 'office hours 在课程语境中常指教师答疑时间。',
        explain: '不一定是办公室全部办公时段；通常适合问课程和作业问题，是否需预约看通知。',
        next: '先认清教师答疑语境 → 找时间和预约要求 → 再安排行程。',
        examples: [
          [
            'You can discuss your draft with the professor during office hours.',
            '你可以在答疑时间与教授讨论初稿。',
          ],
        ],
      },
      {
        id: 'make-up-work',
        title: '补做错过的任务',
        pattern: 'make up a missed class / assignment',
        read: 'make up the assignment 表示补做作业。',
        explain: '不是编造作业内容；make-up 作名词前修饰语时可用于补考、补课。',
        next: '结合 missed/absence → 判断是补做 → 核对允许的方式和期限。',
        examples: [
          [
            'Students who were absent may make up the assignment next week.',
            '缺席的学生可以在下周补做作业。',
          ],
        ],
      },
      {
        id: 'audit-course',
        title: '旁听与正式修课',
        pattern: 'audit a course / take…for credit',
        read: 'audit a course 表示旁听，通常不获取该课学分。',
        explain: '具体作业和出席要求依课程规定；不要把 audit 一律理解成财务审计。',
        next: '确认课程语境 → 区分旁听与计学分注册 → 查参与要求。',
        examples: [
          [
            'I plan to audit the course rather than take it for credit.',
            '我打算旁听这门课，而不为获取学分正式修读。',
          ],
        ],
      },
      {
        id: 'waitlist',
        title: '课程满额后的候补',
        pattern: 'be on a waiting list / join the waitlist',
        read: 'on the waiting list 表示正在候补。',
        explain: '还没有正式获得名额；若有位置空出，是否自动加入需看规则。',
        next: '分开候补状态与已选上 → 留意空位通知 → 核对确认步骤。',
        examples: [
          [
            'You can join the waitlist if the course is full.',
            '如果课程满额，你可以加入候补名单。',
          ],
        ],
      },
      {
        id: 'schedule-conflict',
        title: '两个安排撞时间',
        pattern: 'a scheduling conflict / conflict with',
        read: 'conflicts with my lab 表示与实验课时间冲突。',
        explain: '这里 conflict 不是意见不合；通常需要改时段或选择另一活动。',
        next: '先对照时间 → 确认冲突安排 → 提出可用替代时段。',
        examples: [
          ['The seminar conflicts with my laboratory session.', '研讨课与我的实验课时间冲突。'],
        ],
      },
      {
        id: 'transfer-credit',
        title: '以前修过的学分是否认可',
        pattern: 'transfer credits / receive credit for',
        read: 'transfer credits 指把原学校的学分转入。',
        explain: '申请转学分与批准不同；需要课程内容或成绩材料，不能因修过就默认认可。',
        next: '找原课程与目标要求 → 检查审核材料 → 区分申请和获批。',
        examples: [
          [
            'The department will review whether your previous credits can be transferred.',
            '该系将审核你以前取得的学分能否转入。',
          ],
        ],
      },
      {
        id: 'academic-standing',
        title: '学业状态与资格限制',
        pattern: 'maintain good academic standing',
        read: 'good academic standing 表示达到学校规定的学业状态要求。',
        explain: '不是单指某一次成绩优秀；涉及继续学习或获得资助的条件，具体标准看材料。',
        next: '看到资格条件 → 找对应成绩或进度要求 → 不自行补出分数线。',
        examples: [
          [
            'Students must maintain good academic standing to keep the scholarship.',
            '学生须保持符合要求的学业状态，才能继续获得奖学金。',
          ],
        ],
      },
      {
        id: 'cite-sources',
        title: '引用资料与标明来源',
        pattern: 'cite sources / acknowledge a source',
        read: 'cite sources 表示注明所用资料来源。',
        explain: '用自己的话改写也可能需要标明来源；citation 是引用标注，不等于复制整段。',
        next: '识别借用的观点或文字 → 标注来源 → 检查引用与自己论述的边界。',
        examples: [
          [
            'You should cite the source even when you paraphrase the idea.',
            '即使改写了观点，也应注明来源。',
          ],
        ],
      },
      {
        id: 'peer-review',
        title: '同伴反馈与专业审阅',
        pattern: 'peer feedback / peer review',
        read: 'peer feedback 在课堂上常指同学互评。',
        explain: '研究发表中的 peer review 则是同行审阅；不能把同一表达固定理解成教师批改。',
        next: '看课堂还是出版语境 → 确定审阅者 → 找反馈目的。',
        examples: [
          [
            'The class uses peer feedback to help students revise their drafts.',
            '课堂通过同伴反馈帮助学生修改初稿。',
          ],
        ],
      },
      {
        id: 'field-trip',
        title: '课程安排的实地活动',
        pattern: 'go on a field trip / conduct fieldwork',
        read: 'field trip 是实地参观或考察，fieldwork 是田野或实地研究。',
        explain: '两者都在现场，但一次参观不必然涉及正式采样研究；注意出行与研究目的。',
        next: '找活动目标 → 区分参观和收集数据 → 核对地点与准备事项。',
        examples: [
          [
            'The course includes a field trip to a local wetland.',
            '课程包含一次到当地湿地的实地考察。',
          ],
        ],
      },
      {
        id: 'grading-criteria',
        title: '评分看哪些维度',
        pattern: 'meet the grading criteria / assessment rubric',
        read: 'grading criteria 表示评分标准。',
        explain: 'criteria 是 criterion 的复数；格式符合不等于所有内容要求都满足。',
        next: '逐项找评分要求 → 对照内容与形式 → 不只检查字数。',
        examples: [
          [
            'The instructor explained the grading criteria before assigning the project.',
            '教师在布置项目之前说明了评分标准。',
          ],
        ],
      },
    ],
  },
  {
    id: 'campus-services',
    title: '校园服务与活动安排',
    group: '托福场景',
    description: '日常阅读、通知和校园对话：预约、借用、费用、设施、交通与活动的常用表达。',
    topics: [
      {
        id: 'appointments',
        title: '预约、改期与取消',
        pattern: 'make an appointment with；schedule / reschedule a meeting；cancel a booking',
        read: 'an appointment with my advisor 是“与导师的预约会面”。',
        explain:
          'make an appointment 表预约，with 后说见谁；for 可引出预约时段。reschedule 表改期，需要说清新时间；cancel 只说明取消，不自动意味着另约。',
        next: '发预约或改期邮件 → 写明对象、原时间和希望的新时间 → 检查读者能否据此行动。',
        examples: [
          [
            'Could we reschedule our meeting for Thursday afternoon?',
            '我们能把会面改到周四下午吗？',
          ],
        ],
      },
      {
        id: 'borrow-lend',
        title: '借入、借出、带来与带走',
        pattern: 'borrow 物 from 人；lend 物 to 人；bring / take',
        read: 'borrow from 是“从别人那里借入”，lend to 是“借给别人”。',
        explain:
          'borrow、lend 取决于物品流动方向，不取决于有没有归还。bring 常朝说话人或参照地点带来，take 常从那里带走；须结合谈话地点判断。',
        next: '表达借或带 → 画出物品从谁到谁、从哪到哪 → 再选动词，检查 from / to。',
        examples: [
          ['Can I borrow your notes until tomorrow?', '我能借你的笔记用到明天吗？'],
          ['I lent my calculator to a classmate.', '我把计算器借给了一位同学。'],
        ],
      },
      {
        id: 'reserve-facility',
        title: '预约空间或设施',
        pattern: 'reserve a room / make a reservation',
        read: 'reserve a room 在此指预留活动空间。',
        explain: 'reservation 是名词，通常用 make；reserve 不表示立即付款，费用与规则需另看。',
        next: '先确定预订对象 → 查时间与容量 → 核对是否需要确认。',
        examples: [
          [
            'You need to reserve the seminar room at least two days in advance.',
            '你需要至少提前两天预订研讨室。',
          ],
        ],
      },
      {
        id: 'check-out-renew',
        title: '借阅与续借',
        pattern: 'check out / renew a book',
        read: 'check out a book 在图书馆语境中表示“借阅一本书（从图书馆借走）”。',
        explain: 'renew 是延长借期，不是再买一本；酒店中 check out 则是退房，要随场景判断。',
        next: '先认场景 → 区分借阅、续借与退房 → 核对到期日。',
        examples: [
          [
            'You can renew the book online unless another reader has requested it.',
            '除非有其他读者预约这本书，否则你可以在线续借。',
          ],
        ],
      },
      {
        id: 'on-reserve',
        title: '限时借阅的课程资料',
        pattern: 'on reserve / course reserves',
        read: 'on reserve 表示被放入专门保留的课程资料中。',
        explain: '不等于已经借给某个学生；常有较短借期或馆内使用限制，细则看说明。',
        next: '听到 on reserve → 找课程资料区 → 检查借阅限制。',
        examples: [
          [
            'The required readings are on reserve at the library desk.',
            '指定阅读材料在图书馆服务台的课程保留资料中。',
          ],
        ],
      },
      {
        id: 'overdue-fine',
        title: '逾期状态与罚款',
        pattern: 'be overdue / pay a late fee',
        read: 'overdue 表示已过截止期，late fee 是逾期费用。',
        explain: 'due 指到期，overdue 才是逾期；不要把将到期通知当成已罚款。',
        next: '对照当前日期与期限 → 判断 due/overdue → 再确认费用。',
        examples: [
          [
            'The equipment is overdue, so a late fee may apply.',
            '设备已逾期未还，因此可能产生逾期费用。',
          ],
        ],
      },
      {
        id: 'valid-id',
        title: '凭证有效与身份核验',
        pattern: 'present a valid ID / proof of enrollment',
        read: 'valid ID 是有效身份证明。',
        explain: 'valid 强调当前被接受且未失效，不只是“真实”；proof of enrollment 则证明在读身份。',
        next: '找具体凭证要求 → 核查有效性 → 不用其他文件随意代替。',
        examples: [
          [
            'Please present a valid student ID when collecting the pass.',
            '领取通行证时请出示有效学生证。',
          ],
        ],
      },
      {
        id: 'waive-fee',
        title: '免除费用与退回费用',
        pattern: 'waive a fee / refund a payment',
        read: 'waive the fee 是免收费用，refund 是退还已付款项。',
        explain: '两个动作发生阶段不同；减免不一定等于全免，需看部分或全部。',
        next: '先看是否已付款 → 区分免收与退款 → 核对金额范围。',
        examples: [
          [
            'The application fee will be waived for eligible students.',
            '符合条件的学生将获免申请费。',
          ],
        ],
      },
      {
        id: 'deposit-refundable',
        title: '押金是否可退',
        pattern: 'a refundable deposit / nonrefundable fee',
        read: 'refundable deposit 是可退押金。',
        explain:
          '押金通常附带返还条件，refundable 不表示任何情况下自动全退；注意 damage 等扣除条件。',
        next: '找到可退标记 → 查返还条件 → 区分押金与服务费。',
        examples: [
          [
            'The equipment requires a refundable deposit of twenty dollars.',
            '借用设备需要缴纳二十美元可退押金。',
          ],
        ],
      },
      {
        id: 'maintenance-out',
        title: '设施暂停使用',
        pattern: 'out of service / under maintenance',
        read: 'out of service 表示不能使用。',
        explain: 'under maintenance 说明正维护；不代表永久停用，也不一定所有同类设施都关闭。',
        next: '圈出具体设施 → 查暂停原因和时段 → 找替代安排。',
        examples: [
          [
            'The elevator is out of service while maintenance is carried out.',
            '电梯在维护期间暂停使用。',
          ],
        ],
      },
      {
        id: 'accessibility',
        title: '通达与可使用的条件',
        pattern: 'be accessible to / wheelchair access',
        read: 'accessible to visitors 表示访客可以到达或使用。',
        explain: '可及性可能指物理通道、使用权限或信息可读性，要按对象理解。',
        next: '先判断设施还是信息 → 找使用对象和限制 → 不一律译成地理距离近。',
        examples: [
          ['The main entrance is accessible to wheelchair users.', '轮椅使用者可以通过正门进入。'],
        ],
      },
      {
        id: 'shuttle-route',
        title: '校车线路与临时调整',
        pattern: 'shuttle service / a temporary route',
        read: 'shuttle service 指往返固定地点的接驳服务。',
        explain: 'temporary route 是临时路线；改道不等于取消整项服务，听力中要保留替代站点。',
        next: '找起终点与改动时段 → 区分改道和停运 → 记录替代站点。',
        examples: [
          [
            'The shuttle will follow a temporary route during construction.',
            '施工期间，接驳车将走临时路线。',
          ],
        ],
      },
      {
        id: 'first-come',
        title: '名额按先后分配',
        pattern: 'on a first-come, first-served basis',
        read: 'first-come, first-served 表示先到先得。',
        explain: '不一定接受预订或保证所有人都有名额；仍受数量限制。',
        next: '识别分配方式 → 查名额与开放时间 → 不把登记误当保证。',
        examples: [
          [
            'Seats are available on a first-come, first-served basis.',
            '座位按先到先得的方式分配。',
          ],
        ],
      },
      {
        id: 'subject-availability',
        title: '安排取决于是否有空余',
        pattern: 'subject to availability',
        read: 'subject to availability 表示以实际有空余为前提。',
        explain: '这是限制条件，不是已确认预约；必须继续看确认信息。',
        next: '找受限制的安排 → 核实可用名额 → 区分申请与确认。',
        examples: [
          ['Additional rooms may be booked subject to availability.', '如有空余，可以加订房间。'],
        ],
      },
      {
        id: 'turnout-attendance',
        title: '实际到场人数与预计人数',
        pattern: 'a high turnout / expected attendance',
        read: 'turnout 指实际参加的人数或比例。',
        explain: 'expected attendance 是预估；不要把预计两百人理解成已有两百人到场。',
        next: '识别 expected/actual → 分开预测与事实 → 再读人数。',
        examples: [
          [
            'The event had a higher turnout than the organizers expected.',
            '活动的到场人数超过组织者预期。',
          ],
        ],
      },
      {
        id: 'sign-up-volunteer',
        title: '报名承担任务',
        pattern: 'sign up for / volunteer to do',
        read: 'volunteer to help 表示自愿帮忙。',
        explain: 'sign up for 后接活动名词；volunteer to 后接动作，不同于被强制分配。',
        next: '找是报名活动还是自愿行动 → 选 for + 名词或 to do。',
        examples: [
          [
            'Students can volunteer to guide visitors during orientation.',
            '学生可以自愿在迎新期间为访客引导。',
          ],
        ],
      },
    ],
  },
  {
    id: 'email',
    title: '邮件请求与问题处理',
    group: '托福场景',
    description: '邮件写作用得上的表达：交代来意、说明影响、请求具体行动、给出替代方案并确认后续。',
    topics: [
      {
        id: 'polite-requests',
        title: '礼貌请求：could 与 would you mind',
        pattern: 'Could you please do…?；Would you mind doing…?',
        read: 'Would you mind…? 是“你介意……吗”，所以不是普通的“你愿意吗”。',
        explain:
          'could you 后接原形，mind 后接 -ing。回答 mind 问句时，No, not at all 表不介意；用 Sure, I can help 等清楚回应，可避免简单 yes / no 的歧义。',
        next: '提出请求 → 先选 could you 或 mind → 检查原形／-ing，并在回应时说清能否帮忙。',
        examples: [
          ['Could you please send me the updated schedule?', '你能把更新后的日程发给我吗？'],
          ['Would you mind checking this paragraph?', '你介意帮我检查这一段吗？'],
        ],
      },
      {
        id: 'clarification',
        title: '没听清与没听懂：请求澄清',
        pattern: 'Could you repeat…?；What do you mean by…?；Could you clarify whether…?',
        read: 'repeat 是“重复一遍”，clarify 是“说明清楚”，两者解决的问题不同。',
        explain:
          '声音没听清可请求重复；理解不清应点明哪个词或哪条要求。What do you mean by…? 后接具体表达；clarify whether 后用陈述语序。',
        next: '遇到理解障碍 → 先区分声音还是含义 → 明确指出疑问，检查对方是否知道要补充哪条信息。',
        examples: [
          [
            'Could you clarify whether we need to submit a printed copy?',
            '你能说明一下我们是否需要提交纸质版吗？',
          ],
        ],
      },
      {
        id: 'apologies',
        title: '道歉、感谢与说明原因',
        pattern: 'apologize to 人 for 事；thank 人 for；appreciate + 名词／doing',
        read: 'apologize for the delay 是“为延误道歉”，thank you for your help 是“感谢你的帮助”。',
        explain:
          'apologize 的 to 接对象，for 接原因；thank 直接接被感谢的人。appreciate your help 表“感谢你的帮助”，不说 appreciate you for your help 来替代常规感谢结构。',
        next: '表达歉意或感谢 → 指明具体事件 → 检查人和原因的位置，说明下一步补救时另用清楚的句子。',
        examples: [
          ['I apologize for submitting the form late.', '我为迟交表格道歉。'],
          ['I appreciate your help with the application.', '感谢你在申请方面给予的帮助。'],
        ],
      },
      {
        id: 'problems-solutions',
        title: '报告问题，并提出可执行的办法',
        pattern: 'have trouble doing；be unable to；Could you help me…?',
        read: 'have trouble accessing 是“访问时遇到困难”，be unable to 是“无法”。',
        explain:
          'trouble 后接动作常用 -ing；unable 后用 to do。说明具体出错的位置、现象和需要的帮助，比仅说 it does not work 更容易得到有效回复。',
        next: '说明故障 → 写出你做了什么和发生了什么 → 再提出一个明确请求，检查对方能否定位问题。',
        examples: [
          [
            'I am having trouble accessing the course page. Could you check my account?',
            '我访问课程页面时遇到了困难。你能帮我检查账号吗？',
          ],
        ],
      },
      {
        id: 'writing-regarding',
        title: '直接交代来信主题',
        pattern: 'I am writing regarding / to inquire about…',
        read: 'inquire about… 表示咨询某事。',
        explain:
          'regarding 后接事项名词，to inquire about 后也接所询事项；开头应指明具体对象，避免空泛。',
        next: '明确收件人与事项 → 一句说明目的 → 检查请求范围清楚。',
        examples: [
          [
            'I am writing to inquire about access to the research archive.',
            '我写信想咨询研究档案的访问事宜。',
          ],
        ],
      },
      {
        id: 'grateful-if',
        title: '委婉请求对方行动',
        pattern: 'I would be grateful if you could…',
        read: 'grateful if…could 是“如果您能……，我将很感谢”。',
        explain: 'if 后仍需完整主语和动作；请求最好具体到文件、日期或操作。',
        next: '写清对方要做什么 → 用 if you could 包起 → 核对请求可执行。',
        examples: [
          [
            'I would be grateful if you could send the updated schedule.',
            '如果您能发来更新后的日程，我将非常感谢。',
          ],
        ],
      },
      {
        id: 'appreciate-it-if',
        title: '请求句中的 it 不漏',
        pattern: 'I would appreciate it if…',
        read: 'appreciate it if… 表示希望对方做某事并表达感谢。',
        explain: '这里 it 先占宾语位置；另可直接说 appreciate your help，不能把两种句型混写。',
        next: '选择名词感谢或 if 请求 → if 结构保留 it → 核对后句完整。',
        examples: [
          [
            'I would appreciate it if you could confirm my registration.',
            '如能确认我的报名，我将不胜感激。',
          ],
        ],
      },
      {
        id: 'extension-until',
        title: '延期请求给出新期限',
        pattern: 'request an extension until…',
        read: 'extension until Friday 表示希望延期到周五。',
        explain: '说明需要延期的原因和具体新日期；只说 more time 可能让对方无法判断如何批准。',
        next: '给出原因 → 提出新截止日 → 检查可否按新计划完成。',
        examples: [
          [
            'Could I request an extension until Friday to complete the report?',
            '我能否申请延期至周五完成报告？',
          ],
        ],
      },
      {
        id: 'bring-attention',
        title: '礼貌指出一个需要处理的问题',
        pattern: 'bring…to your attention',
        read: 'bring an error to your attention 是提醒对方注意错误。',
        explain: '语气较客观；后面应具体说明错误位置或影响，不只说 everything is wrong。',
        next: '指出具体问题 → 说明影响 → 请求相应处理。',
        examples: [
          [
            'I would like to bring an error in the booking confirmation to your attention.',
            '我想提醒您注意预订确认中的一处错误。',
          ],
        ],
      },
      {
        id: 'inconvenience-caused',
        title: '为造成的影响道歉',
        pattern: 'apologize for the inconvenience caused',
        read: 'inconvenience caused 指造成的不便。',
        explain: '道歉应接上实际补救行动；caused 是后置修饰，描述已经造成的影响。',
        next: '说明不便 → 简短道歉 → 给出可执行补救。',
        examples: [
          [
            'I apologize for the inconvenience caused and will send the corrected file today.',
            '我为造成的不便道歉，并会在今天发送更正后的文件。',
          ],
        ],
      },
      {
        id: 'alternative-arrangement',
        title: '提出具体替代安排',
        pattern: 'make alternative arrangements / alternatively',
        read: 'alternative arrangements 指可替代的安排。',
        explain: '不能只说“有别的办法”而不给细节；alternatively 常引出另一种可选方案。',
        next: '先说明原安排的问题 → 提出时间或方式替代 → 请求对方确认。',
        examples: [
          [
            'Alternatively, we could meet online at the same time.',
            '或者，我们可以在同一时间在线上见面。',
          ],
        ],
      },
      {
        id: 'at-convenience',
        title: '方便时处理与明确截止期',
        pattern: 'at your convenience / by…',
        read: 'at your convenience 表示在对方方便时。',
        explain: '若实际有明确期限，应直接给出日期；不应一边说随时方便一边暗示必须立刻完成。',
        next: '判断是否有硬期限 → 选择礼貌宽限或明确日期 → 保持一致。',
        examples: [
          [
            'Please let me know a suitable time at your convenience.',
            '请在方便时告知我一个合适的时间。',
          ],
        ],
      },
      {
        id: 'follow-up-request',
        title: '跟进此前联系的事项',
        pattern: 'follow up on + 请求/邮件',
        read: 'follow up on my request 表示跟进之前的请求。',
        explain: 'on 后接前次事项；最好提供日期或主题，方便对方定位，而不是泛泛催促。',
        next: '标明此前事项 → 询问当前状态 → 给出需要下一步的信息。',
        examples: [
          [
            'I am following up on the equipment request I sent on Monday.',
            '我想跟进周一发送的设备申请。',
          ],
        ],
      },
      {
        id: 'confirm-whether',
        title: '确认未知信息，不预设结果',
        pattern: 'confirm whether / confirm that',
        read: 'confirm whether… 询问是否，confirm that… 核实一个具体说法。',
        explain: '如果尚不知是否有名额，用 whether 更准确；不要把希望的结果写成已确认事实。',
        next: '先判断是否已有确定说法 → 选 whether/that → 检查语气。',
        examples: [
          [
            'Could you confirm whether any places are still available?',
            '您能确认一下是否还有名额吗？',
          ],
        ],
      },
      {
        id: 'attached-for',
        title: '附上材料并说明用途',
        pattern: 'attach…for reference / review',
        read: 'for your reference 是供参考，for review 是请审阅。',
        explain: '附件用途影响对方是否需要行动；邮件中应与实际附件一致，不能说附了却未附。',
        next: '指出附件是什么 → 说明需要的动作 → 发送前核对附件。',
        examples: [
          [
            'I have attached the revised proposal for your review.',
            '我已附上修订后的提案，请您审阅。',
          ],
        ],
      },
      {
        id: 'keep-informed',
        title: '让对方及时知道后续',
        pattern: 'keep 人 informed of / updated on',
        read: 'keep you updated on progress 表示持续告知进展。',
        explain:
          'informed/updated 描述对象获得信息的状态；不是 keep you inform，也不等于保证进度。',
        next: '确定告知对象与事项 → 选过去分词 → 给出合理的更新节点。',
        examples: [
          ['I will keep you updated on the progress of the repairs.', '我会及时告知您维修进展。'],
        ],
      },
    ],
  },
  {
    id: 'spoken',
    title: '听力对话与访谈表达',
    group: '托福场景',
    description:
      '听力回应、校园对话与口语访谈：听出建议、犹豫、改口和隐含意图，按自然语块组织回答。',
    topics: [
      {
        id: 'preferences-invitations',
        title: '表达偏好、建议与邀请',
        pattern: 'prefer A to B；would rather do；How about doing…?；Would you like to do…?',
        read: 'prefer A to B 是“比起B更喜欢A”，How about…? 用来提出建议。',
        explain:
          'prefer 后并列内容要对齐：prefer studying alone to studying in groups。would rather 后接原形；How about 后接名词或 -ing；would like 后接 to do。',
        next: '表达偏好或邀请 → 先选合适句式 → 核对并列形式以及原形、to do、doing，不把不同句式拼在一起。',
        examples: [
          ['How about meeting at the library after class?', '下课后在图书馆见面怎么样？'],
          ['I would rather study in a quiet room.', '我更愿意在安静的房间学习。'],
        ],
      },
      {
        id: 'used-to',
        title: 'used to / be used to / be used for',
        pattern: 'used to do 过去常做；be used to doing 习惯；be used to do / for doing 用途',
        read: 'used to drive 表“过去常开车”，am used to walking 表“习惯走路”。',
        explain:
          'used to + 原形常暗示如今不同；be / get used to + 名词或 -ing 表习惯。物品 be used to do 是被动的用途结构，如 a tool is used to cut，不能只看 used to 三个词判断。',
        next: '遇到 used to → 先找 be，再看主语和含义 → 分清过去习惯、现在习惯或物品用途，检查动词形式。',
        examples: [
          [
            'I used to drive, but now I am used to walking to campus.',
            '我以前常开车，但现在习惯步行去校园。',
          ],
          ['This room is used for storing equipment.', '这个房间用于存放设备。'],
        ],
      },
      {
        id: 'separable-phrasal',
        title: '短语动词：it 应该放中间吗',
        pattern: 'look up a word / look it up；turn it off；hand it in',
        read: 'look up 表“查找”，turn off 表“关闭”，hand in 表“提交”。',
        explain:
          '这些可分短语动词接代词时，把代词放中间：look it up，不说 look up it。普通名词常可放中间或后面；但 look after（照顾）不可这样拆开。',
        next: '短语动词后接 it / them → 查它是否可分 → 可分时把代词置中，不可分时保持整体。',
        examples: [
          ['If you do not know the word, look it up.', '如果你不认识这个词，就查一查。'],
          ['Please turn off the lights before you leave.', '离开前请关灯。'],
        ],
      },
      {
        id: 'phrasal-meanings',
        title: '日常高频短语：推迟、用完、想出',
        pattern: 'put off；run out of；come up with；find out；work out',
        read: 'put off 是“推迟”，run out of 是“用完”，come up with 是“想出”。',
        explain:
          '短语意义不一定是单词意义相加。put off 后可接 -ing；run out of 后说明用完的东西；work out 可指解决、计算或锻炼，要结合对象。',
        next: '读到短语动词 → 将整个短语圈为一个单位 → 按上下文确定含义，并保留末尾介词。',
        examples: [
          [
            'We came up with a solution before we ran out of time.',
            '我们在时间用完前想出了解决办法。',
          ],
          ['Do not put off checking the application requirements.', '不要拖着不核对申请要求。'],
        ],
      },
      {
        id: 'why-dont',
        title: '看似问原因，其实提建议',
        pattern: "Why don't we / you + 动词原形?",
        read: "Why don't we… 通常是“我们不如……”。",
        explain: '在建议语境下不需解释“为什么不”；应回应方案是否可行，语气和上下文可改变用途。',
        next: "听见 Why don't… → 结合语气判断建议 → 回应行动方案。",
        examples: [["Why don't we ask the librarian for help?", '我们不如向图书馆员求助吧？']],
      },
      {
        id: 'could-have-request',
        title: 'could 用于请求与可能性',
        pattern: 'Could you…? / It could…',
        read: 'Could you move… 是请求，不是在测试能力。',
        explain: '主语是 you 且语境是当前操作时，常要求行动；It could… 则可能是在推测。',
        next: '先看主语和场景 → 区分请求与推测 → 选对应回应。',
        examples: [
          [
            'Could you move your bag so someone else can sit here?',
            '你能挪一下包，让别人坐这里吗？',
          ],
        ],
      },
      {
        id: 'mind-response',
        title: 'mind 问句的回答方向',
        pattern: 'Would you mind if…? / Not at all.',
        read: 'Would you mind… 问“你是否介意”。',
        explain: 'Not at all 表示不介意，即同意；不要按普通 yes/no 请求机械理解。',
        next: '先把问题译成“介不介意” → 再判断回答是否介意 → 确认允许与否。',
        examples: [
          [
            'Would you mind if I opened the window? — Not at all.',
            '你介意我开窗吗？——完全不介意。',
          ],
        ],
      },
      {
        id: 'im-afraid',
        title: '委婉说明无法做到',
        pattern: "I'm afraid…",
        read: "I'm afraid the room is booked 表示遗憾地告知已被订。",
        explain: '通常不是说话者感到害怕；常引出拒绝、限制或坏消息。',
        next: "听到 I'm afraid → 关注后面的限制 → 找可能的替代方案。",
        examples: [
          [
            "I'm afraid the room is already booked for that afternoon.",
            '很遗憾，那个下午的房间已经被预订了。',
          ],
        ],
      },
      {
        id: 'not-really',
        title: '弱化的否定回应',
        pattern: 'not really / not particularly',
        read: 'Not really 表示不太是、不怎么。',
        explain: '语气比直接 no 缓和，但通常仍偏否定；后面的解释决定具体程度。',
        next: '听完整回应 → 判断缓和否定 → 不只抓 really 当肯定。',
        examples: [
          [
            'Did you find the tutorial helpful? — Not really; it moved too quickly.',
            '你觉得教程有帮助吗？——不太有，讲得太快了。',
          ],
        ],
      },
      {
        id: 'as-far-know',
        title: '把判断限定在已知范围',
        pattern: 'as far as I know / can tell',
        read: 'as far as I know 是据我所知。',
        explain: '说话者保留信息不完整的可能；不能转述成已经得到正式确认。',
        next: '听到范围限定 → 保留不确定性 → 区分个人所知与已核实事实。',
        examples: [
          ['As far as I know, the deadline has not changed.', '据我所知，截止日期没有变。'],
        ],
      },
      {
        id: 'turn-out',
        title: '实际结果与原先预期',
        pattern: 'turn out to be / it turns out that…',
        read: 'turned out to be 表示结果发现是。',
        explain: '通常带发现实际情况的意味；不自动表示意外好或坏，要看后面的内容。',
        next: '找最终发现 → 与先前预期比较 → 不只凭语气猜结果。',
        examples: [
          [
            'The task turned out to be more complicated than we expected.',
            '结果发现，这项任务比我们预想的更复杂。',
          ],
        ],
      },
      {
        id: 'get-around',
        title: '终于抽出时间处理',
        pattern: 'get around to + doing',
        read: 'get around to reading 表示终于抽空阅读。',
        explain: "to 是介词；haven't got around to 表示还没来得及做，不一定是不愿意做。",
        next: '圈出是否已做 → 看时间不足还是拒绝 → 检查 to doing。',
        examples: [
          ["I haven't gotten around to reading the feedback yet.", '我还没来得及看反馈。'],
        ],
      },
      {
        id: 'keep-up-catch-up',
        title: '跟上进度与补上落后部分',
        pattern: 'keep up with / catch up on / catch up with',
        read: 'catch up on reading 是补上落下的阅读。',
        explain:
          'keep up 表持续不落后；catch up 表已有差距后追赶；on 常接待补任务，with 常接人或进度。',
        next: '先判断是否已落后 → 选 keep up/catch up → 核对对象。',
        examples: [
          [
            'I need the weekend to catch up on the assigned reading.',
            '我需要利用周末补完指定阅读。',
          ],
        ],
      },
      {
        id: 'put-up-with',
        title: '忍受不便',
        pattern: 'put up with',
        read: 'put up with noise 表示忍受噪声。',
        explain: '是固定整体，不表示把东西举起来；常暗示情况不理想但暂时承受。',
        next: '把三词作为语块识别 → 找不便来源 → 判断说话者态度。',
        examples: [
          [
            'I can put up with the noise for a few days, but not for a month.',
            '我能忍受几天噪声，但一个月就不行了。',
          ],
        ],
      },
      {
        id: 'on-second-thought',
        title: '重新考虑后改主意',
        pattern: 'on second thought / actually',
        read: 'on second thought 表示重新想了想。',
        explain: '之后通常是修正后的意图；细节题应以最终安排为准，不能停在开头的旧计划。',
        next: '听到改口信号 → 更新原记录 → 核对最终决定。',
        examples: [
          [
            "On second thought, let's meet after the lecture instead.",
            '再想了一下，我们还是讲座后见面吧。',
          ],
        ],
      },
      {
        id: 'what-i-mean',
        title: '换种说法解释重点',
        pattern: 'what I mean is / in other words',
        read: 'what I mean is 表示“我的意思是”。',
        explain: '后文澄清原意，通常是理解说话重点的线索；不一定引入新论点。',
        next: '抓住重述信号 → 用后一句校正理解 → 检查是否只是换说法。',
        examples: [
          [
            'What I mean is that students need more time to test their ideas.',
            '我的意思是，学生需要更多时间检验自己的想法。',
          ],
        ],
      },
    ],
  },
  {
    id: 'environment',
    title: '环境、生态与自然过程',
    group: '托福场景',
    description:
      '学术阅读和讲座的常见主题表达：栖息地、资源、环境措施和自然变化；重点掌握语言关系。',
    topics: [
      {
        id: 'habitat-loss',
        title: '栖息地减少与破碎化',
        pattern: 'habitat loss / habitat fragmentation',
        read: 'habitat loss 是栖息地丧失，fragmentation 是被分隔成碎片。',
        explain: '二者并非同一现象；后者强调连通性减少，阅读时要根据材料区分影响机制。',
        next: '先确定面积减少还是空间分隔 → 对应关键词 → 找文中的后果。',
        examples: [
          [
            'The study examines how habitat fragmentation affects animal movement.',
            '该研究考察栖息地破碎化如何影响动物移动。',
          ],
        ],
      },
      {
        id: 'maintain-biodiversity',
        title: '生物多样性的保护',
        pattern: 'maintain / preserve biodiversity',
        read: 'preserve biodiversity 表示保护生物多样性。',
        explain: 'biodiversity 通常是不可数概念；可以说 a loss of biodiversity，不能随意加复数 s。',
        next: '把动词与 biodiversity 连读 → 检查是维持、减少还是恢复 → 核对方向。',
        examples: [
          [
            'The project aims to preserve biodiversity in the surrounding wetlands.',
            '项目旨在保护周边湿地的生物多样性。',
          ],
        ],
      },
      {
        id: 'ecological-balance',
        title: '生态系统的平衡与扰动',
        pattern: 'disrupt / restore ecological balance',
        read: 'disrupt 表示打乱，restore 表示恢复。',
        explain: '两种动词方向相反；不能只因出现 balance 就判断环境正在改善。',
        next: '先圈动作动词 → 再读受影响系统 → 分清破坏与修复。',
        examples: [
          [
            'The lecture discusses factors that can disrupt ecological balance.',
            '讲座讨论了可能打破生态平衡的因素。',
          ],
        ],
      },
      {
        id: 'deplete-resources',
        title: '资源被逐渐耗尽',
        pattern: 'deplete natural resources / resource depletion',
        read: 'deplete 表示消耗存量，使其减少。',
        explain: '不同于 destroy 的直接毁坏；depletion 是名词形式，常讨论长期消耗的后果。',
        next: '看动作是消耗还是破坏 → 找资源存量变化 → 检查时间过程。',
        examples: [
          [
            'The report warns that rapid extraction may deplete local resources.',
            '报告警告，快速开采可能耗尽当地资源。',
          ],
        ],
      },
      {
        id: 'renewable-sources',
        title: '可再生能源与能源来源',
        pattern: 'renewable energy sources',
        read: 'renewable energy sources 是可再生能源来源。',
        explain: 'source 指来源，resource 指可利用资源；不要把两者在所有搭配中直接互换。',
        next: '先确定谈来源还是资源储量 → 选 source/resource → 核对修饰词。',
        examples: [
          [
            'The city plans to obtain more electricity from renewable energy sources.',
            '该市计划从可再生能源获取更多电力。',
          ],
        ],
      },
      {
        id: 'reduce-emissions',
        title: '排放的减少与控制',
        pattern: 'reduce / curb emissions',
        read: 'curb emissions 是遏制排放。',
        explain: 'emissions 常用复数表示排放物或排放量；reduce 不说明已完全消除，仍需看幅度。',
        next: '找到排放来源 → 读减排幅度 → 不把降低等同于零排放。',
        examples: [
          [
            'The policy is intended to curb emissions from public buildings.',
            '这项政策旨在遏制公共建筑的排放。',
          ],
        ],
      },
      {
        id: 'carbon-footprint',
        title: '活动造成的碳排放影响',
        pattern: 'reduce a carbon footprint',
        read: 'carbon footprint 指活动相关的碳排放影响。',
        explain: 'footprint 在这里不是实际脚印；讨论措施时应说明减少哪类活动的排放。',
        next: '识别活动对象 → 找减少排放的具体方式 → 避免空泛结论。',
        examples: [
          [
            'The university is reviewing ways to reduce the carbon footprint of campus travel.',
            '大学正在审查减少校园出行碳足迹的方法。',
          ],
        ],
      },
      {
        id: 'waste-disposal',
        title: '废物如何处理',
        pattern: 'waste disposal / dispose of waste',
        read: 'dispose of waste 是处理废物。',
        explain:
          '动词 dispose 在此需接 of；disposal 是名词，可以说 waste disposal，不写 dispose waste。',
        next: '判断使用名词还是动词 → 动词保留 of → 核对处理对象。',
        examples: [
          [
            'The laboratory has strict procedures for disposing of chemical waste.',
            '实验室有严格的化学废物处置流程。',
          ],
        ],
      },
      {
        id: 'conserve-water',
        title: '节约有限资源',
        pattern: 'conserve water / water conservation',
        read: 'conserve water 是节约用水。',
        explain: '侧重减少浪费、维持资源；不只是把水放进某个容器储存。',
        next: '找节约对象和措施 → 区分 conserve 与 store → 核对用途。',
        examples: [
          [
            'The building uses rainwater to conserve drinking water.',
            '这栋建筑使用雨水以节约饮用水。',
          ],
        ],
      },
      {
        id: 'soil-erosion',
        title: '土壤流失及其控制',
        pattern: 'soil erosion / prevent erosion',
        read: 'soil erosion 表示土壤受到侵蚀而流失。',
        explain: '不是 soil pollution 的污染；同一环境措施可能针对不同问题，需按材料找目标。',
        next: '认清侵蚀还是污染 → 找发生过程 → 对应防治措施。',
        examples: [
          [
            'The researchers measured soil erosion on slopes with different vegetation cover.',
            '研究人员测量了不同植被覆盖坡面的土壤侵蚀情况。',
          ],
        ],
      },
      {
        id: 'food-chain',
        title: '食物链中的关系',
        pattern: 'a link in the food chain',
        read: 'a link 指食物链中的一环。',
        explain:
          'chain 强调连续关系，food web 是更复杂的食物网；不要把一个物种的影响限定为只涉及自身。',
        next: '找物种在关系中的位置 → 顺着材料追踪上下游 → 不补造生态结论。',
        examples: [
          [
            'The passage describes the role of insects in the food chain.',
            '文章说明了昆虫在食物链中的作用。',
          ],
        ],
      },
      {
        id: 'adaptation-environment',
        title: '生物适应与特征作用',
        pattern: 'an adaptation to / adapt to conditions',
        read: 'an adaptation to dry conditions 是对干燥环境的适应特征。',
        explain: '这里 adaptation 可指有助适应的特征，不一定是有意识的行为计划。',
        next: '先找环境压力 → 再找对应特征 → 避免把生物写成主动设计自己。',
        examples: [
          [
            'The thick leaves are described as an adaptation to dry conditions.',
            '这些厚叶被描述为适应干燥条件的特征。',
          ],
        ],
      },
      {
        id: 'geographic-distribution',
        title: '物种或现象分布在哪里',
        pattern: 'geographic distribution / be distributed across',
        read: 'distribution 表示分布，而非此处的商品分发。',
        explain: 'across 后是范围；widespread 表示分布广，不等于每一处数量都多。',
        next: '先定位地理范围 → 分开分布广度与局部数量 → 核对证据。',
        examples: [
          [
            'The map shows the geographic distribution of the species.',
            '地图显示了这一物种的地理分布。',
          ],
        ],
      },
      {
        id: 'seasonal-variation',
        title: '随季节改变的模式',
        pattern: 'seasonal variation / seasonal changes',
        read: 'seasonal variation 表示季节性变化。',
        explain: '它不必然表示长期增长；阅读图表时要区分反复周期和跨年的长期趋势。',
        next: '先找周期长度 → 判断重复变化还是长期方向 → 再概括。',
        examples: [
          [
            'The study tracks seasonal variation in water availability.',
            '研究追踪了可用水量的季节性变化。',
          ],
        ],
      },
      {
        id: 'sediment-layers',
        title: '从沉积层读取过去线索',
        pattern: 'layers of sediment / sediment deposits',
        read: 'layers of sediment 表示多层沉积物。',
        explain: 'layer 是可数层，sediment 常作不可数物质；不要把 deposit 的沉积义读成押金。',
        next: '认清自然过程语境 → 识别层与物质 → 找材料据此作出的推断。',
        examples: [
          [
            'The team analyzed layers of sediment collected from the lake.',
            '团队分析了从湖中采集的多层沉积物。',
          ],
        ],
      },
      {
        id: 'geological-process',
        title: '长期自然过程如何塑造地形',
        pattern: 'geological processes / shape the landscape',
        read: 'shape the landscape 表示塑造地形。',
        explain: 'shape 作动词表示形成或改变，不只指外形这个名词；要看句中的动作关系。',
        next: '找到过程主语 → 把 shape 读成动作 → 追踪形成的结果。',
        examples: [
          [
            'The lecture explains how geological processes shape the landscape.',
            '讲座解释了地质过程如何塑造地形。',
          ],
        ],
      },
    ],
  },
  {
    id: 'technology',
    title: '科技、媒体与信息',
    group: '托福场景',
    description: '学术讨论、访谈和科技类阅读常用：信息质量、技术应用、隐私、数字获取与沟通方式。',
    topics: [
      {
        id: 'reliable-information',
        title: '信息可信度与来源',
        pattern: 'a reliable source / reliable information',
        read: 'a reliable source 是可靠来源。',
        explain:
          'reliable 修饰信息质量或来源可信度，不等于 merely recent 的新近；两种要求可同时存在。',
        next: '找作者、证据与时间 → 区分可靠与新近 → 再决定可否采用。',
        examples: [
          [
            'Students should compare information from several reliable sources.',
            '学生应比较多个可靠来源的信息。',
          ],
        ],
      },
      {
        id: 'verify-accuracy',
        title: '核实内容是否准确',
        pattern: 'verify the accuracy of',
        read: 'verify the accuracy 是核实准确性。',
        explain: 'verify 强调通过核查确认，不是只重复别人说法；accuracy 后用 of 引出所核实内容。',
        next: '先定位待核实信息 → 查原始依据 → 再作结论。',
        examples: [
          [
            'The editor checked the original data to verify the accuracy of the report.',
            '编辑核对原始数据，以验证报告准确性。',
          ],
        ],
      },
      {
        id: 'spread-information',
        title: '传播信息与传播错误信息',
        pattern: 'disseminate information / spread misinformation',
        read: 'misinformation 指错误信息，不自动说明传播者故意撒谎。',
        explain: 'information 通常不可数；disseminate 较正式，spread 可用于更广泛传播场景。',
        next: '检查信息真假与传播意图是否都有证据 → 不把错误直接归为蓄意。',
        examples: [
          [
            'The campaign aims to prevent the spread of misinformation.',
            '这项活动旨在防止错误信息传播。',
          ],
        ],
      },
      {
        id: 'data-privacy',
        title: '保护个人数据',
        pattern: 'protect personal data / data privacy',
        read: 'data privacy 关乎个人数据的使用与控制。',
        explain: 'privacy 不等同于 cybersecurity；系统未被攻击也可能存在不当使用数据的问题。',
        next: '先看泄露风险还是使用权限 → 选具体表达 → 不混同所有信息问题。',
        examples: [
          [
            'Users should know how their personal data will be used.',
            '用户应知道其个人数据将如何使用。',
          ],
        ],
      },
      {
        id: 'unauthorized-access',
        title: '未获授权的访问',
        pattern: 'prevent unauthorized access to',
        read: 'unauthorized access 指未经许可的访问。',
        explain: 'access 作名词时常接 to；作动词则直接接对象，如 access files。',
        next: '辨认名词或动词 → 检查 to 是否需要 → 找授权对象。',
        examples: [
          [
            'The system is designed to prevent unauthorized access to student records.',
            '系统旨在防止未经授权访问学生记录。',
          ],
        ],
      },
      {
        id: 'digital-divide',
        title: '不同群体的数字条件差距',
        pattern: 'bridge / narrow the digital divide',
        read: 'digital divide 表示设备、网络或相关能力方面的差距。',
        explain: 'bridge/narrow 指缩小差距，不只指增加设备总量；仍要看谁能实际使用。',
        next: '找处于不利地位的群体 → 核查获取条件 → 判断差距是否缩小。',
        examples: [
          [
            'Public internet access can help narrow the digital divide.',
            '公共网络接入有助于缩小数字鸿沟。',
          ],
        ],
      },
      {
        id: 'automate-tasks',
        title: '让重复工作自动完成',
        pattern: 'automate routine tasks',
        read: 'routine tasks 表示常规重复任务。',
        explain: 'automate 是使自动化，不必然消除所有人工判断；讨论影响时要说明哪些任务改变。',
        next: '圈定自动化任务 → 找仍需人的部分 → 不扩大为全部工作消失。',
        examples: [
          [
            'The software automates routine tasks so staff can focus on complex cases.',
            '软件自动处理常规任务，让员工专注于复杂情况。',
          ],
        ],
      },
      {
        id: 'process-data',
        title: '处理、分析与存储数据',
        pattern: 'process / analyze / store data',
        read: 'process data 是处理数据，未必已经解释结果。',
        explain: 'store 侧重保存，analyze 侧重分析；三步职责不同，阅读过程说明时要分开。',
        next: '按输入、保存、处理、解释排序 → 核对动词对应步骤。',
        examples: [
          ['The device stores raw data for later analysis.', '设备保存原始数据，以供后续分析。'],
        ],
      },
      {
        id: 'adopt-technology',
        title: '决定采用与实际实施',
        pattern: 'adopt a technology / implement a system',
        read: 'adopt 强调采用，implement 强调落实。',
        explain: '正式决定采用不等于已完成部署；implementation 是实施过程的名词。',
        next: '分清决定、实施与完成 → 对照时间线 → 不把计划当成结果。',
        examples: [
          [
            'The school adopted the policy last year but implemented it this term.',
            '学校去年采纳了该政策，但本学期才实施。',
          ],
        ],
      },
      {
        id: 'user-friendly',
        title: '方便使用与容易学习',
        pattern: 'a user-friendly interface / ease of use',
        read: 'user-friendly 表示对使用者友好、易于操作。',
        explain: '这是可用性评价，不直接说明系统更安全或功能更强，不能跨维度推断。',
        next: '找到评价维度 → 区分易用、安全与功能 → 保留原文范围。',
        examples: [
          [
            'A user-friendly interface can reduce the time needed for training.',
            '易于使用的界面可以减少培训所需时间。',
          ],
        ],
      },
      {
        id: 'technical-difficulty',
        title: '技术问题与中断的原因',
        pattern: 'technical difficulties / a system outage',
        read: 'technical difficulties 泛指技术问题，outage 指服务中断。',
        explain: '技术问题不必然让系统完全停用；要看是否存在替代入口或部分功能。',
        next: '找故障范围 → 区分不便与全面中断 → 关注恢复安排。',
        examples: [
          [
            'The seminar started late because of technical difficulties.',
            '研讨会因技术问题而推迟开始。',
          ],
        ],
      },
      {
        id: 'backward-compatible',
        title: '升级后能否使用旧版本资源',
        pattern: 'backward compatible with',
        read: 'backward compatible 表示向后兼容。',
        explain: '特指新系统能支持较旧资源，不等于旧系统能运行全部新功能；方向要清楚。',
        next: '标新旧版本 → 检查哪方支持哪方 → 避免反向推断。',
        examples: [
          [
            'The update is backward compatible with earlier file formats.',
            '此次更新兼容较早的文件格式。',
          ],
        ],
      },
      {
        id: 'real-time',
        title: '实时信息与延迟信息',
        pattern: 'in real time / real-time feedback',
        read: 'in real time 表示几乎随事件同步。',
        explain: '作名词前修饰语用 real-time，如 real-time data；不是“真实的时间”与虚假时间之别。',
        next: '判断是修饰动作还是名词 → 选 in real time 或 real-time → 核对含义。',
        examples: [
          [
            'The display allows students to observe changes in real time.',
            '显示屏让学生能够实时观察变化。',
          ],
        ],
      },
      {
        id: 'remote-access',
        title: '远程访问与现场使用',
        pattern: 'remote access to / access…remotely',
        read: 'remote access 指无需身处现场即可访问。',
        explain: '远程可用不代表公开免费；仍可能需要账号和许可。',
        next: '先确定是否需到现场 → 再看权限条件 → 不把 remote 当 unrestricted。',
        examples: [
          [
            'Registered students have remote access to the database.',
            '已注册学生可以远程访问数据库。',
          ],
        ],
      },
      {
        id: 'information-overload',
        title: '信息过多妨碍处理',
        pattern: 'information overload / filter information',
        read: 'information overload 表示信息超出有效处理能力。',
        explain: '不是信息不足；解决方式可能是筛选与组织，而不是单纯增加来源数量。',
        next: '先判过量还是缺失 → 找筛选机制 → 检查方案是否对应问题。',
        examples: [
          [
            'Clear categories can help users deal with information overload.',
            '清晰的分类有助于用户应对信息过载。',
          ],
        ],
      },
      {
        id: 'face-to-face',
        title: '沟通方式与互动质量',
        pattern: 'face-to-face interaction / communicate online',
        read: 'face-to-face interaction 指面对面交流。',
        explain: '方式本身不保证交流质量；讨论优劣要结合即时反馈、出行和任务需要。',
        next: '先比较同一任务下的两种方式 → 给出具体影响 → 不写绝对优劣。',
        examples: [
          ['Online tools can complement face-to-face interaction.', '在线工具可以补充面对面交流。'],
        ],
      },
    ],
  },
  {
    id: 'society',
    title: '教育、工作与社会',
    group: '托福场景',
    description: '讨论写作、访谈和学术阅读中的常见议题搭配；用具体对象和因果补足观点，避免空话。',
    topics: [
      {
        id: 'equal-opportunity',
        title: '机会平等与实际结果',
        pattern: 'equal opportunities / equal access to',
        read: 'equal access to education 表示享有平等的教育获取机会。',
        explain: '机会平等不等于结果必然相同；论证时应说明障碍是什么，措施如何减少障碍。',
        next: '区分机会与结果 → 指明具体障碍 → 再解释方案。',
        examples: [
          [
            'The policy aims to provide equal access to educational resources.',
            '政策旨在让人们平等获取教育资源。',
          ],
        ],
      },
      {
        id: 'higher-education',
        title: '高等教育与学业深造',
        pattern: 'pursue higher education',
        read: 'pursue higher education 表示接受或继续高等教育。',
        explain: 'higher education 是教育阶段概念，不是单说教学质量更高；通常不加 a。',
        next: '先判断教育阶段还是质量 → 用准确表达 → 核对限定范围。',
        examples: [
          [
            'Financial support can help more students pursue higher education.',
            '经济支持可以帮助更多学生接受高等教育。',
          ],
        ],
      },
      {
        id: 'critical-thinking',
        title: '评估论点的能力',
        pattern: 'develop critical thinking skills',
        read: 'critical thinking 指分析和评估依据的能力。',
        explain: 'critical 在此不等于挑剔或批评所有人；需通过比较证据等具体活动说明。',
        next: '说清学生怎样分析证据 → 再连接能力提升 → 避免只喊口号。',
        examples: [
          [
            'Comparing conflicting explanations can develop critical thinking skills.',
            '比较相互冲突的解释可以培养批判性思维能力。',
          ],
        ],
      },
      {
        id: 'independent-learning',
        title: '主动组织自己的学习',
        pattern: 'independent learning / take responsibility for',
        read: 'take responsibility for learning 表示对学习承担主动责任。',
        explain: '不意味着永远不能求助；自主性与寻求反馈可以并存。',
        next: '指出自己规划或检查的环节 → 保留适当求助 → 说明实际收益。',
        examples: [
          [
            'Independent learning requires students to monitor their own progress.',
            '自主学习要求学生监控自己的进度。',
          ],
        ],
      },
      {
        id: 'learning-outcomes',
        title: '学习后能达到什么',
        pattern: 'learning outcomes / achieve an outcome',
        read: 'learning outcomes 指学完后能够展示的知识或能力。',
        explain: '与 activities 的学习活动不同；完成一次活动不自动证明学会了目标技能。',
        next: '区分做了什么与学会什么 → 找可观察表现 → 再评价效果。',
        examples: [
          [
            'The course defines clear learning outcomes for each module.',
            '课程为每个模块设定了明确的学习成果要求。',
          ],
        ],
      },
      {
        id: 'hands-on',
        title: '通过实际操作获得经验',
        pattern: 'hands-on experience / practical experience',
        read: 'hands-on experience 表示亲自实践的经验。',
        explain:
          'experience 表经历时可数，表经验时通常不可数；此处不写 a hands-on experience 来泛指经验总量。',
        next: '先判经验还是某次经历 → 检查可数性 → 举出具体实践。',
        examples: [
          [
            'The placement gives students hands-on experience with laboratory equipment.',
            '这项实习让学生获得实验设备操作经验。',
          ],
        ],
      },
      {
        id: 'acquire-skills',
        title: '技能的获得与迁移',
        pattern: 'acquire / develop / transfer skills',
        read: 'acquire skills 是掌握技能，transfer skills 是迁移运用。',
        explain: '学会一项技能与能在新情境使用是两步；讨论培训价值时可具体说明迁移场景。',
        next: '先说获得哪项技能 → 再举使用场景 → 核对因果联系。',
        examples: [
          [
            'Group projects help students develop skills they can use in the workplace.',
            '小组项目帮助学生培养可用于工作场所的技能。',
          ],
        ],
      },
      {
        id: 'job-prospects',
        title: '就业机会的总体前景',
        pattern: 'improve job prospects',
        read: 'job prospects 指获得工作的前景。',
        explain: '改善前景不等于保证某份工作；prospects 通常用复数，不只是某一个招聘空缺。',
        next: '分清总体机会与具体职位 → 保留可能性 → 给出提升原因。',
        examples: [
          [
            "Relevant work experience may improve graduates' job prospects.",
            '相关工作经验可能改善毕业生的就业前景。',
          ],
        ],
      },
      {
        id: 'work-life',
        title: '工作与个人生活的协调',
        pattern: 'achieve a work-life balance',
        read: 'work-life balance 指工作和个人生活之间的平衡。',
        explain: '不一定是时间均分；可通过减少通勤、调整时段等说明改善机制。',
        next: '指出具体冲突 → 提出调整方式 → 检查是否兼顾双方。',
        examples: [
          [
            'Flexible schedules can help employees achieve a better work-life balance.',
            '灵活安排可以帮助员工更好地平衡工作与生活。',
          ],
        ],
      },
      {
        id: 'labor-market',
        title: '供求与就业变化',
        pattern: 'the labor market / demand for workers',
        read: 'labor market 指劳动力市场。',
        explain: 'demand for workers 是雇主需求，不是求职者数量；两方变化方向要分清。',
        next: '先找雇主还是求职者 → 区分岗位需求与劳动力供给 → 再读变化。',
        examples: [
          [
            'The report examines changes in demand for workers in the local labor market.',
            '报告考察了当地劳动力市场对员工需求的变化。',
          ],
        ],
      },
      {
        id: 'allocate-resources',
        title: '给不同目标分配资源',
        pattern: 'allocate resources to / for',
        read: 'allocate resources to a project 表示向项目分配资源。',
        explain: '资源可包括钱、人力或时间；应说明分配依据，不能只把 allocate 翻成“增加”。',
        next: '找总资源与去向 → 判断重新分配还是新增 → 核对目的。',
        examples: [
          [
            'The council allocated more resources to maintaining public parks.',
            '市议会为公共公园维护分配了更多资源。',
          ],
        ],
      },
      {
        id: 'economic-growth',
        title: '经济增长与持续发展',
        pattern: 'stimulate economic growth',
        read: 'stimulate growth 表示促进增长。',
        explain: '促进不保证每个人收入都提高；经济总量、分配与个人福利是不同判断。',
        next: '找指标范围 → 不从整体直接推及所有个体 → 检查支持材料。',
        examples: [
          [
            'The proposal aims to stimulate economic growth through local investment.',
            '提议旨在通过当地投资促进经济增长。',
          ],
        ],
      },
      {
        id: 'cost-living',
        title: '日常生活费用水平',
        pattern: 'the cost of living / living expenses',
        read: 'cost of living 是生活成本水平。',
        explain: 'living expenses 指实际生活支出；物价水平与某个人花费有关但不完全相同。',
        next: '区分整体成本与个人账单 → 找比较时间地点 → 保持指标一致。',
        examples: [
          [
            'Rising living expenses have made it harder for students to save money.',
            '生活支出上升使学生更难存钱。',
          ],
        ],
      },
      {
        id: 'population-density',
        title: '人口总量与单位面积密度',
        pattern: 'population density / a densely populated area',
        read: 'population density 是单位面积人口数量。',
        explain: '人口多不必然密度高，还要看面积；densely populated 强调分布集中。',
        next: '先看总人数还是密度 → 检查面积因素 → 再比较地区。',
        examples: [
          [
            'The study compares transport needs in areas with different population densities.',
            '研究比较了不同人口密度地区的交通需求。',
          ],
        ],
      },
      {
        id: 'cultural-heritage',
        title: '保护历史文化传承',
        pattern: 'preserve cultural heritage',
        read: 'cultural heritage 指传承下来的文化遗产。',
        explain: '可包含建筑、传统或技艺，不只指旅游景点；要以材料范围为准。',
        next: '找被保护的具体内容 → 区分物质与传统 → 解释保护目的。',
        examples: [
          [
            'The program supports efforts to preserve local cultural heritage.',
            '该项目支持保护当地文化遗产的工作。',
          ],
        ],
      },
      {
        id: 'social-cohesion',
        title: '群体之间的联系与凝聚',
        pattern: 'strengthen social cohesion / foster a sense of community',
        read: 'a sense of community 表示社区归属和联系感。',
        explain: 'cohesion 强调群体联系，不等于所有人意见相同；用共同活动等说明机制。',
        next: '找建立联系的活动 → 说明参与如何发生 → 不把凝聚等同于无分歧。',
        examples: [
          [
            'Shared public spaces may strengthen social cohesion.',
            '共享公共空间可能增强社会凝聚力。',
          ],
        ],
      },
    ],
  },
  {
    id: 'fixed-expressions',
    title: '易混词与固定句式',
    group: '核心搭配',
    description: '补词、组句和表达检查：相近词义与不同后接结构要分清，尤其注意动作方向和实际含义。',
    topics: [
      {
        id: 'pay-attention',
        title: '关注、重视与保持联系',
        pattern: 'pay attention to；attach importance to；keep in touch with',
        read: 'pay attention to 是“注意”，这里 pay 不是付款。',
        explain:
          'pay attention to 是固定结构，其中 to 是介词，后面接名词或 -ing。attach importance to 表“重视”，keep in touch with 表“与……保持联系”；不要省去词组内部的介词。',
        next: '看到抽象词组 → 找完整边界 → 若 to 后接动作，检查 -ing；联系对象前检查 with。',
        examples: [
          [
            'Pay attention to checking the units in each calculation.',
            '注意核对每次计算中的单位。',
          ],
          ['I keep in touch with my former classmates.', '我与以前的同学保持联系。'],
        ],
      },
      {
        id: 'between-among',
        title: 'between / among：具体关系与群体内部',
        pattern: 'between A and B；among students；among the options',
        read: 'among students 是“在学生群体中”，between 指可区分对象之间的关系。',
        explain:
          'between 不只适用于两个对象，三个或更多明确对象之间的分别关系也可用。among 常把对象看作一个群体。不要仅凭数量机械选择。',
        next: '描述“之间” → 判断是分别对应的关系还是群体内部 → 选择 between / among，再写全连接结构。',
        examples: [
          [
            'The agreement between the three departments improved coordination.',
            '三个部门之间的协议改善了协调。',
          ],
          ['The café is popular among students.', '这家咖啡馆在学生中很受欢迎。'],
        ],
      },
      {
        id: 'it-structure',
        title: '用 it 引出评价和所需时间',
        pattern: 'It is + 形容词 + for 人 + to do；It takes 人 时间 to do',
        read: 'It is important to… 表“做……很重要”；it 先占住主语位置。',
        explain:
          '真正评价的是后面的动作。for 指动作执行者；kind、careless 等评价人的行为品格时常用 of，如 It was kind of you to help。takes 后别漏 to do。',
        next: '句首不方便放长动作 → 考虑 it 结构 → 核对形容词是在评价事情还是人，并检查 for / of。',
        examples: [
          [
            'It is important for students to keep a copy of their work.',
            '学生保留作业副本很重要。',
          ],
          ['It takes me twenty minutes to walk to campus.', '我步行到校园需要二十分钟。'],
        ],
      },
      {
        id: 'be-about-to',
        title: '即将发生与一般计划',
        pattern: 'be about to do',
        read: 'was about to submit the form 表示“当时正要提交表格”。',
        explain: '强调眼前即将发生，不适合泛指遥远计划；后文可能说明动作被打断。',
        next: '先定时间距离 → 判断是否紧接发生 → 留意后续是否改变。',
        examples: [
          [
            'I was about to submit the form when I noticed an error.',
            '我正要提交表格时，注意到一处错误。',
          ],
        ],
      },
      {
        id: 'be-bound-to',
        title: '很可能或势必发生',
        pattern: 'be bound to do',
        read: 'bound to cause… 表示很可能或势必造成。',
        explain: '这里 bound 不是被绑住；语气通常强于 may，应根据证据谨慎使用。',
        next: '认出整段推测结构 → 比较语气强度 → 不无依据地写成必然。',
        examples: [
          ['A sudden change is bound to cause some confusion.', '突然改变很可能造成一些困惑。'],
        ],
      },
      {
        id: 'end-up',
        title: '过程最后导致什么',
        pattern: 'end up doing / end up with',
        read: 'ended up spending 表示最终花了时间，常与原计划不同。',
        explain: '动作接 -ing，结果名词接 with；不能写 end up to spend。',
        next: '找最终结果 → 选 doing 或 with + 名词 → 对照最初计划。',
        examples: [
          [
            'We ended up spending more time on the revisions than on the first draft.',
            '我们最终花在修改上的时间比写初稿还多。',
          ],
        ],
      },
      {
        id: 'resort-to',
        title: '其他办法不行才采用',
        pattern: 'resort to + 名词/-ing',
        read: 'resort to borrowing 表示不得不转而借用。',
        explain: '常带退而求其次的意味，to 是介词；与中性的 choose 不完全等义。',
        next: '找前面方案为何不可行 → 识别最后手段 → 检查 to doing。',
        examples: [
          [
            'The team had to resort to borrowing equipment from another department.',
            '团队不得不转而向另一个系借设备。',
          ],
        ],
      },
      {
        id: 'raise-rise',
        title: '使某物上升与自行上升',
        pattern: 'raise + 宾语 / rise 不带宾语',
        read: 'raise prices 是提价，prices rise 是价格上涨。',
        explain: 'raise 的过去式是 raised；rise 的过去式 rose、过去分词 risen，不能混用。',
        next: '检查后面有无宾语 → 选 raise/rise → 再核对过去形式。',
        examples: [
          [
            'The supplier raised its prices after transport costs rose.',
            '运输成本上涨后，供应商提高了价格。',
          ],
        ],
      },
      {
        id: 'consist-comprise',
        title: '整体由哪些部分构成',
        pattern: 'consist of / be composed of / comprise',
        read: 'consists of three stages 表示“由三个阶段组成”。',
        explain:
          'consist of 用主动形式，不说 is consisted of；be composed of 是被动结构。comprise 可直接接组成部分，不必加 of。',
        next: '先标出整体和部分 → 选择完整结构 → 检查介词与主动被动。',
        examples: [
          [
            'The assessment consists of three stages with different purposes.',
            '评估由三个目的不同的阶段组成。',
          ],
        ],
      },
      {
        id: 'economic-economical',
        title: '经济方面与节省开支',
        pattern: 'economic / economical',
        read: 'economic growth 是经济增长；economical 是省钱、省资源。',
        explain: '两词都与经济有关但修饰对象不同；economic policy 不等于节约的政策。',
        next: '先问宏观经济还是节省资源 → 选 economic/economical → 核对搭配。',
        examples: [
          [
            'Shared equipment may be more economical for small research teams.',
            '共用设备对小型研究团队可能更节省开支。',
          ],
        ],
      },
      {
        id: 'historic-historical',
        title: '有历史意义与涉及历史',
        pattern: 'historic / historical',
        read: 'historical records 是历史记录，historic event 是有重大历史意义的事件。',
        explain: '并非所有过去事件都值得称 historic；要看强调时代资料还是重大意义。',
        next: '区分“有关历史”与“具有历史意义” → 再选形容词。',
        examples: [
          [
            'Historical records provide information about changes in land use.',
            '历史记录提供了土地使用变化的信息。',
          ],
        ],
      },
      {
        id: 'sensible-sensitive',
        title: '合乎情理与容易受影响',
        pattern: 'sensible / sensitive to',
        read: 'sensible 是明智合理，sensitive 是敏感或易受影响。',
        explain: 'sensitive equipment 指敏感设备，不是聪明设备；形似不代表意义接近。',
        next: '看对象是决定还是感受/反应能力 → 选词 → sensitive 后核对 to。',
        examples: [
          [
            'The sensors are sensitive to small changes in temperature.',
            '传感器对微小温度变化很敏感。',
          ],
        ],
      },
      {
        id: 'eventually-possibly',
        title: '最终与可能完全不同',
        pattern: 'eventually / possibly',
        read: 'eventually 表示最后终于发生。',
        explain: '它强调经过一段时间后的结果，不表示“可能”；possibly 才降低确定性。',
        next: '判断在说时间结果还是不确定性 → 选对应副词 → 检查语义。',
        examples: [
          ['The team eventually found a workable solution.', '团队最终找到了可行的解决办法。'],
        ],
      },
      {
        id: 'amount-number',
        title: '量、数量与不可数名词',
        pattern: 'an amount of / a number of',
        read: 'an amount of equipment 是设备的量，a number of devices 是若干设备。',
        explain:
          'equipment、research、evidence 通常不可数；表达数量可用 pieces of equipment 或 studies 等具体单位。',
        next: '认清中心名词是否可数 → 选 amount/number 或单位词 → 检查复数。',
        examples: [
          [
            'The project generated a large amount of useful information.',
            '项目产生了大量有用信息。',
          ],
        ],
      },
      {
        id: 'preserve-conserve',
        title: '保持原状与节约使用',
        pattern: 'preserve / conserve',
        read: 'preserve records 是保存记录，conserve energy 是节约能源。',
        explain: '含义可在自然保护语境重叠，但不能在所有宾语前任意交换。',
        next: '先问保留状态还是避免消耗 → 选动词 → 核对常见宾语。',
        examples: [
          [
            "The archive preserves records, while the building's design conserves energy.",
            '档案馆保存记录，而建筑设计有助于节能。',
          ],
        ],
      },
      {
        id: 'ensure-assure',
        title: '确保结果与向人保证',
        pattern: 'ensure that… / assure 人 that…',
        read: 'ensure 表确保，assure 表向某人保证。',
        explain: 'assure 通常有接收保证的人作宾语；ensure 后接事项或从句，不按同样方式直接接人。',
        next: '先确定保证结果还是安抚对象 → 选择结构 → 核对人的位置。',
        examples: [
          [
            'The coordinator assured us that the system would ensure equal access.',
            '协调员向我们保证，系统会确保平等访问。',
          ],
        ],
      },
    ],
  },
];
