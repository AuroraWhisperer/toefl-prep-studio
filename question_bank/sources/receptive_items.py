"""Original grouped reading/listening material; consumed only by the bank builder."""

CLOZE_PASSAGES = [
    (
        "Urban trees",
        'Trees can change the climate of a city street in several ways. They {{reduce}} local {{temperatures}} by {{providing}} shade {{and}} releasing {{water}} through {{their}} leaves {{during}} the {{hottest}} part {{of}} each {{day}}. However, the benefits depend on where trees are planted and how much water is available. A narrow street may remain shaded for hours, while an open square receives direct sunlight. City planners therefore consider both the shape of the surrounding buildings and the needs of each species before choosing a planting site.',
    ),
    (
        "Learning and memory",
        'Remembering a fact immediately after reading it does not guarantee that the memory will last. Researchers {{compare}} different {{methods}} of {{learning}} by {{asking}} people {{to}} recall {{information}} after {{several}} days {{rather}} than {{testing}} them {{immediately}}. One useful method is to attempt an answer before looking at the original material again. Although this effort can feel harder than rereading, it may strengthen later access to the information. The benefit is greatest when learners also receive feedback that helps them correct their mistakes.',
    ),
    (
        "Soil and rainfall",
        'Healthy soil contains spaces through which both air and water can move. When {{heavy}} vehicles {{cross}} wet {{ground}}, these {{spaces}} become {{smaller}} and {{water}} moves {{more}} slowly {{through}} the {{soil}} beneath {{plants}}. As a result, rain may collect on the surface instead of reaching plant roots. The problem is not always visible during dry weather, so farmers sometimes test how quickly water enters a small sample. Limiting traffic to permanent tracks can protect the remaining field, although recovery may also require roots and soil organisms to rebuild its structure.',
    ),
]

# Each item is (question, four options, correct index, explanation).
DAILY_PASSAGES = [
    (
        "Library equipment notice",
        "From Monday, students may borrow recording equipment from the library's media desk. "
        "First-time borrowers must complete a fifteen-minute online orientation before collecting equipment. "
        "Reservations may be made before the orientation is completed, but equipment will not be released until the completion record appears in the system. "
        "Allow up to one working day for that record to update. Returning borrowers do not need to repeat the orientation.",
        [
            ("A first-time borrower needs a recorder on Friday morning. What is the best plan?",
             ["Finish the orientation by Wednesday and reserve a recorder for Friday.", "Complete the orientation while collecting the recorder on Friday.", "Reserve a recorder and complete the orientation after returning it.", "Ask a returning borrower to submit an orientation record."], 0,
             "读懂：“orientation”是借用前的入门培训；“up to one working day”指记录更新最多要一个工作日。题目要你安排首次借用者周五早上顺利取机。\n解析：取机必须等本人完成培训的记录入库，所以周三前完成、预约周五，能留出周四更新。周五取机时才学可能来不及；还机后再学不满足领取条件；请老用户提交记录不能替代自己的培训。\n下次：遇到取用设备的安排题，把预约、完成培训、记录更新、领取按先后排好，再从需要领取的时间往前留足等待期。"),
            ("What is the main purpose of the notice?",
             ["To announce that reservations are no longer necessary.", "To explain how to qualify to borrow recording equipment.", "To compare online and in-person orientations.", "To ask experienced borrowers to renew their training."], 1,
             "读懂：“qualify to borrow”是达到借用条件；“Returning borrowers”指以前借过的人。题目问整则通知主要想告诉学生什么。\n解析：全文围绕谁需培训、何时能预约和何时可领取展开，所以主旨是说明借录音设备的资格和流程。文中没有取消预约，也没有比较线上与现场培训；老用户不用重学，恰好否定了要求他们重新培训的说法。\n下次：通知主旨题先把各条规定归到同一件事上。本题的培训、预约、更新记录都服务于“怎样借到设备”，不要只抓某一条例外。"),
        ],
    ),
    (
        "Email from a course coordinator",
        "Subject: Friday field visit\nThe field visit will go ahead despite the forecast of light rain. "
        "Meet at the south gate at 8:40, ten minutes earlier than originally planned. "
        "The bus must use a longer route because the bridge is closed. Bring waterproof shoes; lunch is provided. "
        "If you cannot attend, email me by Thursday noon so I can adjust the meal order. "
        "You will complete a short observation exercise on campus instead.",
        [
            ("Why has the meeting time changed?",
             ["The rain is expected to begin earlier.", "Students must complete an exercise before leaving.", "The journey will take longer than usual.", "Lunch must be collected before departure."], 2,
             "读懂：“ten minutes earlier”是提前十分钟；“a longer route”是更长的路线。题目问集合为何改早，而不是问活动是否取消。\n解析：桥关闭迫使大巴绕远路，路程更长，因此要提前集合。小雨只与活动照常举行有关，并未说会提早下；校园观察练习是缺席者的替代任务；午餐会提供，但没有先取餐的安排。\n下次：问时间改变的原因时，把“改早或改晚”与后面的原因句连起来；不要把同封邮件里的天气、午餐或其他任务都当作原因。"),
            ("What can be inferred about students who miss the visit?",
             ["They must arrange their own transport.", "They will still have a related assignment.", "They must pay for an unused lunch.", "They can attend another visit on Thursday."], 1,
             "读懂：“cannot attend”指不能参加，“instead”指改做另一件事。题目问缺席考察的学生仍需做什么。\n解析：邮件说不能去的人要在校园完成简短观察练习，可推出他们仍有相关作业。没有要求自找交通、支付未吃的午餐，也没有安排周四补考察；“Thursday noon”只是通知老师缺席的截止时间。\n下次：看到“instead”就找清楚“原本做什么、现在改做什么”；再区分通知截止日与活动日期，别把报备时间读成补办时间。"),
        ],
    ),
    (
        "Messages about a student exhibition",
        "Maya, 10:05: The printer says our posters can be ready on Wednesday, but only if we send the final files by four today.\n"
        "Leo, 10:09: My figures are done. I am waiting for Dr. Chen to approve the captions.\n"
        "Maya, 10:12: Could you send the layout now? The printer can check the dimensions while we wait for the captions.\n"
        "Leo, 10:14: Good idea. I will mark the captions as provisional so nobody prints that version.",
        [
            ("What does Maya suggest doing immediately?",
             ["Printing the posters without captions.", "Asking the printer to move the deadline.", "Seeking approval for the figures.", "Sending the layout for a size check."], 3,
             "读懂：“layout”是版面，“dimensions”是尺寸，“captions”是图注。题目问 Maya 建议现在马上做哪一步。\n解析：图注还等老师批准，但可以先发版面让印刷方检查尺寸，所以应选先发送版面做尺寸检查。她没要求无图注直接印刷，也没要求推迟截止时间；图形已完成，等待批准的是图注，不是重新审批图形。\n下次：多人消息中先锁定题目点名的人，再把“现在能做的”和“还要等待的”分开。本题检查尺寸可以先行，最终印刷不能。"),
            ("In the messages, 'provisional' most nearly means",
             ["suitable for publication.", "written by an expert.", "subject to later changes.", "missing from the layout."], 2,
             "读懂：“provisional”在这里是暂定、以后可能改；“approve the captions”是批准图注。题目要根据消息判断这个词的意思。\n解析：图注还没获批，Leo 又标明该版本不能拿去印，说明它不是最终稿，因此选“以后可能修改”。不是已可出版，也没说由专家撰写；标成暂定并不等于图注从版面里消失了。\n下次：判断版本状态的词时，前看是否获批，后看能否正式使用。“还在等批准＋不要印这一版”共同指向暂定，不是缺失。"),
        ],
    ),
    (
        "Workshop registration",
        "Research Data Workshop — Saturday, 10:00–12:00\n"
        "The workshop is free for current students and costs $15 for visitors. "
        "Register by Wednesday to receive the preparation files. Participants should bring a laptop with the free software already installed. "
        "Six loan laptops are available; request one when registering. "
        "If the workshop fills, people on the waiting list will be contacted in order when places become available. "
        "Being on the list does not guarantee a seat.",
        [
            ("What should a student without a laptop do?",
             ["Request a loan device during registration.", "Pay the visitor fee to reserve equipment.", "Collect a device after the workshop starts.", "Join the waiting list for the preparation files."], 0,
             "读懂：“loan laptops”是可借用的笔记本电脑；“when registering”是报名时。题目问没有电脑的学生应该采取什么行动。\n解析：通知明确说有六台借用电脑，要在报名时申请。访客的十五美元是参加费，不是设备预留费；文中没说开课后再领就行；候补名单等的是参加名额，不是准备文件。\n下次：缺设备的安排题要同时找“提供什么”与“何时申请”。把费用、材料领取和参加名额分开，别用解决另一种问题的办法来代替借设备。"),
            ("What does the notice say about the waiting list?",
             ["Everyone on it receives a seat by Wednesday.", "It is reserved for visitors who have paid.", "It gives priority to people bringing laptops.", "Offers depend on vacancies and position on the list."], 3,
             "读懂：“waiting list”是候补名单，“when places become available”是有空位时。题目问排入名单后能否、怎样获得参加名额。\n解析：有空位才按排队顺序联系，所以能否入选取决于空位和排位。名单不保证周三前人人有位；周三是获取准备文件的报名期限。也没说只收付费访客，或自带电脑者优先。\n下次：候补题分别检查“触发条件”和“先后顺序”：本题先有空位，再按排位通知。列入名单只获得等待机会，不等于已经确认参加。"),
        ],
    ),
    (
        "Housing office update",
        "The east entrance to Willow Hall will close for repairs from September 8 through September 12. "
        "Residents should use the courtyard entrance. Deliveries will be held at the neighboring Maple Hall desk, where staff can release parcels between 9 a.m. and 7 p.m. "
        "Please bring your student ID; a delivery notification alone is insufficient. "
        "The courtyard ramp will remain open throughout the work. We will send another message if the reopening date changes.",
        [
            ("Why might a resident be unable to collect a parcel?",
             ["The courtyard ramp is closed.", "They have a notification but no student ID.", "The parcel was delivered before September 8.", "They live in Willow rather than Maple Hall."], 1,
             "读懂：“a delivery notification alone is insufficient”是只有到货通知还不够；“student ID”是学生证。题目问哪种情况可能导致领不到包裹。\n解析：取件明确要带学生证，所以只有通知、没有学生证的人不符合要求。庭院坡道仍开放；没说九月八日前送达的包裹不能取；住 Willow 的人本来就应到邻楼 Maple 领件，不是只有 Maple 住户能领。\n下次：找办事条件时把“在哪里办”和“必须带什么”分开；看到“alone is insufficient”，就继续找还缺的必要凭证。"),
            ("What can residents conclude about September 12?",
             ["All deliveries will stop on that date.", "The housing office will definitely send an update.", "It is the planned final day of repairs.", "Only the courtyard ramp will reopen then."], 2,
             "读懂：“through September 12”包含九月十二日；“if the reopening date changes”是如果重新开放日期改变。题目问十二日是什么性质的日期。\n解析：原定关闭维修到十二日，所以这是计划中的维修最后一天，而非绝对保证。包裹仍由邻楼代收，不是那天停止投递；只有日期变化才另发消息；坡道始终开放，无需等到十二日重开。\n下次：日期题先分清“原计划”和“有变化才通知”的条件。结束日、重开日和通知日不是同一回事，不能把条件句读成必定发生。"),
        ],
    ),
]

ACADEMIC_PASSAGES = [
    (
        "Reading the past through pollen",
        "A lake can preserve a history of the plants that once grew around it. Each year, pollen grains settle on the water and sink into the mud. "
        "As new sediment accumulates, older layers become buried. By extracting a narrow column of this sediment, researchers can compare pollen from different periods. "
        "The outer walls of many pollen grains resist decay, and their distinctive shapes often allow identification of the plant families that produced them.\n\n"
        "Interpreting this record, however, requires more than counting grains. A tree that releases enormous quantities of wind-carried pollen may appear more prominent in a sample than a nearby plant whose pollen is transported mainly by insects. "
        "Furthermore, some grains travel long distances before reaching the lake. The sample therefore represents a mixture of local and regional vegetation, rather than a precise inventory of plants at the shore.\n\n"
        "To address these limitations, researchers compare modern pollen samples with known vegetation and examine other evidence, such as seeds and charcoal. "
        "If a decline in forest pollen coincides with increased charcoal, fire may have contributed to the change. "
        "Yet a single match cannot establish a complete explanation. Reliable reconstructions emerge when several independent clues support the same interpretation.",
        [
            ("What is the main purpose of the passage?",
             ["To argue that pollen records are less useful than written histories.", "To describe a method for studying past vegetation and explain its limits.", "To show why lakes contain more plant species than surrounding forests.", "To compare the rates at which different sediments accumulate."], 1,
             "读懂：“past vegetation”指过去生长的植物，“limits”指方法不能准确说明的地方。题目问全文写作目的，不是某一段的细节。\n解析：文章先讲从湖泥花粉了解过去，再讲花粉数量和来源会造成偏差，最后用其他证据补充，故选介绍研究方法及其局限。没有与文字历史比优劣，也没比较湖泊和森林的物种数量，更没重点研究沉积速度。\n下次：主旨题给各段各写一个短标签。本题是“怎样研究—哪里不准—怎样补证”，能覆盖这条线的选项才是全文目的。"),
            ("Why are pollen grains useful for identifying past plants?",
             ["Their quantities directly indicate the number of trees.", "They remain close to the plants that released them.", "Their shapes change predictably as they become older.", "Their durable outer walls can retain recognizable shapes."], 3,
             "读懂：“resist decay”是不容易腐烂，“distinctive shapes”是可辨认的独特形状。题目问花粉为什么能帮助辨认过去的植物。\n解析：外壁耐腐烂，使花粉保存下来；不同形状又让研究者识别其来源，所以选坚固外壁可保留可辨形状。数量不直接等于树的数量，花粉也可能飞很远；文中未说形状会随年龄有规律地变化。\n下次：解释材料“为何有用”时，把“能保存”与“能识别”两步接起来；不要把后文指出的数量和距离局限当成优点。"),
            ("The word 'prominent' in paragraph 2 is closest in meaning to",
             ["strongly represented.", "recently introduced.", "carefully preserved.", "widely separated."], 0,
             "读懂：“prominent”在这里指样本中显得突出、占得多；“enormous quantities”是数量非常大。题目要判断花粉样本中这个词的意思。\n解析：某种树放出大量随风传播的花粉，样本里就可能比附近虫媒植物更显眼，因此选“在样本中体现得很多”。这不表示刚引进、保存得特别细心，也不表示彼此相隔很远；这些都解释不了前面的数量比较。\n下次：词义题先问“什么原因让它显得如此”。这里是花粉多带来样本占比大，再把候选意思放回这个因果关系检查。"),
            ("What can be inferred about a plant pollinated mainly by insects?",
             ["Its pollen always decays faster than tree pollen.", "It cannot grow close to a lake.", "Its local abundance may be underestimated from lake pollen alone.", "It will be easier to identify than a wind-pollinated plant."], 2,
             "读懂：“pollinated mainly by insects”指主要靠昆虫传粉；“underestimated”是估得比实际少。题目问只看湖中花粉，会怎样误判这种植物的数量。\n解析：大量随风传播的花粉更容易在样本里突出，虫媒植物即使在附近也可能不显眼，因此其实际数量可能被低估。文中没有比较腐烂速度或辨认难度，也没有说它不能长在湖边。\n下次：推断样本是否偏少时，把“当地有多少”与“有多少进入样本”分开；进入湖里的花粉少，不一定代表附近植物少。"),
            ("Why does the author discuss charcoal?",
             ["To illustrate evidence that can support an interpretation of pollen changes.", "To suggest that fires preserve all pollen equally well.", "To explain why sediment cores are difficult to extract.", "To demonstrate that every forest decline is caused by fire."], 0,
             "读懂：“charcoal”是木炭残留；“may have contributed”是可能起了作用，不是已经证明。题目问作者举木炭这个例子有什么作用。\n解析：森林花粉减少时若木炭增多，火灾便可能是原因，说明其他证据能支持对花粉变化的解释。不是说火能同样保存所有花粉，也不是解释取样困难；作者还强调单一吻合不够，不能推出森林减少全由火灾造成。\n下次：例子作用题前看它支持哪种方法，后看作者保留了什么限制。本题要保留“支持一种可能”，不能升级成“证明唯一原因”。"),
        ],
    ),
    (
        "When a useful measurement changes behavior",
        "Organizations often rely on measurements to judge progress. A library, for example, might count the number of books borrowed each month. "
        "This measure is inexpensive to collect and can reveal changes in demand. Problems arise, however, when improving the measure becomes more important than the purpose it was intended to represent.\n\n"
        "Imagine that a library rewards staff solely for increasing loans. Staff might promote short, popular books while spending less time helping readers locate specialized material. "
        "The loan count could rise even if the library became less useful to students conducting difficult research. "
        "This would not necessarily mean that employees were dishonest: they might simply be responding rationally to the incentive they had been given.\n\n"
        "The example does not show that measurement should be abandoned. Without records, managers may overlook declining services or allocate resources poorly. "
        "Instead, a useful approach combines several indicators, such as loans, successful research consultations, and readers' experiences. "
        "Each remains imperfect, but their weaknesses may differ. A sudden increase in one indicator accompanied by a decline in another can prompt investigation.\n\n"
        "Measurements are therefore most informative when treated as evidence requiring interpretation. They become less reliable when a single number is expected to stand in for a complex goal.",
        [
            ("Which statement best expresses the author's main argument?",
             ["Libraries should stop recording borrowing statistics.", "Staff incentives are always harmful to public services.", "Simple measurements are more reliable than reader interviews.", "Organizations should interpret several measures in relation to their goals."], 3,
             "读懂：“measurements”是用来评价表现的数据，“goals”是机构真正想达到的目标。题目问作者对使用数据的总体主张。\n解析：借阅量上升不一定说明服务更好，所以应结合咨询效果、读者体验等多种指标，看它们是否服务于目标。作者并未主张停止统计，也没说奖励总有害；更没说简单数字比读者反馈可靠。\n下次：读观点题时分清作者反对“完全不用”还是“只看一个”。本题先承认统计有用，再反对单一数字代替复杂目标，答案要同时保留这两面。"),
            ("According to the passage, why might staff promote short, popular books?",
             ["Those books provide the best support for specialized research.", "Doing so could improve the indicator on which staff are rewarded.", "Readers have asked staff to stop offering consultations.", "The cost of recording other books is too high."], 1,
             "读懂：“rewards staff solely for increasing loans”是只按借阅量增长奖励员工。题目问他们为什么可能推荐短而热门的书。\n解析：这类书有助于增加借阅次数，从而提高拿奖励所依据的数字，所以推荐行为是在响应奖励办法。并不是这些书最适合专业研究；文中没说读者要求停止咨询，也没说记录其他书的成本太高。\n下次：问员工为何选择某种做法，先找奖励依据，再看哪种行为最能提高那个数字；不要把“能增加考核分数”误当成“最能满足读者需求”。"),
            ("What does 'their weaknesses' in paragraph 3 refer to?",
             ["The limitations of the different indicators.", "The mistakes made by library employees.", "The preferences of readers doing research.", "The shortages in the library's resources."], 0,
             "读懂：“their weaknesses”是“它们的不足”；“indicators”是借阅量、咨询成效等评价指标。题目问这里的“它们”指什么。\n解析：前面刚列出几种指标，接着说每种都不完美，但不足之处可能不同，因此指不同指标的局限。不是员工犯的错、研究型读者的喜好或图书馆资源短缺；这些都不是此处被逐一比较的对象。\n下次：找代指对象时，先看上一句在逐个谈谁，再把该名称代回去读。本题“每种指标不完美—各指标的不足不同”能连成完整意思。"),
            ("Why does the author mention that employees may not be dishonest?",
             ["To deny that employees respond to rewards.", "To suggest that loan records are inaccurate.", "To distinguish an incentive problem from intentional misconduct.", "To show that managers understand every staff decision."], 2,
             "读懂：“dishonest”是不诚实，“incentive”是促使人行动的奖励办法。题目问作者为何特意说员工未必不诚实。\n解析：员工可能只是按借阅量奖励制度办事，数字虽上升，研究服务却变差；作者在区分制度引导不当和个人故意违规。不是否认奖励影响行为，也没说借阅记录造假，更没说管理者了解员工的每个决定。\n下次：看到“未必是某原因”，继续找作者给的替代解释。本题从“人品问题”转向“奖励导向问题”，不能把结果不好直接等同于故意作假。"),
            ("Which situation would most clearly warrant investigation under the proposed approach?",
             ["Borrowing and successful consultations both increase.", "Loan counts rise while readers report difficulty finding research help.", "Staff collect the same indicators for several months.", "Readers borrow a mixture of popular and specialized books."], 1,
             "读懂：“warrant investigation”是值得进一步调查；“while”在该选项中表示两种情况同时发生却形成反差。题目要找多种指标互相矛盾的例子。\n解析：借阅量增加，读者却说难获研究帮助，说明数字好看但服务可能变差，正该调查。借阅和咨询都增加没有这种反差；连续收集同样数据本身不异常；热门书和专业书都有人借也未显示问题。\n下次：遇到多指标判断题，给每项变化标出“变好”或“变差”；一好一坏时再追问，好看的总数是否掩盖了实际需求。"),
        ],
    ),
]

RESPONSE_ITEMS = [
    ("Could you send me the revised lab schedule this afternoon?",
     ['I sent you the earlier schedule last week.', 'Sure, as soon as the coordinator confirms it.', 'The coordinator wants a report about yesterday’s experiment.', 'You can revise the report after tomorrow’s lab.'], 1,
     "读懂：“revised lab schedule”是修改后的实验安排；对方问能否今天下午发给他，要选能回应这项请求的话。\n解析：“Sure”表示同意，后面说协调人确认后马上发，既接下请求又说明条件。上周发过旧安排不等于会发新版；协调人要实验报告、明天实验后改报告，都把所需文件从安排表换成了报告。\n下次：听发送文件的请求，先记“发什么、要哪个版本”，再听答复是否同意或提出条件。别因回复重复了实验、协调人等词就当作答应。"),
    ("The seminar room is on the third floor, isn't it?",
     ['The seminar lasted three hours.', 'Three people booked that room.', 'Actually, it moved to the second floor.', 'The next seminar starts tomorrow.'], 2,
     "读懂：“third floor”是三楼；句末“isn't it?”相当于“对吧？”。对方在核实研讨室的楼层，要选确认或纠正地点的回复。\n解析：“Actually”引出纠正：地点已搬到二楼，直接回答了楼层问题。讲座持续三小时是在说时长，三个人订房是在说人数，明天开始是在说日期；它们都没告诉对方该去几楼。\n下次：听到数字先给它加上单位：楼层、小时还是人数。本题需要的是楼层，即使回复也出现“三”，单位不对就没有答到问题。"),
    ("I was hoping to join the study group, but I have a shift at six.",
     ["We could meet earlier if that helps.", "There were six people last week.", "I thought the test went quite well.", "The group studies in the library."], 0,
     "读懂：“join the study group”是参加学习小组，“a shift at six”是六点要上班。对方想参加却有时间冲突，需要能回应这个困难的话。\n解析：提议“meet earlier”，即早点见面，可以让他在上班前参加，因此最贴切。上周有六个人只重复了数字；考试考得不错是另一件事；说在图书馆学习只给地点，没有调整时间。\n下次：遇到“我想参加，但……”先抓住后半句的障碍，再找能消除它的建议。时间冲突要用改时间回应，不是补充人数或地点。"),
    ("The printer is out of paper again.",
     ['I’ll replace the empty cartridge.', 'Try printing the same file in color instead.', 'You can collect your paper after the seminar.', "I'll check the supply cupboard."], 3,
     "读懂：“out of paper”是纸用完了，“supply cupboard”是存放用品的柜子。对方在说打印机缺纸，要选有助于解决缺纸的回复。\n解析：去用品柜看看，是寻找可补充的纸。换空墨盒解决的是没墨，不是没纸；改成彩色打印仍需要纸；讲座后取论文把“paper”理解成要领取的文章，也没回应打印机当前的问题。\n下次：听设备故障先确认缺的是哪种耗材，再匹配解决办法。纸、墨盒和文件都可能与打印有关，但不能彼此替代。"),
    ("Would you rather review the chapters now or after lunch?",
     ['I reviewed those chapters yesterday.', 'After lunch would work better for me.', 'Lunch costs about ten dollars.', 'The review was published yesterday.'], 1,
     "读懂：“Would you rather”是在问“你更愿意哪一种”；“now or after lunch”让人选现在还是午饭后复习。\n解析：“After lunch would work better for me.”表示午饭后更合适，明确选了一个时间。昨天复习过只说明过去的事，没有回答这次何时合适；午餐价格答非所问；已发表的评论文章把“review”理解成了另一种事物。\n下次：遇到两个时间供选择，先在心里列出这两个时间，再找表达偏好的回复。重复“复习”这个词但不选时间，不如直接说明哪时方便。"),
    ("Do you happen to know whether Friday's office hours were canceled?",
     ['Friday’s lecture covers that topic.', 'The office needs your cancellation form by Friday.', "Let me check the professor's message.", 'I canceled my reservation for the meeting room.'], 2,
     "读懂：“office hours”在这里是教授接待学生答疑的时段，不是办公室营业时间；“were canceled”是被取消了。对方想核实周五是否还答疑。\n解析：说去查教授的消息，提供了确认取消与否的途径，能回应问题。周五讲什么不是答疑安排；办公室要取消表格和取消会议室预约，都换成了别的取消事项。\n下次：确认消息的问句不一定只能用“是”或“不是”回答；提出向相关负责人或其通知核实，也合适。先认清到底是哪项活动可能取消。"),
    ("I can't locate the article, even though I have its title.",
     ['You’ll need a title before you publish it.', 'The article should be submitted by Friday afternoon.', 'You can include that title in your presentation.', "Have you tried searching by the author's name?"], 3,
     "读懂：“locate the article”是找到那篇文章，“even though”是虽然、尽管。对方已有标题却仍找不到文章，需要搜索方面的帮助。\n解析：问是否试过按作者姓名查找，提供了不同于标题的新检索线索。发表文章前要有标题、周五前提交文章、把标题放进展示，都没有帮助找到这篇已有的文章。\n下次：听求助时分清“找资料”和“写或交资料”。再检查对方已经试过什么，优先选能补充新线索的建议，而不是重复他已知的信息。"),
    ("Would you mind checking these citations before I submit the report?",
     ['Not at all. Send me the draft.', 'Yes, my report was submitted yesterday afternoon.', 'The citations belong at the end, not before the title.', 'I can explain how the experiment was conducted.'], 0,
     "读懂：“citations”是报告里的引用信息；“Would you mind”是在客气地问“你介意帮忙吗？”。对方想请人提交前检查引用。\n解析：“Not at all”是不介意，即愿意帮忙；接着让对方发草稿，说明确实接下了检查任务。说自己的报告已交、引用该放哪里或可以解释实验，都没有答应检查这份报告。\n下次：听这种请求，不要把“不介意”误听成“不愿意”。把回复换成中文“没关系，把稿子发我”，再判断后续行动是否对应所求的帮助。"),
    ("It looks as though the field trip will go ahead after all.",
     ['So we should cancel, then.', 'But the trip has already taken place.', "Great, I'll pack my waterproof jacket.", 'Right, so they still haven’t made any decision.'], 2,
     "读懂：“go ahead after all”是原本有疑虑，但最终还是会进行；“field trip”是实地考察。对方带来行程将继续的消息。\n解析：说要收拾防水外套，是接受消息并准备出行。说应该取消与继续进行相反；说仍未决定没有接住这个新进展；说考察已经结束又把将来要去的事误当成过去。\n下次：活动消息题先判断现在状态是“取消、待定、将举行还是已结束”，再匹配回复。这里的“after all”提示结果更新，不能沿用先前可能取消的想法。"),
    ("I think I left my notebook in the seminar room.",
     ['The seminar finishes at five.', "Let's check before the room is locked.", 'You’ll need a notebook to take seminar notes.', 'The seminar notes are due before next Friday.'], 1,
     "读懂：“left my notebook”在这里是把笔记本落下了，不是把笔记写完了。对方怀疑它在研讨室，需要找回东西。\n解析：提议趁房间还没锁去检查，既回应失物也给出能立即做的事。讲座五点结束没有提出寻找办法；提醒记笔记需要本子只是常识；笔记作业下周五到期则是另一项任务。\n下次：听到“我可能把某物落在某处”，优先找查看地点、取回物品的回复；关于这个物品用途或相关课程时间的话，不等于帮忙寻物。"),
    ("The online form keeps rejecting my student number.",
     ['Did you include the letters at the beginning?', 'The student numbers were announced at the ceremony.', 'You can reject applications after reviewing the results.', 'The form asks how many students attended yesterday.'], 0,
     "读懂：“keeps rejecting my student number”是表单一直不接受输入的学号；“letters at the beginning”是开头的字母。对方需要排查填写问题。\n解析：问是否把开头字母输进去，是检查学号是否完整，并不武断认定这就是原因。仪式上公布学号、审核后拒绝申请都换了事件；询问来了多少学生，又把学号错当成学生人数。\n下次：表单报错题先锁定出错字段，再找检查输入内容或格式的回复。本题应检查完整学号，而不是因听到“number”就转去统计人数。"),
    ("You wouldn't have a spare calculator, would you?",
     ['Yes, the calculation is correct.', 'Your student card lets you borrow books.', 'The spare room is available.', 'Yes, you can borrow this one.'], 3,
     "读懂：“spare calculator”是多余可用的计算器；整句委婉地问“你有没有一个能借我的？”，不是在核对计算答案。\n解析：“Yes, you can borrow this one.”明确表示有，而且可以借，正好满足需求。计算结果正确没有回答是否有计算器；学生证可以借书换了物品；有空房间则把“spare”用到了无关的对象上。\n下次：听“你有没有多余的……”时，先找对方想借的具体东西，再判断回复是否提供它。别被相近词“计算”与“计算器”或同一个形容词带走。"),
    ("The doors open at five-thirty, but the talk doesn't start until six.",
     ["The speaker talked for thirty minutes.", "Then let's arrive a little early to get seats.", "I didn't open the classroom door.", "Six students are giving talks."], 1,
     "读懂：“doors open at five-thirty”是五点半开放入场；“doesn't start until six”是直到六点才开讲。要选利用这段时间安排的合理回复。\n解析：提议早些到场找座位，符合可以提前入场的消息。五点半到六点的半小时是等待时间，并非演讲持续时间；说自己没开教室门不回应安排；六点是时刻，不是六名演讲者。\n下次：听两个时间时分别标注“开放入场”和“正式开始”，再判断中间能做什么。不要把时间差当活动时长，也不要把钟点当人数。"),
    ("I've finished entering the data, so it's over to you.",
     ['I’ll enter those figures again.', 'So I should wait until you finish entering it.', "Thanks. I'll begin the analysis now.", 'Thanks; that means our analysis has already been completed.'], 2,
     "读懂：“entering the data”是录入数据；“it's over to you”是“下面交给你了”。对方已完成自己的步骤，要选接手后续工作的回复。\n解析：说现在开始分析，承接已录好的数据，符合交接。再录一次是重复前一步；继续等录入结束忽略了“finished”；认为分析也已完成，则把录入与分析混成了同一步。\n下次：听工作交接，用“已完成—轮到谁—接下来做什么”三格记信息。某一步结束只允许推进下一步，不表示整个项目都做完了。"),
    ("Could we meet by video instead of in the office?",
     ["That works. I'll send you a link.", 'I’ll meet you outside the office.', 'We watched it at yesterday’s meeting.', 'The video shows our old office.'], 0,
     "读懂：“by video”是通过视频通话见面，“instead of”是改用前一种来代替后一种。对方提议不去办公室，改开视频会议。\n解析：“That works”表示这样可以，接着说发链接，是接受并落实视频会面。办公室外见仍是线下；昨天看过视频是在回顾过去；视频展示旧办公室是在说影片内容，都没有回应新的会面方式。\n下次：改安排的请求先分清改的是时间、地点还是方式。本题改变的是线上或线下，回复需要接受或商量这种方式，而不是只提到视频这个词。"),
    ("I'd keep that sample out of direct sunlight if I were you.",
     ["I collected it yesterday morning.", "The sunlight was brighter last week.", "We used a different sample before.", "Good point. I'll move it into the cupboard."], 3,
     "读懂：“if I were you”是“如果我是你，我会……”，用来提建议；“out of direct sunlight”是避免阳光直射。对方建议换个地方存放样本。\n解析：说把样本移进柜子，接受了避光建议并给出行动。昨天采集的时间、上周阳光更强、以前用过别的样本，都没有处理眼下样本会被直晒的问题。\n下次：听建议时先提取“应该做什么或避免什么”，再找与之相符的行动。这里要避免直晒，不是讨论太阳强弱或样本的采集历史。"),
    ("This map must be older than we thought; the footbridge isn't on it.",
     ["The bridge is made of wood.", "We should check the current route online.", "I thought the walk was enjoyable.", "The map fits into my pocket."], 1,
     "读懂：“footbridge”是步行桥；“older than we thought”是比原以为的更旧。地图没标出桥，说明路线信息可能过时，要选有助于核实的回复。\n解析：到网上查当前路线，能补查旧图可能漏掉的信息。桥是木制的只谈材质，散步愉快只谈感受，地图能放进口袋只谈大小，都无法确认现在该怎么走。\n下次：当导航资料与现实不符时，优先找更新或核对路线的办法。地图易携带、景点有趣都不能证明信息仍有效，网上资料也应核实是否为当前路线。"),
]

CONVERSATIONS = [
    (
        "An internship application",
        "Student: My internship application still says incomplete, although I uploaded the form yesterday.\n"
        "Advisor: Did your supervisor sign it electronically?\n"
        "Student: She signed the paper copy, and I scanned that. I assumed it was enough.\n"
        "Advisor: Usually it is, but your placement is outside the university. For external placements, the supervisor also confirms the dates through a separate link.\n"
        "Student: Oh, she may have missed that email. Should I upload everything again?\n"
        "Advisor: No, the documents look fine. Ask her to check her inbox, including the junk folder. Once she confirms, the status should update automatically.\n"
        "Student: I'll contact her now, then.",
        [
            ("Why is the application incomplete?", ["The student forgot to scan a signed form.", "The placement dates have not been confirmed through the link.", "The advisor has rejected the outside placement.", "The uploaded documents are in the wrong format."], 1,
             "读懂：incomplete 是手续未齐，不一定是文件错误。校外实习要 supervisor（主管）通过 a separate link（另一条链接）确认日期，纸质签名不能替代这一步。\n解析：校外实习还要求 supervisor 通过 “a separate link” 确认日期，所以已上传签字扫描件仍可能显示 incomplete。顾问明确说 “the documents look fine”，排除了漏扫签名和文件格式错误，也没有否决实习。\n下次：状态异常题先分清“文件已交”和“额外确认已完成”。听到 Usually（通常）后仍要留意本人的特殊条件，按对方指出的缺项补办，不把整个流程重做。"),
            ("What will the student most likely do next?", ["Upload all the documents again.", "Choose a different supervisor.", "Ask the supervisor to find and respond to an email.", "Visit the university's internship office."], 2,
             "读懂：inbox 是收件箱，junk folder 是垃圾邮件夹。学生说要立刻联系主管，是请她找出确认邮件并回应，不是自己重新提交文件。\n解析：顾问让主管查 “inbox, including the junk folder”，学生随即说 “I'll contact her now”，因此下一步是请主管找到邮件并完成确认。顾问已否定重新上传，换主管或亲自去办公室也不是这项安排。\n下次：问下一步，结合对方最后的指示和本人接下来的承诺；写清“谁去联系谁、要对方完成什么”，别把先前已被否定的提议当最终决定。"),
        ],
    ),
    (
        "A workshop location",
        "Student: Is tomorrow's statistics workshop still in the computer lab?\n"
        "Coordinator: It has moved to Room 214. The lab's network is being upgraded.\n"
        "Student: Does that mean we need to bring laptops? I don't own one.\n"
        "Coordinator: Yes, but we have a few loan machines. I'll reserve one for you. Please arrive fifteen minutes early so we can check your account.\n"
        "Student: I thought the workshop started at four. Has that changed too?\n"
        "Coordinator: Four is still correct. Just come at three forty-five for the equipment. The worksheet will be printed, so you won't need to download it beforehand.",
        [
            ("What caused the room change?", ["A network upgrade in the lab.", "A shortage of printed worksheets.", "An increase in workshop attendance.", "A change in the workshop topic."], 0,
             "读懂：network is being upgraded 是网络正在升级，说明原电脑教室暂不能按计划使用，因此换到另一个房间。\n解析：搬到 Room 214 后紧接着解释 “The lab's network is being upgraded”，直接给出了换教室的原因。讲义会印好，但不是搬迁原因；人数增加和主题变更也未提到。\n下次：原因题把“发生了什么变化”和“紧接着给的理由”配对。后面有关设备、讲义、时间的安排是应对办法，不自动是变化的原因。"),
            ("Why should this student arrive at 3:45?", ["The workshop now begins earlier.", "All participants must print their worksheets.", "The coordinator will demonstrate the network.", "A loan computer and account need to be checked."], 3,
             "读懂：loan machines 是借给学生用的电脑，check your account 是检查账户。学生需三点四十五分到场准备，但活动仍四点开始。\n解析：协调员先答应预留 “loan machines”，再要求提前到场 “check your account”，所以三点四十五分是为借用电脑和账户检查留时间。“Four is still correct” 排除了开课提前，讲义也无需学生现场打印。\n下次：出现两个时间，分别标成“准备时间”和“正式开始”。再核对题目问的是这个学生为什么早到，不要把个人设备安排推广成所有人的新开课时间。"),
        ],
    ),
    (
        "Choosing a source",
        "Student: I need information about river formation for a first-year project. This geology book seems very technical.\n"
        "Librarian: It assumes you've already studied advanced chemistry. Try the environmental science guide on the next shelf.\n"
        "Student: Will that be detailed enough? My instructor wants us to explain one process, not just define it.\n"
        "Librarian: The guide has a chapter on how rivers change course, with diagrams and a case study. Start there, then use its references if you need more detail.\n"
        "Student: That sounds manageable. Can I borrow it today?\n"
        "Librarian: Certainly. The diagrams are also available through the library website.",
        [
            ("Why does the librarian recommend the guide?", ["It is the only book available to borrow.", "It can replace the student's project instructions.", "It explains a relevant process at an accessible level.", "It contains more advanced chemistry than the first book."], 2,
             "读懂：advanced chemistry 是高等化学，原书要求这种基础；指南有 diagrams（图示）和 case study（案例），能把项目所需的河流过程讲得更易懂。\n解析：原书需要 “advanced chemistry” 基础，而推荐的指南用 “diagrams and a case study” 讲河流改道，既切合项目又让学生觉得 “manageable”。推荐理由不是内容更高深、只有这本能借，也不是让它替代作业要求。\n下次：推荐理由要同时满足“讲什么”和“难度是否适合”。本题需要解释一个过程，既不能只给定义，也不是越高深越好；看推荐材料怎样回应这两项需求。"),
            ("What does the librarian suggest if more detail is needed?", ["Changing the project to a chemistry topic.", "Consulting sources listed in the guide.", "Copying the diagrams without reading.", "Waiting until the advanced course begins."], 1,
             "读懂：references 在书籍语境里是参考文献，不是一般的“提及”。馆员建议先读指南，不够详细时再查它引用的其他资料。\n解析：“use its references if you need more detail” 明确要求沿指南的参考文献继续查资料。不是换成化学项目、只抄图示，也不用等到修读高级课程。\n下次：听到 if（如果）先记触发条件，再记条件满足后的动作。本题是“仍需细节→查参考文献”，别把辅助步骤误听成换题或放弃当前材料。"),
        ],
    ),
    (
        "A club decision",
        "Student: Sorry I missed the start of the meeting. Have we chosen the theme for next month's debate?\n"
        "Officer: We've narrowed it to two, but we want members who couldn't attend to have a say.\n"
        "Student: So are we meeting again tomorrow?\n"
        "Officer: No, the vote will be on the club message board until nine tonight. Read the short descriptions first; one proposal changed quite a bit during the discussion.\n"
        "Student: I saw the original list this morning. I'd better check again.\n"
        "Officer: Exactly. We'll announce the result tomorrow and only then invite speakers who work on the selected topic.",
        [
            ("Why should the student reread the proposals?", ["One proposal has been revised.", "The voting deadline has been extended.", "The officer removed both original topics.", "Invited speakers have already selected a theme."], 0,
             "读懂：original list 是最初的清单；changed quite a bit 是改动不少。早上看过旧方案，不等于了解讨论之后的新方案。\n解析：“one proposal changed quite a bit” 说明其中一案在讨论中已有较大修改，早上看过 “original list” 也需重读。不是两个主题都被撤下；延期投票和嘉宾已定主题都没有依据。\n下次：有“看过但仍要再看”的提醒，优先找材料是否更新。比较旧版与最新版，不要默认重复阅读就是因为自己遗漏，或把其他日程变化当原因。"),
            ("What will happen after the vote?", ["Members will repeat the discussion in person.", "The message board will close for repairs.", "Speakers will be invited for the chosen topic.", "The debate will take place immediately."], 2,
             "读懂：only then 是“只有那之后才”。先投票并宣布主题，再邀请该主题的 speakers（嘉宾），不是立刻举行下个月的辩论。\n解析：“announce the result tomorrow and only then invite speakers” 明确规定先确定主题，再邀请相关嘉宾。不是再开会重复讨论或立即辩论，辩论原定在下个月。\n下次：按时间词排出“投票→宣布结果→邀请嘉宾”。题目问哪一步随后发生，就选流程中的对应动作，不把准备环节与正式活动混在一起。"),
        ],
    ),
    (
        "A project meeting",
        "Student: My project partner suggested Wednesday evening, but I work until eight. I don't want to hold everyone up.\n"
        "Advisor: Could you use Thursday's open studio? The design computers will be available then.\n"
        "Student: That could work. We need the software for our model, and my laptop can't run it.\n"
        "Advisor: Reserve a workstation today. Entry to the studio doesn't guarantee access to a computer.\n"
        "Student: I was going to book a meeting table, so I'm glad you mentioned that.\n"
        "Advisor: You can book both through the same page. A table is useful for discussion, but the workstation is what your project really needs.",
        [
            ("What concern does the student express at first?", ["The model is already overdue.", "A work shift conflicts with the proposed meeting.", "The partner refuses to use the studio.", "The advisor has canceled office hours."], 1,
             "读懂：work until eight 是工作到八点；hold everyone up 是耽误大家，不是举起别人。学生担心周三工作班次会与伙伴提出的会面冲突。\n解析：伙伴建议 “Wednesday evening”，学生却 “work until eight”，所以最初担心的是工作班次与会面冲突，拖慢大家进度。模型已逾期、伙伴拒用工作室和取消答疑时间都未出现。\n下次：问 at first（起初）时回到开头，不用后面出现的软件或预约问题替换最初的担忧。把双方时间摆在一起，看冲突在哪里。"),
            ("What does the advisor emphasize?", ["A table reservation includes a computer.", "The student must purchase a new laptop.", "The studio is closed on Thursday evenings.", "A workstation must be reserved separately from entry."], 3,
             "读懂：entry 是入场资格，workstation 是电脑工作位。doesn't guarantee 表示“不保证”：能进工作室或订到桌子，都不等于已经预订到电脑。\n解析：“Entry to the studio doesn't guarantee access to a computer” 强调能入场不等于有电脑，项目所需的 workstation 必须另行预订。会议桌不会附送电脑，也没有要求买新笔记本或说周四工作室关闭。\n下次：预约题把“场地入场、桌子、设备”分开核对。项目需要运行软件，就检查是否明确拿到电脑工作位，而不是只完成一个名字相近的预约。"),
        ],
    ),
]

ANNOUNCEMENTS = [
    (
        "Building access",
        "Attention, library visitors. The north elevator will be out of service from noon until two while technicians replace its control panel. "
        "The south elevator will remain available, but it can only be reached through the ground-floor reading room. "
        "Signs will direct you along that route. If you need help carrying materials, please ask at the information desk. "
        "We expect normal service to resume at two; any delay will be posted at both elevator entrances.",
        [
            ("What is the main purpose of the announcement?", ["To introduce new borrowing rules.", "To warn that the entire library is closing.", "To explain temporary access arrangements.", "To recruit assistants for the information desk."], 2,
             "读懂：out of service 是暂停使用，remain available 是仍可使用。只有北电梯中午到两点维修，通知说明这段时间怎样从阅览室绕到南电梯。\n解析：北侧电梯暂时 “out of service”，南侧则 “remain available”，通知重点是维修期间如何改道通行。只有部分设施暂不可用，并非整个图书馆关闭，也不是新借阅规则或招聘通知。\n下次：通知主旨先找受影响设施、影响时段和替代办法。若主要篇幅是绕行与求助，就概括为临时通行安排，不把局部停用扩大成整栋关闭。"),
            ("What should someone needing assistance with materials do?", ["Ask at the information desk.", "Wait by the north elevator until noon.", "Call the technicians working upstairs.", "Leave the materials outside the building."], 0,
             "读懂：help carrying materials 是帮忙搬运资料；information desk 是咨询台。通知已明确指定需要搬运帮助的人去哪里求助。\n解析：需要 “help carrying materials” 的人被明确要求 “ask at the information desk”，所以应去咨询台求助。技术人员负责维修，等待北侧电梯或把材料留在室外都不是通知给出的做法。\n下次：服务通知题用“需要什么帮助→找哪个岗位”定位。不要只选离故障最近的人；技术人员修电梯，并不等于负责所有访客需求。"),
        ],
    ),
    (
        "Farmers' market",
        "This Saturday's campus farmers' market will take place on the library plaza instead of in the courtyard. "
        "The move gives more vendors access to electricity for refrigerated products. "
        "The usual opening time, nine o'clock, has not changed. Reusable bags are encouraged, and the first fifty customers bringing one will receive a small voucher. "
        "Please keep the library entrance clear. Bicycle parking will be available behind the plaza, where volunteers can point you toward the stalls.",
        [
            ("Why is the market moving?", ["The library has changed its opening hours.", "Vendors need better access to electrical power.", "More bicycle parking is required in the courtyard.", "Customers requested an earlier opening time."], 1,
             "读懂：electricity 是电力，refrigerated products 是需冷藏的商品。新地点能让更多商贩接电，这才是搬迁集市的原因。\n解析：“more vendors access to electricity for refrigerated products” 把搬迁原因直接连到冷藏商品的供电需求。九点开市并未改变，自行车停车位置只是配套信息，不是迁址原因。\n下次：先找 move（迁移）后面的原因句，再把开门时间、优惠和停车安排单独记成配套信息。题目问为什么换地方，不是问新地点还有什么便利。"),
            ("Who is eligible for a voucher?", ["Every vendor selling refrigerated goods.", "All customers arriving before nine.", "Anyone parking a bicycle behind the plaza.", "The first fifty customers who bring reusable bags."], 3,
             "读懂：reusable bags 是可重复使用的袋子；bringing one 的 one 指袋子。领券要同时满足“带袋子”和“属于前五十位带袋顾客”。\n解析：“the first fifty customers bringing one” 中 one 指前句的 reusable bags，所以领券对象是带环保袋的顾客中的前五十位。卖冷藏品、骑车或九点前到场本身都不构成领券资格。\n下次：资格题把所有限制连成“且”：身份、行为、数量或截止时间缺一不可。尤其回指 one 时先找它替代什么，别只听到 first fifty 就漏掉带袋条件。"),
        ],
    ),
    (
        "Research presentations",
        "A reminder for students presenting at Friday's research forum: upload your slides by Thursday at noon. "
        "Staff will test the files on the lecture hall computer that afternoon. "
        "You may make minor corrections afterward, but bring the final version on a USB drive and tell the technician before your session. "
        "Posters do not need to be uploaded. They should be delivered to the hall by eight-thirty on Friday so volunteers can mount them before visitors arrive.",
        [
            ("Why are slides due on Thursday?", ["They must be tested on the presentation computer.", "Visitors will read them before buying tickets.", "Volunteers need time to turn them into posters.", "No changes of any kind will be allowed later."], 0,
             "读懂：slides 是幻灯片，test the files 是测试文件。周四先交，是为了在报告厅电脑上检查能否正常使用；之后仍可做小改动。\n解析：周四中午先交幻灯片，是为了让工作人员当天下午 “test the files on the lecture hall computer”。“minor corrections afterward” 表明之后仍可小改，不是禁止一切修改，也没有售票预览或转印海报的安排。\n下次：提前提交的原因，通常要从截止日期到活动之间的工作找。将“周四交→当天下午测试→周五报告”串起来，别把有截止日误解成以后绝不能修改。"),
            ("What must a student who revises slides after uploading do?", ["Withdraw from the presentation session.", "Submit a printed poster instead.", "Bring the final file and inform the technician.", "Ask visitors to view the file on their own devices."], 2,
             "读懂：final version 是最终版本，technician 是技术人员。上传后若做小改动，要用 USB 盘带来最终文件，并在自己的报告开始前告诉技术人员。\n解析：修改后必须同时做到 “bring the final version on a USB drive” 和 “tell the technician before your session”，即带最终文件并提前告知技术员。无需退出、改交海报，也不是让观众自行用设备查看。\n下次：遇到允许修改但附带条件的通知，抓住 but 后的动作清单。这里是“带新文件＋提前告知”，只完成其中一项仍不符合完整要求。"),
        ],
    ),
    (
        "A volunteering orientation",
        "Thank you for joining the river-cleanup team. Our orientation begins at ten in the student center. "
        "The outdoor activity itself is next weekend, so you do not need work clothes today. "
        "We will explain equipment use and divide volunteers into small teams. "
        "If you cannot swim, you can still participate: several teams will record collected materials and work well away from the water. "
        "Before leaving today, please confirm your emergency contact details with your team leader.",
        [
            ("What will volunteers do today?", ["Begin cleaning the riverbank.", "Receive instructions and join teams.", "Complete a swimming assessment.", "Collect outdoor clothing from the center."], 1,
             "读懂：orientation 是活动前的说明与准备，不是户外活动本身。今天讲设备使用并分组，真正清理河道在 next weekend（下周末）。\n解析：今天是 orientation，内容是 “explain equipment use” 和 “divide volunteers into small teams”，即听说明并分组。清理活动在 “next weekend”，今天还不清理河岸，也不要求泳测或领取工作服。\n下次：同一通知有今天和未来的活动，分别列清单。题目问今天，就选培训与分组；不要因为活动名字叫清理河道，就把未来的实地工作搬到今天。"),
            ("Why does the speaker mention recording materials?", ["To explain why all volunteers need computers.", "To replace the cleanup with a classroom project.", "To warn that fewer volunteers are needed.", "To describe a role suitable for people who cannot swim."], 3,
             "读懂：cannot swim 是不会游泳；record collected materials 是登记收集到的物品。提这个岗位，是说明不靠近水的工作也能让不会游泳者参与。\n解析：说完 “If you cannot swim, you can still participate” 后举出 “record collected materials”，并说明这些队伍 “well away from the water”，是在提供不会游泳者可承担的岗位。不是把清理改为课堂项目，也没有说减少志愿者或人人要用电脑。\n下次：问为什么举某个岗位例子，回看例子前提出的人群限制。把“这类人有顾虑→提供适合的角色”连起来，不把一个替代岗位说成整个活动被替换。"),
        ],
    ),
]

TALKS = [
    (
        "Ecological succession",
        'Imagine a field that has stopped being used for farming. At first it may look empty, but seeds are already arriving on the wind or being carried by animals. Fast-growing plants often establish themselves first. As they die and decompose, they add organic material to the soil. Their roots can also help hold the soil in place. These changes may allow shrubs and, later, trees to grow. Ecologists call this sequence succession. Picture two abandoned fields on opposite sides of a hill. One gets more moisture, and the other is exposed to drying winds. Even if both were abandoned in the same year, their plant communities need not develop at the same rate. It is tempting to picture succession as a fixed staircase, with every field passing through exactly the same stages. In reality, the route depends on conditions such as rainfall, nearby seed sources, and later disturbances. A fire, for instance, may remove young trees while leaving some underground roots intact. The community that develops afterward can therefore differ from the one that came before. So when we restore a damaged area, simply planting the species we hope to see at the end may not work. We also need to consider the conditions that allow those species to become established.',
        [
            ("What is the talk mainly about?", ["Why farming prevents all plants from spreading.", "How forests can be protected from every disturbance.", "How plant communities change and why the sequence can vary.", "Why trees always appear before smaller plants."], 2,
             "读懂：succession 指生态演替，即一个地方的植物群落逐步变化。先长什么、后来长什么会受水分、种子和干扰影响，不是每块地完全相同。\n解析：讲座先把植物群落逐步变化称为 “succession”，再用 “the route depends on conditions” 说明路径和速度会随环境改变，主旨需涵盖这两层。农耕阻止一切传播、森林免受所有干扰都过于绝对，树木最先出现也与先有速生植物相反。\n下次：主旨要覆盖“现象是什么＋讲者强调的限制”。先描述常见顺序、后强调环境导致差异，两部分都要装进答案，别只记住某一种植物。"),
            ("How can early plants help later ones?", ["By adding organic material and stabilizing soil.", "By eliminating the need for rainfall.", "By preventing animals from carrying seeds.", "By making all sites develop identically."], 0,
             "读懂：organic material 是有机物，hold the soil in place 是把土壤固定住。早期植物分解可补充土壤物质，根系又可固土，为后来的植物创造条件。\n解析：先期植物分解后 “add organic material to the soil”，根又能 “hold the soil in place”，从而改善后续灌木和树木的生长条件。这不是消除降雨需求或阻止动物传种，更不会让所有地点按相同方式发展。\n下次：机制题逐步连接“先期植物做了什么→土壤如何变化→后期植物怎样受益”。不要把改善条件扩大成不需要降雨或所有地方都会同样发展。"),
            ("Why does the speaker refer to a 'fixed staircase'?", ["To recommend planting trees at different heights.", "To describe a common but oversimplified model.", "To explain how scientists measure root depth.", "To compare farmland with urban buildings."], 1,
             "读懂：fixed staircase 是固定的阶梯，比喻每块地都按完全一样的台阶发展。后面的 In reality（实际情况却是）转而说明环境不同，路径也不同。\n解析：“fixed staircase” 比喻每块地都经过 “exactly the same stages” 的想法，随后 “In reality” 转而强调环境差异，说明这是待纠正的简化模型。它不是种树高度、根深测量或建筑比较的字面说明。\n下次：比喻目的看它后面是赞同还是纠正。听到 In reality 的转折，要辨认前面的说法是待修正的简化认识，而不是把阶梯当成真的种植高度。"),
            ("What can be inferred about restoration projects?", ["They should always begin by planting mature trees.", "They work best when all underground roots are removed.", "They can ignore the site's recent history.", "They should account for conditions needed by desired species."], 3,
             "读懂：become established 在植物语境里是扎根并稳定生长。修复时仅种下期望的物种不够，还要有水分、土壤等使它存活的条件。\n解析：结尾说 “simply planting the species” 可能无效，还要考虑使其 “become established” 的条件，因此修复项目应关注目标物种能否立足。总是先种成树、清除所有地下根系或忽略近期干扰，都不是文中的建议。\n下次：从科学机制推建议时，用“目标物种需要什么→当地是否具备”判断。原文强调条件，就不能选不看环境、历史或一律采用同一操作的绝对方案。"),
        ],
    ),
    (
        "Retrieval and familiarity",
        'When students reread a chapter, its sentences often start to feel familiar. That familiarity can be reassuring, but it is not the same as being able to explain the ideas without the book. Psychologists distinguish recognizing information from retrieving it. Recognition supplies a cue: you see a term and know you have encountered it. Retrieval asks you to produce the information with fewer clues. For example, after reading about a scientific process, close the book and explain its steps to yourself. You may discover a gap that was invisible while the paragraph was in front of you. Perhaps you remember the first and final stages but cannot explain the connection between them. Simply looking at a diagram again might hide that problem; describing it makes the missing connection noticeable. That difficulty is useful because it tells you where further study is needed. However, repeatedly producing an incorrect answer is not the goal. Check your explanation against a reliable source and correct it. Then try again after some time has passed. Spacing these attempts gives you opportunities to retrieve the idea in changing conditions. The practical lesson is not to abandon reading, but to combine it with attempts to recall and with feedback on those attempts.',
        [
            ("What distinction does the speaker make?", ["Between reading quickly and writing slowly.", "Between finding information familiar and recalling it independently.", "Between scientific and historical explanations.", "Between studying alone and joining a class."], 1,
             "读懂：recognition 是看见提示后认出，retrieval 是较少提示下自行回忆。看书觉得 familiarity（熟悉）不代表合上书还能独立解释。\n解析：“familiarity” 不等于能 “explain the ideas without the book”：recognition 借助眼前提示认出信息，retrieval 则靠较少线索自行回忆。区分点不是读写速度、学科类别或独学与上课。\n下次：对比概念先找两者的判断标准。本题是“有没有依赖眼前线索”，而非速度、学科或地点；用同一标准检查每个选项，避免靠听见的名词乱配。"),
            ("Why does the speaker suggest closing the book?", ["To prevent students from taking notes.", "To avoid reading unreliable sources.", "To make study sessions shorter.", "To reveal gaps that familiarity may conceal."], 3,
             "读懂：close the book 是合上书，a gap 是知识或理解的缺口。没有眼前文字提示时，才可能发现自己记得开头结尾，却说不出中间的联系。\n解析：“close the book and explain its steps” 会暴露阅读时未察觉的 “a gap”，例如记得首尾却讲不清中间联系。合书是检验独立回忆，不是禁止笔记、避免不可靠来源或单纯缩短学习时间。\n下次：行动目的题先问“做完后暴露了什么”。合书不是为了不读书，而是撤掉提示来检验回忆；把做法与检验目标相连，别自行添加节省时间等目的。"),
            ("What qualification does the speaker add about retrieval practice?", ["Errors should be checked and corrected.", "It only works for scientific processes.", "The same incorrect answer should be repeated.", "All reading should be replaced by testing."], 0,
             "读懂：qualification 在本题是对说法增加限制或补充，不是学历。讲者要求用 reliable source（可靠资料）检查回忆，并把错误纠正，不能一直重复错答案。\n解析：讲者强调反复给出错误答案 “is not the goal”，要求 “Check your explanation against a reliable source and correct it”，所以回忆练习必须核对并纠错。科学过程只是例子，方法并不限于科学，也不主张用测试取代全部阅读。\n下次：听到 However（不过）后，专记主张的边界。方法有效不等于随便怎么练都有效；本题必须加上“核对并纠错”，不能概括成越重复越好。"),
            ("How is the talk organized?", ["A historical account followed by a prediction.", "A list of unrelated memory disorders.", "A distinction, an example, and practical guidance.", "An experiment followed by objections to its results."], 2,
             "读懂：distinguish 是区分，For example 是举例，The practical lesson 是实际学习启示。这些词对应开头辨析两种记忆、随后举例、最后给建议。\n解析：先 “distinguish recognizing information from retrieving it” 界定区别，再以 “For example” 引出合书解释，最后用 “The practical lesson” 总结学习做法。全文是概念区分、实例、实践建议，并非历史预测、记忆障碍清单或实验结果争论。\n下次：结构题每段只记它在做什么，而不抄细节。用“区分概念→展示例子→建议做法”串联，再匹配选项；不要因出现科学例子就误判成报告实验。"),
        ],
    ),
    (
        "The value of an unused option",
        "Suppose a town is deciding whether to keep a little-used bus route. Looking only at ticket sales, the service may seem to have limited value. But economists sometimes consider something called option value: the value of keeping a possibility available, even if people rarely use it. A resident who normally drives may still appreciate having a bus available when the car needs repairs. The route can also make it possible to accept a job before that resident knows whether driving will always be practical. Neither benefit appears fully in today's ticket revenue. Think of the decision from the resident’s perspective. Knowing there is a backup makes a plan less risky, even during a month when the car never breaks down. That reassurance is different from the benefit of a journey actually taken. Of course, recognizing option value does not mean every route should be retained at any cost. The town must compare the benefits with expenses and with alternatives, such as a less frequent service or transport that passengers book in advance. Surveys can help reveal how residents value access, though people may state a higher willingness to pay when no actual payment is required. The point is that a decision based solely on current use may overlook a service's contribution to future flexibility.",
        [
            ("What does 'option value' refer to in the talk?", ["The price of the most popular bus ticket.", "The cost of repairing a private car.", "The profit from expanding every bus route.", "The benefit of keeping a service available for possible use."], 3,
             "读懂：option value 是保留备用选择的价值。公交即使平时少坐，未来需要时仍能使用，这种可用性本身就可能有好处。\n解析：“the value of keeping a possibility available” 强调保留未来可用的选择，即使 “people rarely use it” 仍有价值。它不是票价、修车费用，也不等于扩建所有线路的利润。\n下次：术语题先用讲者紧随其后的定义替换术语，再拿例子检验。区分“保留选择的好处”与“已经乘车的收益”，不要拿日常词义或票价硬套。"),
            ("Why does the speaker mention a car needing repairs?", ["To show that car ownership is always uneconomical.", "To explain why buses require less maintenance.", "To illustrate a situation in which an unused alternative becomes useful.", "To argue that ticket prices should match repair costs."], 2,
             "读懂：the car needs repairs 是汽车需要维修。平时开车的居民此时能改坐公交，说明不常使用的备用交通在特定情境下仍有价值。\n解析：平时开车的人在 “the car needs repairs” 时可用公交，例子说明平常闲置的替代方案也能在需要时派上用场。它没有比较公交与汽车的维修成本，也不证明养车总不划算或票价应等于修车费。\n下次：例子题先找它证明的抽象观点，再问情境变了什么。本题是“原选择暂不可用→备用选择派上用场”，不是比较两种交通工具的维修费用。"),
            ("What caution does the speaker give about surveys?", ["Residents may overstate what they would actually pay.", "They measure ticket sales more accurately than records.", "They cannot include people who normally drive.", "They always underestimate the cost of bus service."], 0,
             "读懂：willingness to pay 是愿意支付多少钱；no actual payment is required 是无需实际掏钱。调查中的口头金额可能高于真的要付款时愿付的金额。\n解析：“a higher willingness to pay when no actual payment is required” 提醒：不用真付款时，居民可能把愿付金额说得偏高。这里质疑的是口头意愿与实际付费的差距，并非调查必然低估运营成本、不能问司机或比票务记录更准确。\n下次：调查限制题分开“声称会做什么”和“实际付出时会怎样”。这里偏差针对愿付金额，别把它换成运营成本、受访者资格或售票数量。"),
            ("Which policy would be consistent with the speaker's argument?", ["Closing every route with low ticket revenue.", "Considering backup access, costs, and alternative service arrangements.", "Keeping all existing routes without comparing expenses.", "Basing the entire decision on a single survey result."], 1,
             "读懂：at any cost 是不惜任何代价；alternatives 是替代安排。承认公交的备用价值，不等于所有线路都无条件保留，还要比较费用和其他服务方式。\n解析：保留备用交通有价值，但 “not mean every route should be retained at any cost” 随即限定了结论，应把备用便利与 “expenses and with alternatives” 一起比较。仅凭低票收就全关、无条件全留，或只信一次调查，都忽略了这项权衡。\n下次：政策题同时保留好处与限制：先算备用选择的价值，再看成本及替代方案。排除“全关”“全留”或只凭一个数字决策的选项，注意这不是盲目偏爱折中，而是对应原文列出的权衡。"),
        ],
    ),
]
