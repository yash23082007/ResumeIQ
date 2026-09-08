import re
from datetime import datetime

def parse_date(date_str: str):
    """Parse a date string into a datetime object."""
    date_str = date_str.strip().lower()
    if date_str in ["present", "current", "now"]:
        return datetime.now()
    
    # Try different formats
    # e.g., 08/2023, 8/2023
    m = re.match(r"(\d{1,2})[/\-](\d{4})", date_str)
    if m:
        try:
            return datetime(int(m.group(2)), int(m.group(1)), 1)
        except ValueError:
            pass
    
    # e.g., Aug 2023, August 2023
    m = re.match(r"([a-z]+)\s+(\d{4})", date_str)
    if m:
        month_str = m.group(1)[:3]
        months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
        if month_str in months:
            try:
                return datetime(int(m.group(2)), months.index(month_str) + 1, 1)
            except ValueError:
                pass
            
    # e.g., 2023
    m = re.match(r"(\d{4})", date_str)
    if m:
        try:
            return datetime(int(m.group(1)), 1, 1)
        except ValueError:
            pass
        
    return None

def compute_total_experience_years(experience_text: str) -> float:
    """Compute total years of experience from a text block by extracting date ranges."""
    if not experience_text:
        return 0.0
        
    # Matches: Aug 2023 - Present, 08/2023 – 12/2024, 2020 to 2023
    date_range_pattern = re.compile(
        r"((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}|\d{1,2}[/\-]\d{4}|\d{4})\s*[-–to]+\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}|\d{1,2}[/\-]\d{4}|\d{4}|present|current|now)",
        re.IGNORECASE
    )
    
    total_days = 0
    matches = date_range_pattern.findall(experience_text)
    
    intervals = []
    for match in matches:
        start_date = parse_date(match[0])
        end_date = parse_date(match[1])
        if start_date and end_date and end_date >= start_date:
            intervals.append((start_date, end_date))
            
    if not intervals:
        return 0.0
        
    # Merge overlapping intervals
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for current_start, current_end in intervals[1:]:
        last_start, last_end = merged[-1]
        if current_start <= last_end:
            merged[-1] = (last_start, max(last_end, current_end))
        else:
            merged.append((current_start, current_end))
            
    for start, end in merged:
        total_days += (end - start).days
        
    return round(total_days / 365.25, 1)
