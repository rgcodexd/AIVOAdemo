from fpdf import FPDF
from datetime import datetime

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Deviation / Incident Report', border=False, align='C')
        self.ln(20)

    def chapter_title(self, title):
        self.set_font('helvetica', 'B', 12)
        self.set_fill_color(200, 220, 255)
        self.cell(0, 10, title, border=True, fill=True)
        self.ln(10)

    def chapter_body(self, body):
        self.set_font('helvetica', '', 11)
        self.multi_cell(0, 8, body)
        self.ln()

pdf = PDF()
pdf.add_page()

# Meta Info
pdf.set_font('helvetica', 'B', 11)
pdf.cell(40, 8, 'Report Date:')
pdf.set_font('helvetica', '', 11)
pdf.cell(100, 8, datetime.now().strftime('%Y-%m-%d'))
pdf.ln(8)

pdf.set_font('helvetica', 'B', 11)
pdf.cell(40, 8, 'Reported By:')
pdf.set_font('helvetica', '', 11)
pdf.cell(100, 8, 'John Doe, Quality Assurance')
pdf.ln(15)

pdf.chapter_title('1. Basic Information')
basic_info = (
    "Site / Plant: API Manufacturing Unit\n"
    "Date of Occurrence: 2026-09-23\n"
    "Source of Deviation: Quality Control (QC)\n"
    "Related Product / Material: Metformin Hydrochloride API\n"
    "Batch / Lot Number: MFH-2609-042\n"
)
pdf.chapter_body(basic_info)

pdf.chapter_title('2. Deviation Details')
deviation_details = (
    "Description of Event:\n"
    "During routine QC testing of Batch MFH-2609-042, an Out-of-Specification (OOS) result was observed "
    "for the Assay parameter. The result obtained was 96.5%, which is below the lower limit of 98.0%. "
    "The analysis was repeated by a second analyst using the same sample preparation, and a result of 96.7% "
    "was obtained, confirming the initial OOS finding.\n\n"
    "Immediate actions taken:\n"
    "The batch has been quarantined, and a hold label was applied. The production team has been notified to "
    "halt any further processing or packaging of the related intermediate batches until the root cause is identified."
)
pdf.chapter_body(deviation_details)

pdf.chapter_title('3. Initial Assessment')
assessment = (
    "Initial Impact Assessment: The impact is expected to be High as this concerns the primary active ingredient "
    "and fails the critical Assay specification, meaning the batch cannot be released.\n"
    "Initial Severity: Critical"
)
pdf.chapter_body(assessment)

pdf.output("d:\\Project\\AIVOAdemo\\test\\sample_deviation.pdf")
print("PDF created successfully!")
