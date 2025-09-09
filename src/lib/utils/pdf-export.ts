import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MonthlyReportResponse } from '@/types/monthly-report'

// Function to load image as base64
const loadImageAsBase64 = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = src
  })
}

export const exportMonthlyReportToPDF = async (reportData: MonthlyReportResponse) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Modern color palette
  const primaryGreen = [34, 197, 94] as const     // emerald-500 - Primary color
  const lightGreen = [220, 252, 231] as const     // emerald-50 - Light background
  const darkGreen = [5, 150, 105] as const        // emerald-600 - Dark accent
  const grayText = [71, 85, 105] as const         // slate-600
  const lightGray = [248, 250, 252] as const      // slate-50

  // Modern header with clean design (no stripes)
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Add subtle overlay for depth
  doc.setFillColor(255, 255, 255, 0.05)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Add logo
  try {
    const logoBase64 = await loadImageAsBase64('/logo.png')
    const logoSize = 25
    const logoX = 15
    const logoY = 7.5
    
    // Add the actual logo
    doc.addImage(logoBase64, 'PNG', logoX, logoY, logoSize, logoSize)
  } catch (error) {
    console.log('Logo loading failed, using placeholder:', error)
    // Fallback: Logo placeholder (white circle with "TS" text)
    const logoSize = 25
    const logoX = 15
    const logoY = 7.5
    
    doc.setFillColor(255, 255, 255, 0.9)
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F')
    
    // Add "TS" text in the circle
    doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TS', logoX + logoSize/2, logoY + logoSize/2 + 2, { align: 'center' })
    
    // Logo border
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.5)
    doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'S')
  }
  
  // School name - modern typography
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('SMK TAMAN SISWA 2 JAKARTA', pageWidth / 2, 18, { align: 'center' })
  
  // Subtitle with modern styling
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('LAPORAN PELANGGARAN SISWA BULANAN', pageWidth / 2, 28, { align: 'center' })

  yPosition = 50

  // Modern info section with rounded container
  const infoContainerY = yPosition - 5
  const infoContainerHeight = 25
  
  // Subtle background container
  doc.setFillColor(248, 250, 252) // slate-50
  doc.roundedRect(15, infoContainerY, pageWidth - 30, infoContainerHeight, 5, 5, 'F')
  
  // Left side - Period info
  doc.setTextColor(grayText[0], grayText[1], grayText[2])
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const periodText = `PERIODE: ${monthNames[reportData.period.month]} ${reportData.period.year}`
  doc.text(periodText, 25, yPosition + 8)
  
  // Right side - Generation date
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(100, 116, 139) // slate-500
  const generateDate = `Dibuat: ${new Date().toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  })}`
  doc.text(generateDate, pageWidth - 25, yPosition + 8, { align: 'right' })

  yPosition += 30

  // Clean Executive Summary Card
  const summaryCardHeight = 50
  
  // Simple card background
  doc.setFillColor(248, 250, 252) // light gray background
  doc.roundedRect(20, yPosition - 5, pageWidth - 40, summaryCardHeight, 8, 8, 'F')
  
  // Clean border
  doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
  doc.setLineWidth(1.5)
  doc.roundedRect(20, yPosition - 5, pageWidth - 40, summaryCardHeight, 8, 8, 'S')
  
  // Header
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2])
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('RINGKASAN EKSEKUTIF', 30, yPosition + 8)
  
  yPosition += 18
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(grayText[0], grayText[1], grayText[2])
  
  const summary = [
    `• Total pelanggaran tercatat: ${reportData.stats.totalViolations} kasus`,
    `• Tingkat penyelesaian: ${reportData.stats.resolutionRate}% (${reportData.stats.totalResolved} dari ${reportData.stats.totalViolations} kasus)`,
    `• Jumlah siswa bermasalah: ${reportData.stats.totalProblemStudents} siswa`,
    `• Rata-rata per siswa: ${reportData.stats.avgViolationsPerStudent.toFixed(1)} kasus`,
    `• Kelas dengan masalah terbanyak: ${reportData.stats.mostProblematicClass}`
  ]

  summary.forEach(text => {
    doc.text(text, 30, yPosition)  // Better left margin
    yPosition += 6  // Increased line spacing
  })

  yPosition += 15

  // Modern Statistics Cards with enhanced design
  const cardWidth = (pageWidth - 60) / 2  // Increased margin
  const cardHeight = 35  // Increased height
  const cardSpacing = 15  // Increased spacing

  const statsCards = [
    { 
      title: 'Total Pelanggaran', 
      value: reportData.stats.totalViolations.toString(), 
      icon: 'TOT',
      color: [34, 197, 94] as const,
      bgColor: [240, 253, 244] as const // green-50
    },
    { 
      title: 'Terselesaikan', 
      value: reportData.stats.totalResolved.toString(), 
      icon: 'OK',
      color: [22, 163, 74] as const,
      bgColor: [236, 253, 245] as const // green-100
    },
    { 
      title: 'Pending', 
      value: reportData.stats.totalPending.toString(), 
      icon: 'PND',
      color: [234, 88, 12] as const,
      bgColor: [255, 247, 237] as const // orange-50
    },
    { 
      title: 'Siswa Bermasalah', 
      value: reportData.stats.totalProblemStudents.toString(), 
      icon: 'SWA',
      color: [147, 51, 234] as const,
      bgColor: [250, 245, 255] as const // purple-50
    }
  ]

  for (let i = 0; i < statsCards.length; i++) {
    const card = statsCards[i]
    const row = Math.floor(i / 2)
    const col = i % 2
    const x = 25 + col * (cardWidth + cardSpacing)  // Better starting position
    const y = yPosition + row * (cardHeight + cardSpacing)

    // Simplified card design for better readability
    // Card background with clean border
    doc.setFillColor(255, 255, 255)
    doc.roundedRect(x, y, cardWidth, cardHeight, 8, 8, 'F')
    
    // Single subtle border
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(1)
    doc.roundedRect(x, y, cardWidth, cardHeight, 8, 8, 'S')
    
    // Left colored accent bar
    doc.setFillColor(card.color[0], card.color[1], card.color[2])
    doc.roundedRect(x, y, 5, cardHeight, 8, 8, 'F')

    // Icon and text positioning - more organized
    doc.setTextColor(card.color[0], card.color[1], card.color[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(card.icon, x + 12, y + 12)
    
    // Card title - better positioning
    doc.setTextColor(grayText[0], grayText[1], grayText[2])
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(card.title, x + 12, y + 20)
    
    // Card value - larger and more prominent
    doc.setTextColor(30, 41, 59) // slate-800
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(card.value, x + 12, y + 30)
  }

  yPosition += 80  // Increased spacing after cards

  // Statistik dalam bentuk tabel
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2])
  doc.text('STATISTIK PELANGGARAN', 20, yPosition)
  yPosition += 8

  const statsData = [
    ['Metrik', 'Jumlah', 'Persentase'],
    ['Total Pelanggaran', reportData.stats.totalViolations.toString(), '100%'],
    ['Kasus Terselesaikan', reportData.stats.totalResolved.toString(), `${reportData.stats.resolutionRate}%`],
    ['Kasus Pending', reportData.stats.totalPending.toString(), `${100 - reportData.stats.resolutionRate}%`],
    ['Siswa Bermasalah', reportData.stats.totalProblemStudents.toString(), '-']
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [statsData[0]],
    body: statsData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    margin: { left: 20, right: 20 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // Tren Pelanggaran Mingguan
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2])
  doc.text('TREN PELANGGARAN MINGGUAN', 20, yPosition)
  yPosition += 8

  const weeklyData = [
    ['Minggu', 'Total Pelanggaran', 'Terselesaikan', 'Pending'],
    ...reportData.monthlyData.map(week => [
      week.week,
      week.violations.toString(),
      week.resolved.toString(),
      week.pending.toString()
    ])
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [weeklyData[0]],
    body: weeklyData.slice(1),
    theme: 'striped',
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    margin: { left: 20, right: 20 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    doc.addPage()
    yPosition = 20
  }

  // Distribusi Jenis Pelanggaran
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2])
  doc.text('DISTRIBUSI JENIS PELANGGARAN', 20, yPosition)
  yPosition += 8

  const violationTypeData = [
    ['Jenis Pelanggaran', 'Jumlah Kasus', 'Persentase'],
    ...reportData.violationsByType.map(violation => [
      violation.type,
      violation.count.toString(),
      `${violation.percentage}%`
    ])
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [violationTypeData[0]],
    body: violationTypeData.slice(1),
    theme: 'striped',
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    margin: { left: 20, right: 20 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // Check if we need a new page
  if (yPosition > pageHeight - 80) {
    doc.addPage()
    yPosition = 20
  }

  // Analisis Pelanggaran per Kelas
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2])
  doc.text('ANALISIS PELANGGARAN PER KELAS', 20, yPosition)
  yPosition += 8

  const classData = [
    ['Kelas', 'Total Pelanggaran', 'Rata-rata per Siswa'],
    ...reportData.violationsByClass.map((classItem: any) => [
      classItem.class,
      classItem.violations.toString(),
      classItem.avgViolationsPerStudent.toFixed(1)
    ])
  ]

  autoTable(doc, {
    startY: yPosition,
    head: [classData[0]],
    body: classData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    margin: { left: 20, right: 20 }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 20

  // Check if we need a new page for recommendations
  if (yPosition > pageHeight - 100) {
    doc.addPage()
    yPosition = 30
  }

  // Rekomendasi dengan styling yang lebih baik
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2])
  doc.text('REKOMENDASI', 25, yPosition)
  yPosition += 12

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(grayText[0], grayText[1], grayText[2])

  const recommendations = []

  // Generate recommendations based on data
  if (reportData.stats.resolutionRate < 80) {
    recommendations.push('• Perlu peningkatan efektivitas penanganan kasus pelanggaran.')
  }

  if (reportData.stats.avgViolationsPerStudent > 2.5) {
    recommendations.push('• Diperlukan program bimbingan konseling yang lebih intensif.')
  }

  const highRiskClasses = reportData.violationsByClass.filter((c: any) => c.avgViolationsPerStudent >= 3.0)
  if (highRiskClasses.length > 0) {
    recommendations.push(`• Fokus perhatian khusus pada kelas: ${highRiskClasses.map((c: any) => c.class).join(', ')}.`)
  }

  const topViolation = reportData.violationsByType[0]
  if (topViolation) {
    recommendations.push(`• Program pencegahan khusus untuk "${topViolation.type}" yang menjadi pelanggaran terbanyak.`)
  }

  recommendations.push('• Evaluasi rutin sistem tata tertib dan sanksi yang berlaku.')
  recommendations.push('• Koordinasi dengan wali kelas untuk monitoring siswa bermasalah.')

  recommendations.forEach(rec => {
    const lines = doc.splitTextToSize(rec, pageWidth - 60)  // Better margin
    lines.forEach((line: string) => {
      doc.text(line, 30, yPosition)  // Better left margin
      yPosition += 6  // Better line spacing
    })
    yPosition += 3  // Space between recommendations
  })

  // Modern Footer with design consistency
  const footerY = pageHeight - 40
  
  // Footer background bar
  doc.setFillColor(248, 250, 252) // slate-50
  doc.rect(0, footerY - 5, pageWidth, 40, 'F')
  
  // Green accent line at top of footer
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
  doc.rect(0, footerY - 5, pageWidth, 2, 'F')
  
  // Footer content
  doc.setFontSize(10)
  doc.setTextColor(grayText[0], grayText[1], grayText[2])
  doc.text('Laporan dibuat secara otomatis oleh Sistem Informasi Pelanggaran Siswa', 20, footerY + 5)
  doc.text('SMK Taman Siswa 2 Jakarta', 20, footerY + 12)
  
  // Date information
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Dicetak pada: ${currentDate}`, 20, footerY + 19)
  
  // Page number with modern styling
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`Halaman 1`, pageWidth - 20, footerY + 8, { align: 'right' })

  // Modern signature area with better positioning
  const signatureY = footerY - 35
  
  // Signature background
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(pageWidth - 80, signatureY - 10, 70, 40, 3, 3, 'F')
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.roundedRect(pageWidth - 80, signatureY - 10, 70, 40, 3, 3, 'S')
  
  doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2])
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Mengetahui,', pageWidth - 75, signatureY)
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Kepala Sekolah', pageWidth - 75, signatureY + 6)
  
  // Signature line
  doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
  doc.setLineWidth(0.5)
  doc.line(pageWidth - 75, signatureY + 20, pageWidth - 15, signatureY + 20)

  // Save the PDF with updated filename
  const fileName = `Laporan_Bulanan_SMK_Taman_Siswa_2_${monthNames[reportData.period.month]}_${reportData.period.year}.pdf`
  doc.save(fileName)
}
