from datetime import datetime, timedelta
import re
import calendar

def get_today_str():
    return datetime.now().strftime("%Y-%m-%d")

def get_tomorrow_str():
    return (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

def get_next_weekend_range():
    today = datetime.now()
    # weekday(): Monday = 0, Sunday = 6
    saturday_offset = (5 - today.weekday()) % 7
    sunday_offset = (6 - today.weekday()) % 7
    
    saturday = today + timedelta(days=saturday_offset)
    sunday = today + timedelta(days=sunday_offset)

    return saturday.strftime("%Y-%m-%d"), sunday.strftime("%Y-%m-%d")

def get_next_friday():
    today = datetime.now()
    friday_offset = (4 - today.weekday()) % 7
    next_friday = today + timedelta(days=friday_offset)
    return next_friday.strftime("%Y-%m-%d")


def interpret_natural_date(user_text: str) -> dict:
    """
    Returns:
    {
        "single_date": "YYYY-MM-DD" or None,
        "range": ("YYYY-MM-DD","YYYY-MM-DD") or None,
        "notes": "after 7 pm" etc.
    }
    """

    text = user_text.lower().strip()

    # tonight → today
    if "tonight" in text:
        return {"single_date": get_today_str(), "range": None}

    # today
    if "today" in text:
        return {"single_date": get_today_str(), "range": None}

    # tomorrow
    if "tomorrow" in text:
        return {"single_date": get_tomorrow_str(), "range": None}

    # this weekend → sat–sun
    if "this weekend" in text:
        sat, sun = get_next_weekend_range()
        return {"single_date": None, "range": (sat, sun)}

    # next friday
    if "next friday" in text:
        return {"single_date": get_next_friday(), "range": None}

    # “after 7 pm today”
    if "after" in text and "pm" in text and "today" in text:
        return {
            "single_date": get_today_str(),
            "range": None,
            "notes": text
        }

    # explicit dates “25 July 2025”
    try:
        parsed = datetime.strptime(text, "%d %B %Y")
        return {
            "single_date": parsed.strftime("%Y-%m-%d"),
            "range": None
        }
    except:
        pass

    return {"single_date": None, "range": None}
