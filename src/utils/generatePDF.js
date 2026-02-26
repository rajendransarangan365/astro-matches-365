import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// ──────────────────────────────────────────────
// Hybrid PDF Generator
// Uses a hidden light-themed HTML div + html2canvas for proper Tamil rendering,
// then assembles into a professional A4 PDF with jsPDF.
// ──────────────────────────────────────────────

function stripBold(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
}

function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Build the complete HTML content for the PDF
function buildPDFHtml(data) {
    const { results, recommendation, canMarry, bride, groom, doshamResult, summaryReport } = data;
    const percentage = summaryReport?.percentage || 0;
    const today = new Date().toLocaleDateString('ta-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    // Parse lifeSummary into HTML blocks
    let lifeSummaryHtml = '';
    if (summaryReport?.lifeSummary) {
        const lines = summaryReport.lifeSummary.split('\n').filter(l => l.trim());
        for (const line of lines) {
            const trimmed = line.trim();
            const plain = escapeHtml(stripBold(trimmed));

            if (trimmed.startsWith('## ')) {
                lifeSummaryHtml += `<h3 style="color:#7c3aed;font-size:13px;margin:18px 0 8px;padding-bottom:6px;border-bottom:2px solid #e9d5ff;">${escapeHtml(trimmed.replace('## ', ''))}</h3>`;
            } else if (trimmed.startsWith('### ')) {
                lifeSummaryHtml += `<h4 style="color:#d97706;font-size:12px;margin:14px 0 6px;">${escapeHtml(trimmed.replace('### ', ''))}</h4>`;
            } else if (trimmed.startsWith('⛔') || trimmed.startsWith('🚨')) {
                lifeSummaryHtml += `<div style="background:#fef2f2;border-left:4px solid #ef4444;padding:8px 12px;margin:6px 0;border-radius:4px;color:#991b1b;font-size:11px;line-height:1.7;">${plain}</div>`;
            } else if (trimmed.startsWith('✅') && trimmed.includes('திருமணம்')) {
                lifeSummaryHtml += `<div style="background:#f0fdf4;border-left:4px solid #22c55e;padding:8px 12px;margin:6px 0;border-radius:4px;color:#166534;font-size:11px;line-height:1.7;">${plain}</div>`;
            } else if (trimmed.startsWith('🟡') || trimmed.startsWith('⚠️')) {
                lifeSummaryHtml += `<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:8px 12px;margin:6px 0;border-radius:4px;color:#92400e;font-size:11px;line-height:1.7;">${plain}</div>`;
            } else {
                const isRemedy = /^[🔱🪔🐄🙏🔴💎⚖️🛡️🪷✅]/u.test(trimmed);
                if (isRemedy) {
                    lifeSummaryHtml += `<div style="border-left:3px solid #a855f7;padding:4px 10px;margin:4px 0;font-size:11px;line-height:1.8;color:#1e1e1e;">${plain}</div>`;
                } else {
                    lifeSummaryHtml += `<p style="font-size:11px;line-height:1.8;color:#1e1e1e;margin:4px 0;">${plain}</p>`;
                }
            }
        }
    }

    // Porutham table rows
    const tableRows = Object.entries(results).map(([key, value], i) => {
        const isMatch = value.status === 'Match';
        const isNoMatch = value.status === 'No Match';
        const statusColor = isMatch ? '#16a34a' : isNoMatch ? '#dc2626' : '#6b7280';
        const statusText = isMatch ? 'பொருத்தம் ✓' : isNoMatch ? 'பொருத்தம் இல்லை ✗' : 'சமம் –';
        const bgColor = i % 2 === 0 ? '#ffffff' : '#fafaff';
        return `<tr style="background:${bgColor}">
            <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:12px;color:#1e1e1e;">${escapeHtml(value.name || key)}</td>
            <td style="padding:10px 14px;border:1px solid #e5e7eb;font-size:12px;color:${statusColor};font-weight:bold;text-align:center;">${statusText}</td>
        </tr>`;
    }).join('');

    // Dosha section
    let doshaHtml = '';
    if (doshamResult) {
        const doshaMatch = doshamResult.match === 'Match';
        const doshaVerdictColor = doshaMatch ? '#16a34a' : doshamResult.match === 'No Match' ? '#dc2626' : '#6b7280';
        const doshaVerdictBg = doshaMatch ? '#f0fdf4' : doshamResult.match === 'No Match' ? '#fef2f2' : '#f9fafb';
        const brideDetails = doshamResult.bride.details.length > 0
            ? doshamResult.bride.details.map(d => `<li style="color:#991b1b;font-size:10px;margin:2px 0;">${escapeHtml(d)}</li>`).join('')
            : '<div style="color:#16a34a;font-size:11px;">தோஷம் இல்லை</div>';
        const groomDetails = doshamResult.groom.details.length > 0
            ? doshamResult.groom.details.map(d => `<li style="color:#991b1b;font-size:10px;margin:2px 0;">${escapeHtml(d)}</li>`).join('')
            : '<div style="color:#16a34a;font-size:11px;">தோஷம் இல்லை</div>';

        doshaHtml = `
        <div style="margin-top:20px;">
            <h3 style="color:#d97706;font-size:14px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #fde68a;">⚖️ பாபசாம்யம் (Dosha Analysis)</h3>
            <div style="display:flex;gap:12px;margin-bottom:10px;">
                <div style="flex:1;background:#fff5f7;border:1px solid #f9a8d4;border-radius:8px;padding:12px;">
                    <div style="color:#be185d;font-weight:bold;font-size:11px;margin-bottom:6px;">பெண் (Bride)</div>
                    <div style="font-size:18px;font-weight:bold;color:#1e1e1e;">${doshamResult.bride.points} <span style="font-size:10px;font-weight:normal;color:#6b7280;">புள்ளிகள்</span></div>
                    ${doshamResult.bride.details.length > 0 ? `<ul style="padding-left:16px;margin:6px 0 0;">${brideDetails}</ul>` : brideDetails}
                </div>
                <div style="flex:1;background:#f0f7ff;border:1px solid #93c5fd;border-radius:8px;padding:12px;">
                    <div style="color:#1d4ed8;font-weight:bold;font-size:11px;margin-bottom:6px;">ஆண் (Groom)</div>
                    <div style="font-size:18px;font-weight:bold;color:#1e1e1e;">${doshamResult.groom.points} <span style="font-size:10px;font-weight:normal;color:#6b7280;">புள்ளிகள்</span></div>
                    ${doshamResult.groom.details.length > 0 ? `<ul style="padding-left:16px;margin:6px 0 0;">${groomDetails}</ul>` : groomDetails}
                </div>
            </div>
            <div style="background:${doshaVerdictBg};border-radius:6px;padding:10px 14px;">
                <span style="color:${doshaVerdictColor};font-weight:bold;font-size:11px;">${doshaMatch ? '✓' : '✗'} முடிவு: ${escapeHtml(doshamResult.recommendation || '')}</span>
            </div>
        </div>`;
    }

    // Pros and Cons
    const prosHtml = (summaryReport?.pros && summaryReport.pros.length > 0)
        ? summaryReport.pros.map(p => `<li style="font-size:11px;color:#1e1e1e;margin:3px 0;">${escapeHtml(p)}</li>`).join('')
        : '<li style="font-size:11px;color:#6b7280;">குறிப்பிடத்தக்கவை இல்லை</li>';
    const consHtml = (summaryReport?.cons && summaryReport.cons.length > 0)
        ? summaryReport.cons.map(c => `<li style="font-size:11px;color:#1e1e1e;margin:3px 0;">${escapeHtml(c)}</li>`).join('')
        : '<li style="font-size:11px;color:#6b7280;">குறிப்பிடத்தக்க குறைகள் இல்லை</li>';

    const verdictBgColor = canMarry ? '#f0fdf4' : '#fef2f2';
    const verdictBorderColor = canMarry ? '#22c55e' : '#ef4444';
    const verdictTextColor = canMarry ? '#166534' : '#991b1b';

    return `
    <div id="pdf-render-root" style="
        width: 700px;
        font-family: 'Noto Sans Tamil', 'Segoe UI', Arial, sans-serif;
        background: #ffffff;
        color: #1e1e1e;
        padding: 30px;
        box-sizing: border-box;
        line-height: 1.6;
    ">
        <!-- Header -->
        <div style="text-align:center;background:#f8f5ff;border-radius:10px;padding:20px;margin-bottom:20px;border:1px solid #e9d5ff;">
            <h1 style="color:#7c3aed;font-size:20px;margin:0 0 4px;">திருமணப் பொருத்த அறிக்கை</h1>
            <div style="color:#6b7280;font-size:12px;">Marriage Compatibility Report</div>
            <div style="color:#9ca3af;font-size:10px;margin-top:4px;">${escapeHtml(today)}</div>
        </div>

        <!-- Names Row -->
        <div style="display:flex;gap:12px;margin-bottom:20px;">
            <div style="flex:1;background:#fff5f7;border:1px solid #f9a8d4;border-radius:8px;padding:14px;">
                <div style="color:#be185d;font-weight:bold;font-size:10px;letter-spacing:0.5px;margin-bottom:4px;">பெண் (Bride)</div>
                <div style="font-size:14px;font-weight:bold;color:#1e1e1e;">${escapeHtml(bride.name || 'N/A')}</div>
            </div>
            <div style="flex:1;background:#f0f7ff;border:1px solid #93c5fd;border-radius:8px;padding:14px;">
                <div style="color:#1d4ed8;font-weight:bold;font-size:10px;letter-spacing:0.5px;margin-bottom:4px;">ஆண் (Groom)</div>
                <div style="font-size:14px;font-weight:bold;color:#1e1e1e;">${escapeHtml(groom.name || 'N/A')}</div>
            </div>
        </div>

        <!-- Verdict -->
        <div style="background:${verdictBgColor};border:2px solid ${verdictBorderColor};border-radius:10px;padding:18px;text-align:center;margin-bottom:20px;">
            <div style="font-size:16px;font-weight:bold;color:${verdictTextColor};">
                ${canMarry ? '✓ பொருத்தம் உண்டு (Compatible)' : '✗ பொருத்தம் இல்லை (Not Compatible)'}
            </div>
            <div style="font-size:28px;font-weight:bold;color:${verdictTextColor};margin:6px 0;">${percentage}%</div>
            <div style="font-size:11px;color:#6b7280;">${escapeHtml(recommendation || '')}</div>
        </div>

        <!-- Porutham Table -->
        <div style="margin-bottom:20px;">
            <h3 style="color:#7c3aed;font-size:14px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e9d5ff;">பொருத்த விவரங்கள் (Porutham Details)</h3>
            <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;">
                <thead>
                    <tr style="background:#7c3aed;">
                        <th style="padding:10px 14px;color:#ffffff;font-size:12px;text-align:left;border:1px solid #7c3aed;">பொருத்தம் (Porutham)</th>
                        <th style="padding:10px 14px;color:#ffffff;font-size:12px;text-align:center;border:1px solid #7c3aed;">நிலை (Status)</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        <!-- Dosha Section -->
        ${doshaHtml}

        <!-- Summary Report -->
        ${summaryReport?.lifeSummary ? `
        <div style="margin-top:20px;">
            <h3 style="color:#7c3aed;font-size:14px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e9d5ff;">✨ ஜாதகப் பலன் &amp; அறிக்கை (Detailed Analysis)</h3>
            ${lifeSummaryHtml}
        </div>` : ''}

        <!-- Pros and Cons -->
        <div style="margin-top:20px;">
            <div style="display:flex;gap:16px;">
                <div style="flex:1;">
                    <h4 style="color:#16a34a;font-size:12px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #bbf7d0;">நிறைகள் (Pros)</h4>
                    <ul style="padding-left:18px;margin:0;">${prosHtml}</ul>
                </div>
                <div style="flex:1;">
                    <h4 style="color:#dc2626;font-size:12px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid #fecaca;">குறைகள் (Cons)</h4>
                    <ul style="padding-left:18px;margin:0;">${consHtml}</ul>
                </div>
            </div>
        </div>

        <!-- Final Verdict -->
        ${summaryReport?.verdict ? `
        <div style="margin-top:20px;">
            <h3 style="color:#7c3aed;font-size:14px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #e9d5ff;">இறுதி முடிவு (Final Verdict)</h3>
            <div style="background:#f8f5ff;border:1px solid #c4b5fd;border-radius:8px;padding:14px;font-size:11px;line-height:1.8;color:#1e1e1e;">
                ${escapeHtml(summaryReport.verdict)}
            </div>
        </div>` : ''}

        <!-- Footer -->
        <div style="margin-top:24px;padding-top:10px;border-top:1px solid #e5e7eb;text-align:center;">
            <span style="font-size:9px;color:#9ca3af;">Astro Matches 365 — Generated on ${escapeHtml(today)}</span>
        </div>
    </div>`;
}

// ──────────────────────────────────────────────
// Main Export
// ──────────────────────────────────────────────
export async function generatePoruthamPDF(data) {
    const { bride, groom } = data;

    // 1. Inject Google Fonts for Tamil (if not already)
    if (!document.getElementById('pdf-tamil-font-link')) {
        const link = document.createElement('link');
        link.id = 'pdf-tamil-font-link';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap';
        document.head.appendChild(link);
        // Wait for font to load
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // 2. Create hidden container and inject HTML
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
    container.innerHTML = buildPDFHtml(data);
    document.body.appendChild(container);

    try {
        // 3. Wait for fonts & images to settle
        await new Promise(resolve => setTimeout(resolve, 500));

        const renderRoot = container.querySelector('#pdf-render-root');

        // 4. Capture with html2canvas (browser renders Tamil perfectly)
        const canvas = await html2canvas(renderRoot, {
            scale: 2.5,   // High quality
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
        });

        // 5. Build multi-page A4 PDF
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;
        const contentWidth = pdfWidth - 2 * margin;
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeightInMm = (imgProps.height * contentWidth) / imgProps.width;

        let heightLeft = imgHeightInMm;
        let position = margin;

        // Draw border helper
        const drawBorder = () => {
            pdf.setDrawColor(180, 180, 180);
            pdf.setLineWidth(0.4);
            pdf.rect(margin - 2, margin - 2, contentWidth + 4, pdfHeight - 2 * margin + 4);
        };

        // Page 1
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeightInMm);
        // Mask outside margins with white
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, margin - 2, 'F');                      // top
        pdf.rect(0, pdfHeight - margin + 2, pdfWidth, margin, 'F');      // bottom
        pdf.rect(0, 0, margin - 2, pdfHeight, 'F');                      // left
        pdf.rect(pdfWidth - margin + 2, 0, margin, pdfHeight, 'F');      // right
        drawBorder();
        heightLeft -= (pdfHeight - 2 * margin);

        // Subsequent pages
        while (heightLeft > 0) {
            pdf.addPage();
            position -= (pdfHeight - 2 * margin);
            pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeightInMm);
            // Mask
            pdf.setFillColor(255, 255, 255);
            pdf.rect(0, 0, pdfWidth, margin - 2, 'F');
            pdf.rect(0, pdfHeight - margin + 2, pdfWidth, margin, 'F');
            pdf.rect(0, 0, margin - 2, pdfHeight, 'F');
            pdf.rect(pdfWidth - margin + 2, 0, margin, pdfHeight, 'F');
            drawBorder();
            heightLeft -= (pdfHeight - 2 * margin);
        }

        // Add page numbers
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Page ${i} of ${totalPages}`, pdfWidth / 2, pdfHeight - 5, { align: 'center' });
            pdf.text('Astro Matches 365', pdfWidth - margin, pdfHeight - 5, { align: 'right' });
        }

        // 6. Save
        const fileName = `Thirumana_Porutham_${bride.name || 'Bride'}_${groom.name || 'Groom'}.pdf`;
        pdf.save(fileName);
    } finally {
        // Cleanup
        document.body.removeChild(container);
    }
}
