def paginate(page: int, page_size: int) -> tuple[int, int]:
    safe_page = max(page, 1)
    safe_page_size = min(max(page_size, 1), 100)
    return (safe_page - 1) * safe_page_size, safe_page_size

