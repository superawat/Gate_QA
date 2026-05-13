"""
Quick PDF structure explorer — samples first few pages of each PDF
to understand layout, fonts, chapter patterns, and question formatting.
"""
import fitz
import os
import json
import sys

PDF_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'aptitude-ssc')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'artifacts', 'aptitude-pipeline')
os.makedirs(OUTPUT_DIR, exist_ok=True)

def explore_pdf(pdf_path, sample_pages=10):
    """Extract structure info from first N pages of a PDF."""
    doc = fitz.open(pdf_path)
    filename = os.path.basename(pdf_path)
    info = {
        'filename': filename,
        'total_pages': len(doc),
        'file_size_mb': round(os.path.getsize(pdf_path) / (1024*1024), 1),
        'sample_pages': []
    }
    
    # Sample: first 5 pages, middle 3, last 2
    pages_to_check = list(range(min(5, len(doc))))
    mid = len(doc) // 2
    pages_to_check += list(range(mid, min(mid+3, len(doc))))
    pages_to_check += list(range(max(0, len(doc)-2), len(doc)))
    pages_to_check = sorted(set(pages_to_check))[:sample_pages]
    
    for page_num in pages_to_check:
        page = doc[page_num]
        text = page.get_text("text")
        
        # Get font info from text blocks
        blocks = page.get_text("dict")["blocks"]
        fonts_used = set()
        max_font_size = 0
        for block in blocks:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        fonts_used.add(f"{span['font']}:{span['size']:.1f}")
                        if span['size'] > max_font_size:
                            max_font_size = span['size']
        
        page_info = {
            'page': page_num + 1,
            'text_length': len(text),
            'text_preview': text[:500].replace('\n', '\\n'),
            'fonts': list(fonts_used)[:10],
            'max_font_size': max_font_size,
            'has_images': len(page.get_images()) > 0,
            'image_count': len(page.get_images())
        }
        info['sample_pages'].append(page_info)
    
    doc.close()
    return info

def main():
    pdfs = [f for f in os.listdir(PDF_DIR) if f.endswith('.pdf')]
    print(f"Found {len(pdfs)} PDFs in {PDF_DIR}\n")
    
    all_info = []
    for pdf_name in sorted(pdfs):
        pdf_path = os.path.join(PDF_DIR, pdf_name)
        print(f"Exploring: {pdf_name} ...", end=" ", flush=True)
        try:
            info = explore_pdf(pdf_path)
            all_info.append(info)
            print(f"OK ({info['total_pages']} pages, {info['file_size_mb']} MB)")
        except Exception as e:
            print(f"ERROR: {e}")
    
    # Write exploration report
    report_path = os.path.join(OUTPUT_DIR, 'pdf-exploration.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(all_info, f, indent=2, ensure_ascii=False)
    print(f"\nReport written to: {report_path}")
    
    # Print summary
    print("\n=== SUMMARY ===")
    for info in all_info:
        print(f"\n--- {info['filename']} ---")
        print(f"  Pages: {info['total_pages']}, Size: {info['file_size_mb']} MB")
        for sp in info['sample_pages'][:3]:
            print(f"  Page {sp['page']}: {sp['text_length']} chars, {sp['image_count']} images")
            # Show first 200 chars
            preview = sp['text_preview'][:200]
            print(f"    Preview: {preview}")

if __name__ == '__main__':
    main()
