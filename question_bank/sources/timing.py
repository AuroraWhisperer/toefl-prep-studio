"""Practice pacing, with official limits kept distinct from local estimates."""

VERIFIED_ON = '2026-09-26'
SOURCES = {
    'ets_structure': {'label': 'ETS · 当前考试结构', 'url': 'https://www.ets.org/toefl/test-takers/ibt/about/content.html'},
    'ets_specs': {'label': 'ETS · 2026 题型规范', 'url': 'https://www.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf'},
    'ets_practice': {'label': 'ETS · 官方练习 Test 1', 'url': 'https://www.cn.ets.org/content/dam/ets-org/pdfs/toefl/toefl-ibt-teachers-resources-practice-test-1.pdf'},
    'ets_overview': {'label': 'ETS · 题型样例与口语时间', 'url': 'https://www.ets.org/pdfs/toefl/toefl-ibt-test-overview.pdf'},
    'tst_reading': {'label': 'TST Prep · 阅读节奏建议', 'url': 'https://tstprep.com/articles/toefl/ten-awesome-tips-for-the-reading-section-of-the-toefl-test/'},
    'tst_writing': {'label': 'TST Prep · 造句练习时间', 'url': 'https://media.tstprep.com/freebies/2026/toefl-writing-100-questions-freebie-2026.pdf'},
    'tst_repeat': {'label': 'TST Prep · 复述作答时间', 'url': 'https://media.tstprep.com/2026-courses/slides/speaking-course/04.03-toefl-speaking-2026-listen-and-repeat-task-guide.pdf'},
}

# Each value is for one complete block in practice_structure.TASK_STRUCTURE.
TASK_TIMING = {
    'complete_words': dict(seconds=120, range_seconds=[60, 120], basis='recommended', label='建议节奏', detail='每篇 10 空，含通读与检查。阅读按模块计时，没有逐篇官方限时。', source_ids=['ets_practice', 'tst_reading']),
    'read_daily_life': dict(seconds=None, group_seconds={2: 120, 3: 180}, range_seconds=[240, 360], basis='recommended', label='建议节奏', detail='2 题短材料预计 2 分钟，3 题长材料预计 3 分钟；抽题后逐篇相加。阅读按模块计时，这些是专项练习预算，不是官方逐篇限时。', source_ids=['ets_practice', 'tst_reading']),
    'read_academic_passage': dict(seconds=300, range_seconds=[240, 300], basis='recommended', label='建议节奏', detail='每篇约 200 词、5 题，含阅读、定位和检查。', source_ids=['tst_reading']),
    'listen_choose_response': dict(seconds=160, range_seconds=[120, 200], basis='local_estimate', label='练习估时', detail='每份 8 题，平均每题约 20 秒，含播放一次短句与作答。该预算不是官方逐题时限。', source_ids=['ets_practice', 'ets_structure']),
    'listen_conversation': dict(seconds=200, range_seconds=[180, 240], basis='local_estimate', label='练习估时', detail='每份 2 段对话、4 题，含各播放一次对话。重复播放和查看原文会增加练习用时。', source_ids=['ets_practice', 'ets_structure']),
    'listen_announcement': dict(seconds=90, range_seconds=[75, 105], basis='local_estimate', label='练习估时', detail='每组 2 题，含播放一次公告与作答。此分配是本题库的建议节奏。', source_ids=['ets_structure']),
    'listen_academic_talk': dict(seconds=180, range_seconds=[150, 210], basis='local_estimate', label='练习估时', detail='每组 4 题，含播放一次讲座、整理笔记与作答。此分配是本题库的建议节奏。', source_ids=['ets_structure']),
    'build_sentence': dict(seconds=360, range_seconds=[300, 360], basis='recommended', label='建议节奏', detail='每份 10 题约 6 分钟，平均每题 36 秒；6 分钟来自备考资料，36 秒不是官方逐题限制。', source_ids=['ets_specs', 'tst_writing']),
    'write_email': dict(seconds=420, range_seconds=[420, 420], basis='official', label='官方任务限时', detail='7 分钟包括读题、组织和写作。邮件没有官方最低字数；本项目的 100 词是展开内容的练习目标。', source_ids=['ets_practice']),
    'academic_discussion': dict(seconds=600, range_seconds=[600, 600], basis='official', label='官方任务限时', detail='10 分钟包括阅读讨论与写作。ETS 建议有效回应至少 100 词。', source_ids=['ets_practice']),
    'listen_repeat': dict(seconds=180, range_seconds=[120, 180], basis='local_estimate', label='整组练习估时', detail='每组 7 句，含听句和录音；本项目每句录音 8、10 或 12 秒，按句子位置递增。整组 3 分钟是练习预算。', source_ids=['ets_overview', 'tst_repeat']),
    'take_interview': dict(seconds=300, range_seconds=[240, 300], basis='mixed', label='整组估时 · 单题官方限时', detail='每组 4 问，含听题与切题；官方每问作答 45 秒、无单独准备时间。整组 5 分钟是练习预算。', source_ids=['ets_overview']),
}


def task_timing(task_type: str) -> dict:
    source = TASK_TIMING[task_type]
    return {
        'basis': source['basis'], 'label': source['label'],
        'range_seconds': source['range_seconds'], 'detail': source['detail'],
        'verified_on': VERIFIED_ON,
        'sources': [SOURCES[key] for key in source['source_ids']],
    }
