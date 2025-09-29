import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel } from 'docx';
import type { Annotations } from '@/types';

export interface ExportOptions {
  includeGraph: boolean;
  includeSummary: boolean;
  includeAnnotations: boolean;
  format: 'pdf' | 'docx';
  title?: string;
}

export interface ExportData {
  graphImageBase64?: string;
  summary?: string;
  annotations: Annotations;
  documentTitle: string;
}

/**
 * Export service for generating PDF and Word documents
 */
export class ExportService {
  
  /**
   * Capture the knowledge graph as an image
   */
  static async captureGraphImage(elementSelector: string): Promise<string> {
    const element = document.querySelector(elementSelector) as HTMLElement;
    if (!element) {
      throw new Error('Graph element not found');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#000000',
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true,
      allowTaint: true
    });

    return canvas.toDataURL('image/png');
  }

  /**
   * Export to PDF format
   */
  static async exportToPdf(data: ExportData, options: ExportOptions): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // Title Page
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.documentTitle || 'Legal Document Analysis Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 30;

    // Knowledge Graph
    if (options.includeGraph && data.graphImageBase64) {
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Knowledge Graph', margin, currentY);
      currentY += 15;

      try {
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (imgWidth * 9) / 16; // 16:9 aspect ratio

        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(data.graphImageBase64, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 20;
      } catch (error) {
        console.error('Error adding graph image to PDF:', error);
        pdf.setFontSize(12);
        pdf.text('Error: Could not include graph image', margin, currentY);
        currentY += 15;
      }
    }

    // Document Summary
    if (options.includeSummary && data.summary) {
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Document Summary', margin, currentY);
      currentY += 15;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const summaryLines = pdf.splitTextToSize(data.summary, pageWidth - 2 * margin);
      for (const line of summaryLines) {
        if (currentY > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.text(line, margin, currentY);
        currentY += 6;
      }
      currentY += 15;
    }

    // Annotations
    if (options.includeAnnotations && Object.keys(data.annotations).length > 0) {
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Annotations & Comments', margin, currentY);
      currentY += 15;

      Object.entries(data.annotations).forEach(([targetId, annotations]) => {
        if (annotations.length === 0) return;

        if (currentY > pageHeight - 40) {
          pdf.addPage();
          currentY = margin;
        }

        // Target header
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const targetLabel = targetId.startsWith('edge-') ? 
          `Edge: ${targetId.replace('edge-', '').replace('-', ' → ')}` : 
          `Node: ${targetId}`;
        pdf.text(targetLabel, margin, currentY);
        currentY += 10;

        // Comments
        annotations.forEach((annotation, index) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${annotation.author} - ${new Date(annotation.createdAt).toLocaleDateString()}`, margin + 5, currentY);
          currentY += 5;

          pdf.setFont('helvetica', 'normal');
          const commentLines = pdf.splitTextToSize(annotation.text, pageWidth - 2 * margin - 10);
          for (const line of commentLines) {
            if (currentY > pageHeight - margin) {
              pdf.addPage();
              currentY = margin;
            }
            pdf.text(line, margin + 5, currentY);
            currentY += 5;
          }
          currentY += 5;
        });

        currentY += 10;
      });
    }

    // Save the PDF
    const fileName = `${data.documentTitle.replace(/[^a-z0-9]/gi, '_')}_analysis.pdf`;
    pdf.save(fileName);
  }

  /**
   * Export to Word document format
   */
  static async exportToDocx(data: ExportData, options: ExportOptions): Promise<void> {
    const sections: any[] = [];

    // Title
    sections.push(
      new Paragraph({
        text: data.documentTitle || 'Legal Document Analysis Report',
        heading: HeadingLevel.TITLE,
        alignment: 'center',
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated on ${new Date().toLocaleDateString()}`,
            italics: true,
          }),
        ],
        alignment: 'center',
        spacing: { after: 400 },
      })
    );

    // Knowledge Graph Section
    if (options.includeGraph && data.graphImageBase64) {
      sections.push(
        new Paragraph({
          text: 'Knowledge Graph',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      try {
        // Convert base64 to buffer
        const base64Data = data.graphImageBase64.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        sections.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 600,
                  height: 400,
                },
              }),
            ],
            alignment: 'center',
            spacing: { after: 400 },
          })
        );
      } catch (error) {
        console.error('Error adding graph image to Word doc:', error);
        sections.push(
          new Paragraph({
            text: 'Error: Could not include graph image',
            spacing: { after: 200 },
          })
        );
      }
    }

    // Document Summary Section
    if (options.includeSummary && data.summary) {
      sections.push(
        new Paragraph({
          text: 'Document Summary',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: data.summary,
          spacing: { after: 400 },
        })
      );
    }

    // Annotations Section
    if (options.includeAnnotations && Object.keys(data.annotations).length > 0) {
      sections.push(
        new Paragraph({
          text: 'Annotations & Comments',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );

      Object.entries(data.annotations).forEach(([targetId, annotations]) => {
        if (annotations.length === 0) return;

        const targetLabel = targetId.startsWith('edge-') ? 
          `Edge: ${targetId.replace('edge-', '').replace('-', ' → ')}` : 
          `Node: ${targetId}`;

        sections.push(
          new Paragraph({
            text: targetLabel,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          })
        );

        annotations.forEach((annotation) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${annotation.author} - ${new Date(annotation.createdAt).toLocaleDateString()}`,
                  bold: true,
                  size: 20,
                }),
              ],
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: annotation.text,
              spacing: { after: 200 },
            })
          );
        });
      });
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    // Generate and save
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.documentTitle.replace(/[^a-z0-9]/gi, '_')}_analysis.docx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Main export function
   */
  static async exportReport(data: ExportData, options: ExportOptions): Promise<void> {
    try {
      if (options.format === 'pdf') {
        await this.exportToPdf(data, options);
      } else {
        await this.exportToDocx(data, options);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Failed to export ${options.format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
