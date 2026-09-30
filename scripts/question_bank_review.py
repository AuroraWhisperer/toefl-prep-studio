"""Apply reviewed metadata and regenerate the private content catalogue."""

from __future__ import annotations

import csv
import hashlib
import json
from collections import Counter
from pathlib import Path

LEVEL_LABELS = {'easy': '简单', 'medium': '适中', 'hard': '困难'}


def content_fingerprint(question: dict, answer: dict) -> str:
    content = {key: value for key, value in question.items() if key not in {'difficulty', 'skills'}}
    encoded = json.dumps([content, answer], sort_keys=True, ensure_ascii=False).encode()
    return hashlib.sha256(encoded).hexdigest()


def mock_explanation_fingerprint(
    paper: dict, answers: dict, variants: dict, explanations: dict
) -> str:
    item_ids = {item['id'] for phase in paper['phases'] for item in phase['items']}
    accepted = {key: value for key, value in variants.items() if key in item_ids}
    encoded = json.dumps(
        [paper['phases'], answers, accepted, explanations], sort_keys=True, ensure_ascii=False
    ).encode()
    return hashlib.sha256(encoded).hexdigest()


def apply_review(questions: list[dict], answers: dict, notes: dict) -> None:
    for question in questions:
        note = notes[question['id']]
        if (
            note['difficulty'] not in LEVEL_LABELS
            or not note['skills']
            or not note['vocabulary']
            or not note['rationale']
        ):
            raise ValueError(f"Incomplete content review: {question['id']}")
        if note['content_sha256'] != content_fingerprint(question, answers[question['id']]):
            raise ValueError(
                f"Content changed since review: {question['id']}. Review the source and update its review_notes.json entry."
            )
        question['difficulty'] = note['difficulty']
        question['skills'] = note['skills']


def source_file(question: dict) -> str:
    number = int(question['id'][1:])
    section = question['section']
    if section in {'reading', 'listening'} and number > {'reading': 795, 'listening': 705}[section]:
        return f'expansion_2026_09_30/{question["task_type"]}.json'
    if number > {'reading': 265, 'listening': 235, 'writing': 150, 'speaking': 55}[section]:
        return f'expansion_2026_09/{question["task_type"]}.json'
    if section == 'reading' and number > 250:
        return 'daily_life_long.py'
    if section in {'reading', 'listening'}:
        return (
            'receptive_items.py'
            if number <= (50 if section == 'reading' else 47)
            else f'expanded_{section}.py'
        )
    return (
        'base_productive.py'
        if number <= (30 if section == 'writing' else 11)
        else 'expanded_productive.py'
    )


def write_catalogue(root: Path, bank_items: dict, notes: dict, manifest: dict) -> None:
    output = root / 'docs' / 'question-bank'
    output.mkdir(parents=True, exist_ok=True)
    columns = [
        'id',
        'section',
        'task_type',
        'material',
        'difficulty',
        'skills',
        'vocabulary',
        'timing_unit',
        'seconds_per_unit',
        'source_file',
        'rationale',
        'answer_evidence',
        'reviewed_on',
    ]
    with (output / 'catalogue.csv').open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        for section, questions in bank_items.items():
            for question in questions:
                note = notes[question['id']]
                config = manifest['sections'][section]['practice_tasks'][question['task_type']]
                item_range = config['items_per_set_range']
                item_count = (
                    str(item_range[0])
                    if item_range[0] == item_range[1]
                    else f'{item_range[0]}–{item_range[1]}'
                )
                time_range = config['time_range_seconds']
                writer.writerow(
                    dict(
                        id=question['id'],
                        section=section,
                        task_type=question['task_type'],
                        material=question.get('passage_title', question['prompt'].split('\n')[0]),
                        difficulty=LEVEL_LABELS[note['difficulty']],
                        skills=' / '.join(note['skills']),
                        vocabulary=' / '.join(note['vocabulary']),
                        timing_unit=f"每份（{config['units_per_set']} {config['unit']}，{item_count} 个小题）",
                        seconds_per_unit=config['seconds_per_set']
                        if time_range[0] == time_range[1]
                        else f'{time_range[0]}–{time_range[1]}',
                        source_file=f"question_bank/sources/{source_file(question)}",
                        rationale=note['rationale'],
                        answer_evidence=note['answer_evidence'],
                        reviewed_on=note['reviewed_on'],
                    )
                )
    lines = [
        '# 题库内容审阅清单',
        '',
        f"最近核对日期：{max(note['reviewed_on'] for note in notes.values())}。由题库生成器更新；逐题记录见 [catalogue.csv](catalogue.csv)，分级源记录位于 `question_bank/sources/review_notes.json`。",
        '',
        '这些级别表示本项目材料和任务的相对要求，不是 ETS 难度参数、CEFR 能力认证或预测分数。没有考生试测数据，不能证明难度与真实考试统计等值。',
        '',
        '| 题型 | 简单 | 适中 | 困难 | 总计 |',
        '|---|---:|---:|---:|---:|',
    ]
    overall = Counter()
    for section, questions in bank_items.items():
        for task, config in manifest['sections'][section]['practice_tasks'].items():
            counts = Counter(q['difficulty'] for q in questions if q['task_type'] == task)
            overall.update(counts)
            lines.append(
                f"| {section} · {config['label']} | {counts['easy']} | {counts['medium']} | {counts['hard']} | {sum(counts.values())} |"
            )
    lines.extend(
        [
            f"| 合计 | {overall['easy']} | {overall['medium']} | {overall['hard']} | {sum(overall.values())} |",
            '',
            '## 分级口径',
            '',
            '- 简单：常见生活或学习词汇、直接线索、单一关系；写作和口语题意贴近个人经验。',
            '- 适中：同义改写、复合句、语域、邻近信息整合、理由与例子；词汇难度与作答操作同时考虑。',
            '- 困难：抽象概念、反事实或倒装、隐含态度、多个条件、证据边界及有竞争性的同主题选项；不靠堆砌生僻词。',
            '- 学术材料中的专业概念需由原文解释或上下文支持；不把生物学、经济学等课外知识作为正确作答前提。',
            '- 产出题的难度是题意与表达负担，同一“简单”题仍可写出高水平回答；复述后段主要增加意群和句法记忆负担。',
            '',
            '## 内容修订记录',
            '',
            '- 2026-09-30 后续逐篇复核全部 450 道写作的题面、答案或范文及解析，并完成口语文本与阅读听力遗漏复查；修订 36 题，补收 17 个造句变体及 recognise 拼写，纠正范文与中文解析。邮件、讨论和访谈改为待人工复核，取消关键词数值分。详见 [productive-repair-2026-09-30.md](productive-repair-2026-09-30.md)。',
            '',
            '- 2026-09-30 逐题复核全部 3,000 道原创阅读、听力题：修正科学因果、填词可接受变体、干扰项和教学解析，替换六组学术阅读及三组学术听力共 42 题以补充主题，按实际作答要求分级，不强制各档占比。保留题号、完整组及个人历史；只更新已审阅的变更指纹。详见 [receptive-repair-2026-09-30.md](receptive-repair-2026-09-30.md)。',
            '',
            '- 2026-09-30 阅读和听力的 7 个题型逐型翻倍，新增 1,500 题；扩充阶段保留旧内容和指纹，随后进行上述逐题修订。扩充当时的源稿、数量与验证见 [receptive-expansion-2026-09-30.md](receptive-expansion-2026-09-30.md)。',
            '',
            '- 三倍扩充新增 1,410 道原创练习及逐题教学解析，12 个题型各达到原数量的三倍；原有 705 题和独立 ETS 模考保持不变。范围与验证结果见 [expansion-2026-09-27.md](expansion-2026-09-27.md)。',
            '',
            '- 2026-09-27 的真实性复核与修订见 [quality-revision-2026-09-27.md](quality-revision-2026-09-27.md)；后续出题遵循 [generation-guidelines.md](generation-guidelines.md)。以下保留此前已完成的结构修订记录。',
            '',
            '- 15 篇填词统一为完整首句、后文隔词挖空、10 空、70–100 词，保留非空前缀。',
            '- 修订 57 道阅读选择题、59 道听力材料题和 9 道短回应题；减少离题干扰项，加入语义范围、因果和条件误读，替换重复的打印机题。',
            '- 修正 R31 的培训记录更新时间：周三完成为周五早上领取留出完整工作日。',
            '- 50 道造句补充对话语境，收录已审阅的常见从句或状语换序；生成时校验替代答案与词库完全一致。',
            '- 每道题都有考点、词汇证据、分级理由和内容指纹。题面或答案修改后必须同步复核，生成器拒绝未经更新的记录。',
            '',
            '- 新增 R251–R265：5 篇长日常材料，每篇 3 题。日常阅读随机抽取完整材料，短篇 2 题、长篇 3 题，不固定配比；原有题号和内容保留。',
            '- 12 题型按完整任务份数抽取，每份至少包含适中或困难题，不强制加入简单题；不会修改难度标签来满足抽题条件。',
            '',
            '## 覆盖与边界',
            '',
            f"此前逐题复核 3,000 道阅读、听力；后续遗漏复查与产出题审阅覆盖全部 450 道写作和 165 道口语文本，实际分轮范围见对应报告。校验全部 {manifest['total_questions']} 条结构与指纹。写作参考范文用于示例表达，非官方满分范文；开放写作和访谈仅提供字数与重复措辞提示，质量需人工复核，机器检查不代替语言内容审阅。",
            '',
            '选择题的答案证据、填词完整词和分级理由仅在维护资料中保留；答题 API 仅公开难度与考点。词汇清单是审阅证据，未冒充官方词频或 CEFR 逐词标定。',
            '',
            '造句题包含固定文本、可移动词块及部分题目的多余词块；只接受已逐条审阅的答案，尚未覆盖所有合法词序。日常阅读每篇题数随材料确定，官方样题中的 2＋3 只是可能的组合之一。整科为固定练习卷，不是 ETS 自适应测试。听力使用合成语音；口语反馈基于转写文本，不能验证发音与真实听辨难度。',
            '',
            '正式结构、时间口径和第三方建议见 [timing-and-sources.md](timing-and-sources.md)。',
            '',
        ]
    )
    (output / 'audit.md').write_text('\n'.join(lines), encoding='utf-8')
