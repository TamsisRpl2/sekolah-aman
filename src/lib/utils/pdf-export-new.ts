import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MonthlyReportResponse, ClassViolationData } from '@/types/monthly-report'

export async function generateMonthlyReportPDF(data: MonthlyReportResponse) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  
  // Professional color scheme
  const primaryColor: [number, number, number] = [22, 163, 74]  // Green-600
  const secondaryColor: [number, number, number] = [107, 114, 128]  // Gray-500
  const accentColor: [number, number, number] = [240, 253, 244]  // Green-50
  const textColor: [number, number, number] = [31, 41, 55]  // Gray-800
  
  let currentY = 30

  // === CLEAN HEADER ===
  // Title
  doc.setFontSize(18)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text('LAPORAN BULANAN PELANGGARAN SISWA', pageWidth / 2, currentY, { align: 'center' })
  
  currentY += 8
  
  // Subtitle
  doc.setFontSize(12)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('SMK Taman Siswa 2 Jakarta', pageWidth / 2, currentY, { align: 'center' })
  
  currentY += 6
  const periodText = `Periode: ${getMonthName(data.period.month)} ${data.period.year}`
  doc.text(periodText, pageWidth / 2, currentY, { align: 'center' })
  
  currentY += 4
  const dateRangeText = `${data.period.startDate} s/d ${data.period.endDate}`
  doc.setFontSize(10)
  doc.text(dateRangeText, pageWidth / 2, currentY, { align: 'center' })
  
  // Header line
  currentY += 10
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setLineWidth(0.8)
  doc.line(30, currentY, pageWidth - 30, currentY)
  
  currentY += 20

  // === STATISTICS SECTION ===
  doc.setFontSize(14)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text('STATISTIK PELANGGARAN', 30, currentY)
  
  currentY += 15

  // Statistics boxes in a 3x2 grid
  const boxWidth = 55
  const boxHeight = 30
  const boxSpacing = 15
  const rowSpacing = 12
  const totalGridWidth = (boxWidth * 3) + (boxSpacing * 2)
  const gridStartX = (pageWidth - totalGridWidth) / 2

  // Row 1
  // Box 1: Total Violations
  let boxX = gridStartX
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'F')
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.setLineWidth(0.5)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'S')

  doc.setFontSize(9)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('Total Pelanggaran', boxX + boxWidth/2, currentY + 10, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.text(data.stats.totalViolations.toString(), boxX + boxWidth/2, currentY + 22, { align: 'center' })

  // Box 2: Resolved Cases
  boxX += boxWidth + boxSpacing
  doc.setFillColor(240, 253, 244)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'F')
  doc.setDrawColor(34, 197, 94)
  doc.setLineWidth(0.5)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'S')

  doc.setFontSize(9)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('Terselesaikan', boxX + boxWidth/2, currentY + 10, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setTextColor(34, 197, 94)
  doc.text(data.stats.totalResolved.toString(), boxX + boxWidth/2, currentY + 22, { align: 'center' })

  // Box 3: Pending Cases
  boxX += boxWidth + boxSpacing
  doc.setFillColor(254, 249, 195)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'F')
  doc.setDrawColor(245, 158, 11)
  doc.setLineWidth(0.5)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'S')

  doc.setFontSize(9)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('Pending', boxX + boxWidth/2, currentY + 10, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setTextColor(245, 158, 11)
  doc.text(data.stats.totalPending.toString(), boxX + boxWidth/2, currentY + 22, { align: 'center' })

  currentY += boxHeight + rowSpacing

  // Row 2
  // Box 4: Problem Students
  boxX = gridStartX
  doc.setFillColor(254, 242, 242)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'F')
  doc.setDrawColor(239, 68, 68)
  doc.setLineWidth(0.5)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'S')

  doc.setFontSize(9)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('Siswa Bermasalah', boxX + boxWidth/2, currentY + 10, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setTextColor(239, 68, 68)
  doc.text(data.stats.totalProblemStudents.toString(), boxX + boxWidth/2, currentY + 22, { align: 'center' })

  // Box 5: Resolution Rate
  boxX += boxWidth + boxSpacing
  doc.setFillColor(239, 246, 255)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'F')
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'S')

  doc.setFontSize(9)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('Tingkat Penyelesaian', boxX + boxWidth/2, currentY + 10, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setTextColor(59, 130, 246)
  doc.text(`${data.stats.resolutionRate}%`, boxX + boxWidth/2, currentY + 22, { align: 'center' })

  // Box 6: Average Violations
  boxX += boxWidth + boxSpacing
  doc.setFillColor(250, 245, 255)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'F')
  doc.setDrawColor(147, 51, 234)
  doc.setLineWidth(0.5)
  doc.rect(boxX, currentY, boxWidth, boxHeight, 'S')

  doc.setFontSize(9)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text('Rata-rata/Siswa', boxX + boxWidth/2, currentY + 10, { align: 'center' })
  
  doc.setFontSize(16)
  doc.setTextColor(147, 51, 234)
  doc.text(data.stats.avgViolationsPerStudent.toFixed(1), boxX + boxWidth/2, currentY + 22, { align: 'center' })

  currentY += boxHeight + 25

  // === SUMMARY SECTION ===
  doc.setFontSize(14)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text('RINGKASAN', 30, currentY)
  
  currentY += 10

  // Summary box
  doc.setFillColor(250, 250, 250)
  doc.rect(30, currentY, pageWidth - 60, 35, 'F')
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.rect(30, currentY, pageWidth - 60, 35, 'S')

  doc.setFontSize(10)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  const summaryText = `Pada periode ${getMonthName(data.period.month)} ${data.period.year}, tercatat ${data.stats.totalViolations} pelanggaran siswa dengan ${data.stats.totalPending} kasus yang masih dalam proses penanganan. Tingkat penyelesaian mencapai ${data.stats.resolutionRate}%. Kelas dengan masalah terbanyak adalah ${data.stats.mostProblematicClass}. Total siswa bermasalah sebanyak ${data.stats.totalProblemStudents} siswa dengan rata-rata ${data.stats.avgViolationsPerStudent.toFixed(1)} pelanggaran per siswa.`
  const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 80)
  
  let summaryY = currentY + 8
  summaryLines.forEach((line: string) => {
    doc.text(line, 35, summaryY)
    summaryY += 5
  })

  currentY += 45

  // === VIOLATION TYPES SECTION ===
  if (data.violationsByType && data.violationsByType.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text('DISTRIBUSI JENIS PELANGGARAN', 30, currentY)
    
    currentY += 10

    // Prepare violation types table data
    const violationTypesData = data.violationsByType.map((item) => [
      item.type,
      item.count.toString(),
      `${item.percentage}%`
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Jenis Pelanggaran', 'Jumlah Kasus', 'Persentase']],
      body: violationTypesData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 30, right: 30 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' }
      }
    })

    currentY = (doc as any).lastAutoTable.finalY + 20
  }

  // === WEEKLY TREND SECTION ===
  if (data.monthlyData && data.monthlyData.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text('TREND PELANGGARAN MINGGUAN', 30, currentY)
    
    currentY += 10

    // Prepare weekly data table
    const weeklyData = data.monthlyData.map((week) => [
      week.week,
      week.violations.toString(),
      week.resolved.toString(),
      week.pending.toString()
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Minggu', 'Pelanggaran', 'Terselesaikan', 'Pending']],
      body: weeklyData,
      theme: 'striped',
      headStyles: {
        fillColor: [147, 51, 234],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 30, right: 30 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' }
      }
    })

    currentY = (doc as any).lastAutoTable.finalY + 20
  }

  // === CLASS VIOLATIONS TABLE ===
  if (data.violationsByClass && data.violationsByClass.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text('DATA PELANGGARAN PER KELAS', 30, currentY)
    
    currentY += 10

    // Prepare table data
    const tableData = data.violationsByClass.map((classItem: ClassViolationData) => [
      classItem.class,
      classItem.violations.toString(),
      classItem.problemStudents.toString(),
      classItem.avgViolationsPerStudent.toFixed(1)
    ])

    // Add table
    autoTable(doc, {
      startY: currentY,
      head: [['Kelas', 'Pelanggaran', 'Siswa Bermasalah', 'Rata-rata/Siswa']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: textColor
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 30, right: 30 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35, halign: 'center' },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' }
      }
    })

    currentY = (doc as any).lastAutoTable.finalY + 20
  }

  // === RECOMMENDATIONS ===
  if (currentY > pageHeight - 80) {
    doc.addPage()
    currentY = 30
  }

  doc.setFontSize(14)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  doc.text('REKOMENDASI', 30, currentY)
  
  currentY += 15

  const recommendations = [
    '• Meningkatkan sosialisasi tata tertib sekolah kepada seluruh siswa',
    '• Melakukan pendampingan intensif untuk siswa dengan pelanggaran berulang',
    '• Mengadakan program pembinaan karakter dan kedisiplinan',
    '• Koordinasi lebih erat antara guru BK dengan wali kelas',
    '• Melibatkan orang tua dalam proses pembinaan siswa'
  ]

  doc.setFontSize(10)
  doc.setTextColor(textColor[0], textColor[1], textColor[2])
  
  recommendations.forEach(rec => {
    const lines = doc.splitTextToSize(rec, pageWidth - 80)
    lines.forEach((line: string) => {
      doc.text(line, 35, currentY)
      currentY += 6
    })
    currentY += 2
  })

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages()
  
  // Add footer to all pages
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const footerY = pageHeight - 30
    
    // Footer line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.5)
    doc.line(30, footerY - 5, pageWidth - 30, footerY - 5)
    
    // Footer text
    doc.setFontSize(9)
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    
    const today = new Date()
    const dateStr = today.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    doc.text(`Dicetak pada: ${dateStr}`, 30, footerY + 5)
    doc.text('SMK Taman Siswa 2 Jakarta', pageWidth / 2, footerY + 5, { align: 'center' })
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - 30, footerY + 5, { align: 'right' })
  }

  // Save the PDF
  const fileName = `Laporan_Bulanan_SMK_Taman_Siswa_2_${getMonthName(data.period.month)}_${data.period.year}.pdf`
  doc.save(fileName)
}

// Helper function to get month name
function getMonthName(month: number): string {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return monthNames[month - 1] || 'Unknown'
}

// Keep the old function name for backward compatibility
export const exportMonthlyReportToPDF = generateMonthlyReportPDF
