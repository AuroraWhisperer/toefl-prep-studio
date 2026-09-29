import re
from collections import Counter
from difflib import SequenceMatcher


def normalize(text):
    return re.findall(r"[a-z]+", text.lower())


def compare(original, answer):

    o = normalize(original)
    a = normalize(answer)

    remaining = Counter(a)
    missing = []
    for word in o:
        if remaining[word]:
            remaining[word] -= 1
        else:
            missing.append(word)

    ratio = SequenceMatcher(None, " ".join(o), " ".join(a)).ratio()

    return {"accuracy": round(ratio * 100, 1), "missing_words": missing}
