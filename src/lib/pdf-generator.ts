import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

async function fetchImageAsBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url)
        if (!response.ok) return null
        
        const blob = await response.blob()
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.error('Error fetching image:', error)
        return null
    }
}

interface CaseDataForPDF {
    id: string
    caseNumber: string
    description: string
    violationDate: Date
    status: string
    classLevel: string
    createdAt: Date
    student: {
        name: string
        nis: string
        major: string | null
        gender: string | null
        birthDate: Date | null
        address: string | null
        photo: string | null
    }
    violation: {
        name: string
        points: string
        category: {
            name: string
            level: string
        }
    }
    violationType: {
        id: string
        description: string
    } | null
    inputBy: {
        name: string
        email: string | null
    }
    actions: Array<{
        id: string
        description: string
        actionDate: Date
        followUpDate: Date | null
        isCompleted: boolean
        notes: string | null
        createdAt: Date
        evidenceUrls: string[]
        sanctionType: {
            name: string
            level: string
            duration: number | null
        } | null
        actionBy: {
            name: string
        }
    }>
}

export async function generateCasePDF(caseData: CaseDataForPDF) {
    const doc = new jsPDF('p', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)
    let yPosition = margin

    const addPageIfNeeded = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
            return true
        }
        return false
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatDateTime = (date: Date) => {
        return new Date(date).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    doc.setFillColor(220, 38, 38)
    doc.rect(0, 0, pageWidth, 35, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('LAPORAN KASUS PELANGGARAN', pageWidth / 2, 15, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Sistem Informasi Manajemen Pelanggaran Siswa', pageWidth / 2, 23, { align: 'center' })
    doc.text(caseData.caseNumber, pageWidth / 2, 29, { align: 'center' })

    yPosition = 45

    doc.setTextColor(0, 0, 0)
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(margin, yPosition, contentWidth, 8, 2, 2, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('INFORMASI SISWA', margin + 3, yPosition + 5.5)
    yPosition += 12

    if (caseData.student.photo) {
        addPageIfNeeded(60)
        const photoBase64 = await fetchImageAsBase64(caseData.student.photo)
        if (photoBase64) {
            try {
                const imgWidth = 40
                const imgHeight = 50
                const xPos = margin + (contentWidth - imgWidth) / 2
                
                doc.addImage(photoBase64, 'JPEG', xPos, yPosition, imgWidth, imgHeight)
                yPosition += imgHeight + 8
                
                doc.setFontSize(9)
                doc.setFont('helvetica', 'italic')
                doc.setTextColor(100, 116, 139)
                doc.text('Foto Siswa', pageWidth / 2, yPosition, { align: 'center' })
                yPosition += 8
                doc.setTextColor(0, 0, 0)
                doc.setFont('helvetica', 'normal')
            } catch (error) {
                console.error('Error adding student photo:', error)
            }
        }
    }

    const studentInfo = [
        ['Nama Lengkap', caseData.student.name],
        ['NIS', caseData.student.nis],
        ['Kelas', caseData.classLevel + (caseData.student.major ? ` - ${caseData.student.major}` : '')],
        ['Jenis Kelamin', caseData.student.gender || '-'],
        ['Tanggal Lahir', caseData.student.birthDate ? formatDate(caseData.student.birthDate) : '-'],
        ['Alamat', caseData.student.address || '-']
    ]

    autoTable(doc, {
        startY: yPosition,
        head: [],
        body: studentInfo,
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [229, 231, 235],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40, textColor: [71, 85, 105] },
            1: { cellWidth: contentWidth - 40, textColor: [15, 23, 42] }
        },
        margin: { left: margin, right: margin }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

    addPageIfNeeded(50)

    doc.setFillColor(254, 242, 242)
    doc.roundedRect(margin, yPosition, contentWidth, 8, 2, 2, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(185, 28, 28)
    doc.text('INFORMASI PELANGGARAN', margin + 3, yPosition + 5.5)
    yPosition += 12

    doc.setTextColor(0, 0, 0)
    const violationInfo = [
        ['Jenis Pelanggaran', caseData.violation.name],
        ['Kategori', caseData.violation.category.name],
        ['Tipe Pelanggaran', caseData.violationType?.description || '-'],
        ['Tingkat', caseData.violation.category.level],
        ['Poin/SP', caseData.violation.points],
        ['Tanggal Pelanggaran', formatDate(caseData.violationDate)],
        ['Status Kasus', caseData.status],
        ['Deskripsi', caseData.description]
    ]

    autoTable(doc, {
        startY: yPosition,
        head: [],
        body: violationInfo,
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [229, 231, 235],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40, textColor: [71, 85, 105] },
            1: { cellWidth: contentWidth - 40, textColor: [15, 23, 42] }
        },
        margin: { left: margin, right: margin }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

    addPageIfNeeded(40)

    doc.setFillColor(240, 253, 244)
    doc.roundedRect(margin, yPosition, contentWidth, 8, 2, 2, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(21, 128, 61)
    doc.text('PELAPOR', margin + 3, yPosition + 5.5)
    yPosition += 12

    doc.setTextColor(0, 0, 0)
    const reporterInfo = [
        ['Nama Pelapor', caseData.inputBy.name],
        ['Email', caseData.inputBy.email || '-'],
        ['Tanggal Laporan', formatDateTime(caseData.createdAt)]
    ]

    autoTable(doc, {
        startY: yPosition,
        head: [],
        body: reporterInfo,
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [229, 231, 235],
            lineWidth: 0.1
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40, textColor: [71, 85, 105] },
            1: { cellWidth: contentWidth - 40, textColor: [15, 23, 42] }
        },
        margin: { left: margin, right: margin }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10

    if (caseData.actions && caseData.actions.length > 0) {
        addPageIfNeeded(60)

        doc.setFillColor(239, 246, 255)
        doc.roundedRect(margin, yPosition, contentWidth, 8, 2, 2, 'F')
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(29, 78, 216)
        doc.text('RIWAYAT TINDAKAN', margin + 3, yPosition + 5.5)
        yPosition += 12

        doc.setTextColor(0, 0, 0)

        for (let index = 0; index < caseData.actions.length; index++) {
            const action = caseData.actions[index]
            addPageIfNeeded(50)

            doc.setFillColor(248, 250, 252)
            doc.roundedRect(margin, yPosition, contentWidth, 6, 1, 1, 'F')
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(`Tindakan ${index + 1}`, margin + 3, yPosition + 4)
            yPosition += 9

            const actionInfo = [
                ['Jenis Sanksi', action.sanctionType?.name || '-'],
                ['Tingkat Sanksi', action.sanctionType?.level || '-'],
                ['Durasi', action.sanctionType?.duration ? `${action.sanctionType.duration} hari` : '-'],
                ['Deskripsi', action.description],
                ['Tanggal Tindakan', formatDateTime(action.createdAt)],
                ['Petugas', action.actionBy.name],
                ['Status', action.isCompleted ? 'Selesai' : 'Belum Selesai']
            ]

            if (action.followUpDate) {
                actionInfo.push(['Follow-up', formatDate(action.followUpDate)])
            }

            if (action.notes) {
                actionInfo.push(['Catatan', action.notes])
            }

            autoTable(doc, {
                startY: yPosition,
                head: [],
                body: actionInfo,
                theme: 'plain',
                styles: {
                    fontSize: 9,
                    cellPadding: 2.5,
                    lineColor: [229, 231, 235],
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { fontStyle: 'bold', cellWidth: 35, textColor: [71, 85, 105] },
                    1: { cellWidth: contentWidth - 35, textColor: [15, 23, 42] }
                },
                margin: { left: margin, right: margin }
            })

            yPosition = (doc as any).lastAutoTable.finalY + 6

            if (action.evidenceUrls && action.evidenceUrls.length > 0) {
                addPageIfNeeded(80)
                
                doc.setFontSize(9)
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(71, 85, 105)
                doc.text('Bukti Tindakan:', margin, yPosition)
                yPosition += 6

                const imageWidth = (contentWidth - 5) / 2
                const imageHeight = imageWidth * 0.75
                let col = 0
                
                for (const evidenceUrl of action.evidenceUrls) {
                    const imageBase64 = await fetchImageAsBase64(evidenceUrl)
                    if (imageBase64) {
                        try {
                            const xPos = margin + (col * (imageWidth + 5))
                            
                            if (col === 0 && yPosition + imageHeight > pageHeight - margin) {
                                doc.addPage()
                                yPosition = margin
                            }
                            
                            doc.addImage(imageBase64, 'JPEG', xPos, yPosition, imageWidth, imageHeight)
                            
                            col++
                            if (col >= 2) {
                                col = 0
                                yPosition += imageHeight + 5
                            }
                        } catch (error) {
                            console.error('Error adding evidence photo:', error)
                        }
                    }
                }
                
                if (col > 0) {
                    yPosition += imageHeight + 5
                }
                
                yPosition += 3
                doc.setTextColor(0, 0, 0)
                doc.setFont('helvetica', 'normal')
            }
        }
    } else {
        addPageIfNeeded(20)
        
        doc.setFillColor(248, 250, 252)
        doc.roundedRect(margin, yPosition, contentWidth, 8, 2, 2, 'F')
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 116, 139)
        doc.text('RIWAYAT TINDAKAN', margin + 3, yPosition + 5.5)
        yPosition += 12

        doc.setFontSize(10)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(148, 163, 184)
        doc.text('Belum ada tindakan yang dicatat untuk kasus ini.', margin + 3, yPosition)
        yPosition += 10
    }

    const footerY = pageHeight - 15
    doc.setDrawColor(229, 231, 235)
    doc.line(margin, footerY, pageWidth - margin, footerY)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(`Dokumen dicetak pada: ${formatDateTime(new Date())}`, margin, footerY + 5)
    doc.text('Sistem Informasi Manajemen Pelanggaran Siswa', pageWidth - margin, footerY + 5, { align: 'right' })

    const filename = `Kasus_${caseData.caseNumber.replace(/\//g, '_')}_${caseData.student.name.replace(/\s/g, '_')}.pdf`
    doc.save(filename)
}
