import os
import subprocess
import sys
import re

# Tự động cài đặt thư viện python-docx nếu chưa có
try:
    from docx import Document
    from docx.shared import Inches, Pt
    from docx.enum.text import WD_ALIGN_PARAGRAPH
except ImportError:
    print("Đang cài đặt thư viện python-docx...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx", "--break-system-packages"])
        from docx import Document
        from docx.shared import Inches, Pt
        from docx.enum.text import WD_ALIGN_PARAGRAPH
    except Exception as e:
        print(f"Không thể cài đặt thư viện: {e}")
        sys.exit(1)

def markdown_to_docx(md_path, docx_path):
    if not os.path.exists(md_path):
        print(f"Không tìm thấy file: {md_path}")
        return

    doc = Document()
    
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    in_table = False
    table_data = []

    for line in lines:
        original_line = line.rstrip()
        line = original_line.strip()

        # Xử lý Bảng (Table)
        if line.startswith('|'):
            if '---' in line and '|' in line: # Dòng phân cách |---|---|
                continue
            
            in_table = True
            # Tách các cột
            cells = [c.strip() for c in original_line.split('|')]
            # Loại bỏ phần tử rỗng ở đầu và cuối do dấu | ở 2 đầu
            if original_line.startswith('|'): cells = cells[1:]
            if original_line.endswith('|'): cells = cells[:-1]
            
            if cells:
                table_data.append(cells)
            continue
        else:
            if in_table:
                # Kết thúc bảng, vẽ vào docx
                if table_data:
                    num_rows = len(table_data)
                    num_cols = max(len(r) for r in table_data)
                    table = doc.add_table(rows=num_rows, cols=num_cols)
                    table.style = 'Table Grid'
                    for i, row_data in enumerate(table_data):
                        for j, cell_text in enumerate(row_data):
                            if j < num_cols:
                                # Xóa định dạng markdown đơn giản
                                clean_cell = cell_text.replace('**', '').replace('__', '')
                                table.cell(i, j).text = clean_cell
                    doc.add_paragraph() # Dòng trống sau bảng
                table_data = []
                in_table = False

        # Xử lý Tiêu đề (Headers)
        if line.startswith('# '):
            doc.add_heading(line[2:], level=0)
        elif line.startswith('## '):
            doc.add_heading(line[3:], level=1)
        elif line.startswith('### '):
            doc.add_heading(line[4:], level=2)
        
        # Xử lý Danh sách (Lists)
        elif line.startswith('- ') or line.startswith('* '):
            doc.add_paragraph(line[2:], style='List Bullet')
        
        # Văn bản thường
        elif line:
            if not in_table:
                # Xử lý in đậm đơn giản **text**
                clean_text = line.replace('**', '').replace('__', '')
                doc.add_paragraph(clean_text)
        elif not line and not in_table:
            # Dòng trống (Paragraph break)
            pass

    doc.save(docx_path)
    print(f"Đã chuyển đổi thành công: {docx_path}")

if __name__ == "__main__":
    # Sử dụng đường dẫn tương đối từ gốc project
    INPUT_FILE = "docs/UNIFIED_WORKSPACE_PROPOSAL.md"
    OUTPUT_FILE = "docs/UNIFIED_WORKSPACE_PROPOSAL.docx"
    
    markdown_to_docx(INPUT_FILE, OUTPUT_FILE)
