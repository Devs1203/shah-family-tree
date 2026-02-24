"""
High-quality screenshot of Shah Family Tree.
Uses 2x device scale factor for sharp text rendering.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
HTML_FILE = SCRIPT_DIR / "index.html"
OUTPUT_FILE = SCRIPT_DIR / "family-tree-final.jpg"

print("Taking high-quality screenshot (2x scale)...")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 3200, "height": 1600}, device_scale_factor=2)
    page.goto(f"file:///{HTML_FILE.resolve().as_posix()}")
    page.wait_for_timeout(4000)

    dims = page.evaluate("""() => {
        const root = document.getElementById('root');
        if (!root) return null;
        const container = root.firstElementChild;
        if (!container) return null;
        const allDivs = container.querySelectorAll('div');
        let maxBottom = 0;
        for (const d of allDivs) {
            const r = d.getBoundingClientRect();
            if (r.bottom > maxBottom) maxBottom = r.bottom;
        }
        return {
            width: Math.ceil(Math.max(container.scrollWidth, container.getBoundingClientRect().width)),
            height: Math.ceil(maxBottom) + 10
        };
    }""")

    w = dims['width'] if dims else 3000
    h = dims['height'] if dims else 1200
    print(f"Content: {w}x{h} (output will be {w*2}x{h*2} pixels)")

    page.set_viewport_size({"width": w, "height": h})
    page.wait_for_timeout(500)

    page.screenshot(
        path=str(OUTPUT_FILE),
        type="jpeg",
        quality=100,
        clip={"x": 0, "y": 0, "width": w, "height": h}
    )
    browser.close()

print(f"Screenshot saved to: {OUTPUT_FILE}")
print(f"Size: {OUTPUT_FILE.stat().st_size / 1024:.1f} KB")
