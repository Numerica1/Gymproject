import os

def extract_pdf_text():
    pdf_path = "learnmore.pdf"
    output_path = "learnmore_text.txt"
    
    # Try importing pypdf
    try:
        import pypdf
        print("Using pypdf")
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for i, page in enumerate(reader.pages):
            text += f"--- Page {i+1} ---\n"
            text += page.extract_text() + "\n"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print("Successfully extracted using pypdf")
        return True
    except ImportError:
        pass

    # Try importing pdfplumber
    try:
        import pdfplumber
        print("Using pdfplumber")
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text += f"--- Page {i+1} ---\n"
                text += page.extract_text() + "\n"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print("Successfully extracted using pdfplumber")
        return True
    except ImportError:
        pass

    # Try importing fitz (PyMuPDF)
    try:
        import fitz
        print("Using fitz")
        doc = fitz.open(pdf_path)
        text = ""
        for i, page in enumerate(doc):
            text += f"--- Page {i+1} ---\n"
            text += page.get_text() + "\n"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print("Successfully extracted using fitz")
        return True
    except ImportError:
        pass

    # Try importing pdfminer
    try:
        from pdfminer.high_level import extract_text
        print("Using pdfminer")
        text = extract_text(pdf_path)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        print("Successfully extracted using pdfminer")
        return True
    except ImportError:
        pass

    print("No library could be imported. Let's write a simple script to download/install pypdf via pip, or we can use another method.")
    return False

if __name__ == "__main__":
    extract_pdf_text()
