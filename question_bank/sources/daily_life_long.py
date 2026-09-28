"""Original three-question daily-life texts and item-level review evidence."""

DAILY_PASSAGES = [
    ('Email about an exhibition booking',
     'Subject: Your exhibition booking\nDear Mina,\nWe can provisionally hold the gallery for your student exhibition on May 18. '
     'To confirm the booking, send the completed safety form and pay the deposit by April 30. Payment alone does not secure the space. '
     'The deposit will be returned after the event if the room is left in its original condition. '
     'Your request to install displays the previous evening is possible, but only if the earlier group finishes on time. '
     'We will confirm that access on May 16, so please keep a plan for setting up on the morning of your event. '
     'A projector is included in the room fee; technical assistance must be booked separately at least a week ahead. '
     'Please reply with your expected attendance so we can arrange enough chairs.\nRegards,\nJon',
     [
         ('Why has Jon written to Mina?', ['To explain what is needed to finalize an event booking', 'To confirm that all booking requirements have been met', 'To ask her to move the exhibition to another date', 'To report damage found after an exhibition'], 0,
          "读懂：provisionally hold 是“暂时保留”，还不是正式订好。要确认五月十八日的展览，Mina 须在四月三十日前交安全表并付押金，邮件还交代布展和设备安排。\n解析：Jon 是说明如何完成预订，不是说所有要求已满足；也没让她改展览日期。保持房间原状关系到活动后退押金，不表示已经发现损坏。\n下次：判断事务邮件目的，先辨认当前状态是“暂留、确认、取消还是事后处理”，再看收信人还需做什么。不要把有条件保留误当成办妥，也不要把预防提醒当作已发生的问题。"),
         ('What should Mina do if she wants help operating the projector?', ['Request technical assistance at least a week before the event', 'Pay another deposit when collecting the projector', 'Wait until May 16 to reserve an assistant', 'Include the request only in the expected-attendance reply'], 0,
          "读懂：投影仪含在场地费里，但 technical assistance，即操作技术支持，要另外预约，至少提前一周。五月十八日举办，最迟应在五月十一日预约。\n解析：应提前申请技术帮助，不是再付一笔押金。五月十六日确认的是能否提前进场，此时才订技术人员已不足一周；只在预计人数的回复里提一句，也不等于完成单独预约。\n下次：通知里同时出现设备和人员时，分开查“是否包含费用、是否另需预约、各自截止日”。免费附带设备不等于附带操作人员，别把入场确认日套给技术服务。"),
         ('Mina has paid the deposit and expects to install displays on May 17. What is still uncertain?', ['Both her booking and her access on the previous evening', 'Only her booking, because previous-evening access is guaranteed', 'Only her access, because payment confirms the booking', 'Neither arrangement, provided she leaves the room undamaged'], 0,
          "读懂：Payment alone does not secure the space 是“仅付款不能确保场地订妥”，还需安全表。前晚布展也要等上一组准时结束，五月十六日才会确认能否进场。\n解析：两项都还不能确定：题干只确认付了押金，没说已交表；期待五月十七日布展也不是获准。只剩预订不确定或只剩进场不确定，都漏掉另一条件；房间无损只关系退押金。\n下次：多条件题逐项标记“已证实、未说明、仍待确认”。尤其不要把没提到的手续当成已完成，也别把将来退款条件当作现在预订成功的证据。"),
     ]),
    ('Messages about a field trip',
     'Ava, 09:10: The museum has offered us a guided tour at 10:00 on Saturday, but it needs our final numbers by Thursday noon. '
     'The minibus we usually borrow is unavailable.\n'
     'Ben, 09:14: I can reserve a larger bus if at least twelve people confirm. It costs more, so everyone would pay an extra five dollars. '
     'Otherwise, we can take the public bus, which arrives at 10:20.\n'
     'Ava, 09:18: I will ask whether the guide can start later. Please do not reserve anything until I hear back. '
     'Either way, anyone who has not replied by Wednesday evening will be left out of our final count.\n'
     'Ben, 09:22: Understood. I will collect replies and let people know about the possible extra charge. '
     'I will wait for your message before contacting the bus company.',
     [
         ('Why does Ava need to contact the museum again?', ['The alternative public transport arrives after the proposed tour start', 'The museum has changed the deadline for the final numbers', 'The group has already reserved a bus that is too large', 'The guide has refused to work with fewer than twelve visitors'], 0,
          "读懂：博物馆原提议十点开始导览，但备用公共巴士十点二十分才到，比开场晚二十分钟。Ava 因此要问导览能否推迟。\n解析：再联系博物馆是为解决到达与开始时间冲突。馆方没改报人数的期限；大巴还没预订；十二人的门槛属于能否订大巴，不是导游拒接小团的规定。\n下次：团体出行题先把“交通到达时间”和“活动开始时间”排在同一时间线上，再看谁要协调哪一段。人数门槛、订车权限和馆方期限各管不同事情，不能互相移用。"),
         ('Twelve people reply by Wednesday afternoon. What should Ben do next under the agreed plan?', ['Report the replies but wait for Ava before reserving transport', 'Reserve the larger bus immediately because its condition is met', 'Send the museum the final numbers instead of waiting until Thursday', 'Tell the group that the public bus is no longer an option'], 0,
          "读懂：Ben 可以在至少十二人确认时预订大巴，但 Ava 又明确要求，在她收到博物馆回复前不要订任何交通；Ben 也答应等她的消息。\n解析：即使十二人的回复满足人数门槛，仍应汇总报告并等待 Ava，而非立刻订车。此时直接给博物馆报最终人数不是约定的下一步；公共巴士也没有因此被正式排除。\n下次：题目给出一个条件刚满足时，继续检查是否还有独立的许可条件。“人数够了”和“负责人已批准”不是一回事；按对话最后达成的分工决定下一步。"),
         ('A student replies on Thursday morning, before the museum deadline. What follows from Ava’s message?', ['The student will still be excluded from the group’s final count', 'The student must be included because the museum has not closed bookings', 'The student can join the count by paying the extra five dollars', 'The student will be counted only if the tour starts at 10:20'], 0,
          "读懂：馆方要周四中午前收到最终人数，但 Ava 给同学的回复期限是周三晚上。她说无论用哪种交通，没按这个时间回复的人都不计入。\n解析：周四早上虽未过馆方期限，却已错过小组内部期限，所以仍被排除。多付五美元是大巴的潜在费用，不能买回名额；导览是否十点二十分开始也不改变回复规则。\n下次：有层层上报的安排时，把“成员交给负责人”和“负责人交给机构”的期限分开。自己要遵守所属那一层，不能因最终机构还没截止就认为个人回复仍有效。"),
     ]),
    ('Notice about travel reimbursements',
     'Student Conference Travel Fund\nStudents presenting accepted work at a conference may request reimbursement for economy travel. '
     'Applications must be approved before tickets are purchased; acceptance by a conference does not count as funding approval. '
     'The fund covers the amount actually paid, up to the approved limit, after any support from other organizations has been deducted. '
     'Receipts are required, even for journeys costing less than the limit. '
     'Submit your claim within thirty days of returning. If a receipt is missing, submit the claim on time with an explanation; '
     'the finance office may allow additional time for that document, but it will not extend the initial claim deadline. '
     'Changes to the destination or conference require a new approval. A change of departure time alone does not. '
     'Accommodation and meals are outside this fund.',
     [
         ('Which student has followed the purchase rule?', ['A student who waited for the fund’s approval before buying an economy ticket', 'A student who bought a ticket as soon as the conference accepted the work', 'A student who bought a ticket before applying because it was below the limit', 'A student who received funding approval only after returning from the conference'], 0,
          "读懂：applications must be approved before tickets are purchased 是“申请须先获批，再买票”。会议接受研究成果，不等于旅行资助也已获批；这是两种不同批准。\n解析：合规者等到基金批准后才买经济舱票。会议接受后立刻买票缺少基金许可；票价低于上限也不能免掉先审批；回程后才获批准更不能补成购票前已批准。\n下次：涉及审批顺序，先写“谁批准什么”，再排“批准→购买”的时间线。不要把别的机构的同意、金额较小或事后补批，当成明确前置条件的替代。"),
         ('What should a student with a missing receipt do before thirty days have passed?', ['Submit a claim explaining the missing receipt', 'Wait for the receipt before submitting any claim', 'Ask the conference to approve a later claim deadline', 'Submit a claim without mentioning the missing document'], 0,
          "读懂：“submit the claim on time with an explanation”是按时交申请并说明缺件；“the initial claim deadline”是首次申请截止日。收据可能获准晚补，但主申请仍须回程后三十天内交。\n解析：应先提交说明缺收据的申请。等收据齐全再申请可能逾期；会议方不是批准报销延期的机构；提交却不说明缺件，也没有照规定做。\n下次：遇到材料不齐，区分“主申请截止”和“证明文件补交期限”。先找是否允许缺件说明，按原时间保住主流程，不要把某份附件可延期理解成整件申请都能晚交。"),
         ('A student’s approved limit is $300. The economy ticket costs $240, and another organization pays $80 toward it. How much can this fund reimburse?', ['$160', '$220', '$240', '$300'], 0,
          "读懂：“the amount actually paid”是实际支付金额，“up to the approved limit”是不超过批准上限；其他机构资助还要扣除。因此三百美元是封顶额，不是每人固定可领三百。\n解析：票价二百四十减去已获的八十，剩一百六十美元，低于三百上限，所以报一百六十。二百二十是错误地用上限减资助；二百四十漏扣外部支持；三百则把上限当成付款额。\n下次：报销计算按“实际合资格花费→减其他资助→与上限比较”三步做。先算尚需补偿的支出，再检查封顶，不能直接拿额度当成本。"),
     ]),
    ('Email about a revised work placement',
     'Subject: Revised placement arrangements\nDear Omar,\nThe community office can still offer you the research placement, '
     'although the original Monday schedule is no longer available. You may attend on Wednesdays instead, provided your course coordinator approves the change. '
     'Please obtain that approval before accepting our revised offer. '
     'Most work will involve reviewing survey responses at the office. One afternoon each month will be spent visiting partner sites, '
     'and you will need to arrange your own travel to those visits; ordinary travel to the office is not reimbursed either. '
     'The office will supply a laptop, which must remain on site. '
     'If the revised schedule prevents you from completing the hours required by your course, we can discuss extending the placement, '
     'but we cannot promise an extension until the supervisor’s availability has been checked.\nBest,\nLeah',
     [
         ('What is Omar asked to do before accepting the offer?', ['Get his course coordinator’s permission for the Wednesday schedule', 'Ask the supervisor to guarantee an extension of the placement', 'Arrange travel for every partner-site visit in advance', 'Buy a laptop suitable for reviewing survey responses'], 0,
          "读懂：原来的周一实习不能安排了，可改周三，但 provided your course coordinator approves the change 表示必须先取得课程协调员批准，而且要在接受新安排之前。\n解析：Omar 应先获准改到周三。延期还需另查主管有无时间，不能要求先保证；每次外访交通要自行安排，但不是接受前必须全部订好；电脑由办公室提供，无须先买。\n下次：问接受机会前要做什么，先找 before、provided 等顺序和条件词，再确认批准者是谁。把必须先完成的许可与之后的日常准备分开。"),
         ('What does the email indicate about working away from the office?', ['Some duties take place elsewhere, but the supplied laptop cannot be taken there', 'All survey work must be completed at home using a personal laptop', 'Partner visits replace the weekly office work throughout the placement', 'Travel to partner sites is unnecessary if the laptop stays in the office'], 0,
          "读懂：大部分工作在办公室看问卷回复，但每月有一个下午要去合作地点；提供的电脑 must remain on site，即必须留在办公室，不能跟着外带。\n解析：两项规则合起来说明，有外出职责，但不能把这台电脑带去。并非所有调查工作都在家做；每月一次访问不取代每周办公室工作；电脑不能带走也不代表外访可以不去。\n下次：跨句信息题把“人的工作地点”和“设备的使用限制”分别列出，再取同时满足两者的结论。不要让设备限制抹掉明确安排的外出任务。"),
         ('What can Omar conclude if the new schedule leaves him short of course hours?', ['An extension is possible but depends on a check that has not yet been completed', 'His coordinator’s approval automatically guarantees extra placement weeks', 'The office has already agreed to reduce the course’s required hours', 'He must reject the offer because the placement cannot be extended'], 0,
          "读懂：若新安排导致课程要求的时数不够，办公室可以讨论延长实习，但要先查主管是否有空，才可能作出承诺。\n解析：所以延期有可能，但仍取决于尚待核查的条件。协调员批准周三时间不自动保证延长；办公室也没同意降低课程时数；说只能拒绝、绝不能延长，又把尚未保证误读成完全禁止。\n下次：遇到 we can discuss 与 cannot promise，分清“可商量、已保证、不允许”三种状态。保留原文的条件性，别把一个人的许可扩成另一个安排的必然批准。"),
     ]),
    ('Notice about a repair workshop',
     'Repair Workshop: Participant Information\nThis session is for residents who want to learn basic repairs to small household items. '
     'Register online by Tuesday and describe the item you hope to bring. Registration reserves a place for you, not approval for the item; '
     'a volunteer will reply separately after checking whether suitable tools are available. '
     'If your item cannot be accepted, you may still attend and work with one of our demonstration items. '
     'Please remove batteries before arrival. Devices connected to mains electricity and items with leaking batteries cannot be brought into the room. '
     'Basic tools are supplied, but participants pay for any replacement parts they choose to use. '
     'The session is instructional, so volunteers cannot guarantee a successful repair. '
     'Cancel by Friday noon to receive a refund of the registration fee; the workshop itself takes place on Saturday morning.',
     [
         ('What does successful online registration establish?', ['The resident has a place, while the proposed item still needs approval', 'The proposed item has been checked and accepted by a volunteer', 'The resident is guaranteed a repaired item by the end of the session', 'Any replacement parts required for the item have been paid for'], 0,
          "读懂：“reserves a place for you”是给你留名额；“not approval for the item”是不代表物品获准。志愿者还要检查工具是否合适，再单独回复能否带来该物品。\n解析：成功报名表示人有位置、物品待审批。不能推成物品已检查通过；教学活动不保证修好；替换零件需要参加者另付费，报名成功也不等于零件已付款。\n下次：一个流程涉及“人”和“物”时，分别确认每一步批准的是哪个对象。名额预留、物品接收、维修结果和零件费用是四件事，完成其中一步不能自动包办其余几项。"),
         ('A resident’s item is rejected because the tools are unavailable. What option does the notice provide?', ['Attend and practise using a demonstration item', 'Bring the item anyway after removing its batteries', 'Receive an automatic refund without cancelling', 'Borrow suitable tools and require a volunteer to repair it'], 0,
          "读懂：“you may still attend”是仍可参加；“demonstration items”是主办方的演示物品。个人物品因缺工具未获准，不会取消人的名额，可以改用演示物品练习。\n解析：可参加并改用演示物品。拆掉电池只是安全要求，不能推翻物品未获准的决定；退费需在周五中午前取消，不会自动发生；也不能自借工具后要求志愿者保证代修。\n下次：遇到申请部分被拒，先辨认被拒的是物品还是人的名额，再找明确提供的替代方案。安全条件满足、工具自行补足，都不等于获得原文没有给出的审批豁免。"),
         ('Which expectation is inconsistent with the workshop’s terms?', ['Paying for a replacement part ensures that the repair will succeed', 'A participant can receive a fee refund by cancelling before Friday noon', 'A participant can use supplied tools during the session', 'The volunteer’s item approval is separate from registration'], 0,
          "读懂：活动是教人维修，志愿者明确说不能保证修好。替换零件虽另收费，但付零件钱与维修能否成功是两件事。\n解析：题目找“不符合条款”的期待，所以是“付了零件费就保证修好”。周五中午前取消可退报名费、现场可用提供的工具、物品审批与报名分开，这三项都与公告一致，不能选作冲突项。\n下次：看到 inconsistent 先标记题目要找反例，再逐条核对条款。尤其拆开“付什么费用”和“承诺什么结果”，不要把付费自动理解为购买成功保证。"),
     ]),
]

# R251–R265, in the same order as the questions above.
REVIEWS = [
    ('medium', ['主旨与目的'], ['provisionally', 'finalize'], '区分暂留场地与已完成预订，概括整封邮件的沟通目的。', 'The provisional hold is followed by requirements for confirming the booking.'),
    ('medium', ['细节定位', '条件整合'], ['technical assistance', 'separately'], '区分设备包含在费用中与技术人员须单独预约两条安排。', 'Technical assistance must be booked separately at least a week ahead.'),
    ('hard', ['推断与条件整合'], ['payment alone', 'on time'], '同时核对付款、表格和上一组结束时间，判断两个安排均未确定。', 'Payment alone does not secure the space; previous-evening access depends on the earlier group.'),
    ('medium', ['因果与目的'], ['arrives', 'start later'], '把公共汽车抵达时间与原定参观开始时间联系起来判断联系博物馆的原因。', 'The offered start is 10:00, whereas the public bus arrives at 10:20.'),
    ('hard', ['推断与条件整合'], ['at least twelve', 'until'], '达到人数门槛仍不等于获得预订许可，需追踪两位发言人的责任和附加条件。', 'Ben must wait for Ava even if twelve participants confirm.'),
    ('hard', ['细节整合', '时间条件'], ['Wednesday evening', 'Thursday noon'], '区分小组内部回复期限和博物馆接收人数的外部期限。', 'Thursday morning is before the museum deadline but after the group reply deadline.'),
    ('medium', ['条件整合'], ['approved', 'acceptance'], '区分会议录用与资助审批，判断购票操作顺序。', 'Funding applications must be approved before tickets are purchased.'),
    ('medium', ['条件与后续行动'], ['additional time', 'initial claim deadline'], '按明确说明处理缺失收据，并区分申请截止日期与附件补交安排。', 'Only the missing document may be given extra time; the claim must still be submitted within thirty days.'),
    ('hard', ['信息整合'], ['deducted', 'approved limit'], '理解补贴上限并非固定金额，实际费用须先扣除其他来源支持。', 'Actual cost of $240 less outside support of $80 leaves $160, below the $300 cap.'),
    ('medium', ['细节定位', '顺序条件'], ['provided', 'before accepting'], '识别接受修订安排前必须取得课程负责人许可的条件。', 'The coordinator must approve the Wednesday schedule before Omar accepts.'),
    ('medium', ['信息整合'], ['partner sites', 'remain on site'], '结合月度外出职责与设备使用范围，区分工作地点和电脑携带权限。', 'Visits occur at partner sites, but the supplied laptop stays at the office.'),
    ('medium', ['推断与证据边界'], ['cannot promise', 'availability'], '根据明确的条件性措辞，区分可以讨论延期与已经保证延期。', 'An extension depends on checking the supervisor’s availability.'),
    ('medium', ['细节整合'], ['reserves', 'approval'], '区分报名成功和物品审核，不把两个程序视作同一承诺。', 'Registration reserves a participant place, while item approval comes in a separate reply.'),
    ('medium', ['条件与后续行动'], ['demonstration items', 'refund'], '在物品被拒收时定位允许的替代活动，排除未经说明的退款和维修承诺。', 'A participant whose item is rejected may use a demonstration item.'),
    ('medium', ['推断与范围限定'], ['replacement parts', 'guarantee'], '联系零件付费与不保证维修成功两句说明，排除费用等于结果保证的误读。', 'Replacement parts may cost money, but volunteers cannot guarantee a successful repair.'),
]
