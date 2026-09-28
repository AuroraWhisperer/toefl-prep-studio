from difflib import SequenceMatcher
import re

def normalize(text):
    return re.findall(r"[a-z]+", text.lower())

def compare(original, answer):

    o=normalize(original)
    a=normalize(answer)

    missing=[x for x in o if x not in a]

    ratio=SequenceMatcher(
        None,
        " ".join(o),
        " ".join(a)
    ).ratio()

    return {
        "accuracy":round(ratio*100,1),
        "missing_words":missing
    }